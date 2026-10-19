import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";

import { dbPool } from "@/lib/db";
import { createIntegritySignature, verifyWompiEvent, type WompiEvent } from "./wompi-signatures";

const checkoutSchema = z
  .object({
    nombre: z.string().trim().min(2).max(100),
    correo: z.string().trim().email().max(150),
    celular: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/),
    direccion: z.string().trim().min(5).max(255),
    ciudad: z.string().trim().min(2).max(100),
    departamento: z.string().trim().min(2).max(100),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1)
      .max(30),
  })
  .strict();

type CheckoutInput = z.infer<typeof checkoutSchema>;

interface WompiConfig {
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
  environment: "sandbox" | "production";
  appUrl: URL;
}

interface ProductRow extends RowDataPacket {
  id: number;
  precio: string;
}

interface PaymentRow extends RowDataPacket {
  transaction_id: number;
  pedido_id: number;
  transaction_status: "pendiente" | "aprobada" | "rechazada" | "reembolsada";
  transaction_amount: string;
}

interface OrderStatusRow extends RowDataPacket {
  pedido_estado: string;
  pago_estado: string;
}

interface WompiTransaction {
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: string;
}

const ORDER_REFERENCE_PATTERN = /^PP-[a-f\d]{32}$/i;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_ORDER_AMOUNT_IN_CENTS = 999_999_999_999;

class CheckoutError extends Error {}
class CheckoutConfigurationError extends CheckoutError {}

function getWompiConfig(): WompiConfig {
  const publicKey = process.env["WOMPI_PUBLIC_KEY"];
  const integritySecret = process.env["WOMPI_INTEGRITY_SECRET"];
  const eventsSecret = process.env["WOMPI_EVENTS_SECRET"];
  const environment = process.env["WOMPI_ENVIRONMENT"] ?? "sandbox";
  const configuredAppUrl = process.env["APP_BASE_URL"];

  if (!publicKey || !integritySecret || !eventsSecret || !configuredAppUrl) {
    throw new CheckoutConfigurationError("Faltan variables requeridas para habilitar Wompi.");
  }
  if (environment !== "sandbox" && environment !== "production") {
    throw new CheckoutConfigurationError("WOMPI_ENVIRONMENT debe ser sandbox o production.");
  }

  let appUrl: URL;
  try {
    appUrl = new URL(configuredAppUrl);
  } catch {
    throw new CheckoutConfigurationError("APP_BASE_URL no es una URL válida.");
  }
  if (
    (environment === "production" && appUrl.protocol !== "https:") ||
    (environment === "production" && ["localhost", "127.0.0.1"].includes(appUrl.hostname)) ||
    (appUrl.protocol !== "https:" &&
      !(environment === "sandbox" && ["localhost", "127.0.0.1"].includes(appUrl.hostname))) ||
    appUrl.username !== "" ||
    appUrl.password !== "" ||
    appUrl.search !== "" ||
    appUrl.hash !== ""
  ) {
    throw new CheckoutConfigurationError(
      "APP_BASE_URL debe usar HTTPS fuera del entorno local de pruebas.",
    );
  }

  return { publicKey, integritySecret, eventsSecret, environment, appUrl };
}

function buildCheckoutUrl(config: WompiConfig, reference: string, amountInCents: number): string {
  const redirectUrl = new URL("/", config.appUrl);
  redirectUrl.searchParams.set("wompi_reference", reference);

  const checkoutUrl = new URL("https://checkout.wompi.co/p/");
  checkoutUrl.searchParams.set("public-key", config.publicKey);
  checkoutUrl.searchParams.set("currency", "COP");
  checkoutUrl.searchParams.set("amount-in-cents", String(amountInCents));
  checkoutUrl.searchParams.set("reference", reference);
  checkoutUrl.searchParams.set(
    "signature:integrity",
    createIntegritySignature(reference, amountInCents, config.integritySecret),
  );
  checkoutUrl.searchParams.set("redirect-url", redirectUrl.toString());
  return checkoutUrl.toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEvent(value: unknown): WompiEvent | null {
  if (!isRecord(value)) return null;
  const data = value["data"];
  const signature = value["signature"];
  if (!isRecord(data) || !isRecord(signature)) return null;
  const properties = signature["properties"];
  const checksum = signature["checksum"];
  const event = value["event"];
  const environment = value["environment"];
  const timestamp = value["timestamp"];
  if (
    typeof event !== "string" ||
    typeof environment !== "string" ||
    !Array.isArray(properties) ||
    !properties.every((property) => typeof property === "string") ||
    typeof checksum !== "string" ||
    typeof timestamp !== "number"
  ) {
    return null;
  }

  return {
    event,
    data,
    environment,
    signature: { properties, checksum },
    timestamp,
  };
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    throw new CheckoutError("El cuerpo de la solicitud es demasiado grande.");
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    throw new CheckoutError("El cuerpo de la solicitud es demasiado grande.");
  }
  return JSON.parse(body) as unknown;
}

async function startWompiCheckout(input: CheckoutInput, config: WompiConfig) {
  const aggregatedItems = new Map<number, number>();
  for (const item of input.items) {
    aggregatedItems.set(item.productId, (aggregatedItems.get(item.productId) ?? 0) + item.quantity);
  }
  if ([...aggregatedItems.values()].some((quantity) => quantity > 20)) {
    throw new CheckoutError("La cantidad máxima por producto es 20.");
  }

  const productIds = [...aggregatedItems.keys()];
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    const placeholders = productIds.map(() => "?").join(", ");
    const [products] = await connection.execute<ProductRow[]>(
      `SELECT id, CAST(precio AS CHAR) AS precio
       FROM productos
       WHERE id IN (${placeholders})
       FOR UPDATE`,
      productIds,
    );
    if (products.length !== productIds.length) {
      throw new CheckoutError("Uno o más productos del carrito ya no están disponibles.");
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const lines = productIds.map((productId) => {
      const product = productById.get(productId);
      if (!product) throw new CheckoutError("No se pudo verificar un producto del carrito.");
      const unitPrice = Number(product.precio);
      const unitAmountInCents = Math.round(unitPrice * 100);
      if (!Number.isSafeInteger(unitAmountInCents) || unitAmountInCents <= 0) {
        throw new CheckoutError("Un producto tiene un precio no válido.");
      }
      return {
        productId,
        quantity: aggregatedItems.get(productId) ?? 0,
        unitPrice,
        unitAmountInCents,
      };
    });

    const amountInCents = lines.reduce(
      (total, line) => total + line.unitAmountInCents * line.quantity,
      0,
    );
    if (
      !Number.isSafeInteger(amountInCents) ||
      amountInCents <= 0 ||
      amountInCents > MAX_ORDER_AMOUNT_IN_CENTS
    ) {
      throw new CheckoutError("El total del pedido no es válido.");
    }
    const totalCOP = amountInCents / 100;
    const reference = `PP-${randomUUID().replaceAll("-", "")}`;
    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO pedidos
         (usuario_id, estado, total, comprador_nombre, comprador_correo, comprador_celular,
          direccion_envio, ciudad_envio, departamento_envio, referencia_pago)
       VALUES (NULL, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        totalCOP,
        input.nombre,
        input.correo.toLowerCase(),
        input.celular,
        input.direccion,
        input.ciudad,
        input.departamento,
        reference,
      ],
    );

    const detailValues = lines.flatMap((line) => [
      orderResult.insertId,
      line.productId,
      line.quantity,
      line.unitPrice,
    ]);
    const detailRows = lines.map(() => "(?, ?, ?, ?)").join(", ");
    await connection.execute(
      `INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario)
       VALUES ${detailRows}`,
      detailValues,
    );
    await connection.execute(
      `INSERT INTO transacciones
         (pedido_id, referencia_externa, metodo_pago, estado, monto)
       VALUES (?, ?, 'pasarela', 'pendiente', ?)`,
      [orderResult.insertId, reference, totalCOP],
    );
    await connection.commit();

    return {
      reference,
      checkoutUrl: buildCheckoutUrl(config, reference, amountInCents),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function processWompiEvent(event: WompiEvent, config: WompiConfig): Promise<void> {
  const expectedEnvironment = config.environment === "production" ? "prod" : "test";
  if (event.environment !== expectedEnvironment) {
    throw new Error("El entorno de la notificación no coincide con la configuración.");
  }
  if (!verifyWompiEvent(event, config.eventsSecret)) {
    throw new Error("La firma de la notificación no es válida.");
  }
  if (event.event !== "transaction.updated") return;

  const transaction = event.data["transaction"];
  if (
    !isRecord(transaction) ||
    typeof transaction["reference"] !== "string" ||
    typeof transaction["amount_in_cents"] !== "number" ||
    !Number.isSafeInteger(transaction["amount_in_cents"]) ||
    transaction["currency"] !== "COP" ||
    typeof transaction["status"] !== "string" ||
    !ORDER_REFERENCE_PATTERN.test(transaction["reference"])
  ) {
    throw new Error("La transacción notificada no tiene datos válidos.");
  }

  const reference = transaction["reference"];
  const amountInCents = transaction["amount_in_cents"];
  const status = transaction["status"];
  if (
    typeof reference !== "string" ||
    typeof amountInCents !== "number" ||
    typeof status !== "string"
  ) {
    throw new Error("La transacción notificada no tiene datos válidos.");
  }
  const data: WompiTransaction = {
    reference,
    amount_in_cents: amountInCents,
    currency: "COP",
    status,
  };
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<PaymentRow[]>(
      `SELECT t.id AS transaction_id, t.pedido_id, t.estado AS transaction_status,
              CAST(t.monto AS CHAR) AS transaction_amount
       FROM transacciones t
       WHERE t.referencia_externa = ?
       FOR UPDATE`,
      [data.reference],
    );
    const payment = rows[0];
    if (!payment) throw new Error("No existe una transacción local para esta referencia.");

    const expectedAmountInCents = Math.round(Number(payment.transaction_amount) * 100);
    if (expectedAmountInCents !== data.amount_in_cents) {
      throw new Error("El monto de la transacción no coincide con el pedido.");
    }

    const mappedStatus =
      data.status === "APPROVED"
        ? "aprobada"
        : ["DECLINED", "ERROR", "VOIDED"].includes(data.status)
          ? "rechazada"
          : "pendiente";

    if (payment.transaction_status === "pendiente" && mappedStatus !== "pendiente") {
      await connection.execute(
        "UPDATE transacciones SET estado = ? WHERE id = ? AND estado = 'pendiente'",
        [mappedStatus, payment.transaction_id],
      );
      await connection.execute(
        "UPDATE pedidos SET estado = ? WHERE id = ? AND estado = 'pendiente'",
        [mappedStatus === "aprobada" ? "confirmado" : "cancelado", payment.pedido_id],
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function handleWompiApiRequest(request: Request): Promise<Response | null> {
  const { pathname, searchParams } = new URL(request.url);

  if (pathname === "/api/checkout/wompi" && request.method === "POST") {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) {
      return jsonResponse({ error: "Origen de solicitud no permitido." }, 403);
    }
    try {
      const payload = checkoutSchema.parse(await readJsonBody(request));
      const config = getWompiConfig();
      const checkout = await startWompiCheckout(payload, config);
      return jsonResponse(checkout, 201);
    } catch (error) {
      console.error("No se pudo iniciar el checkout de Wompi.", error);
      const isValidationError = error instanceof z.ZodError;
      const isConfigurationError = error instanceof CheckoutConfigurationError;
      const isClientError = error instanceof CheckoutError;
      return jsonResponse(
        {
          error: isValidationError
            ? "Verifica los datos de contacto y los productos del carrito."
            : isConfigurationError
              ? "El pago en línea aún no está configurado. Inténtalo más tarde."
              : error instanceof CheckoutError
                ? error.message
                : "No se pudo iniciar el pago. Inténtalo de nuevo.",
        },
        isValidationError || (isClientError && !isConfigurationError)
          ? 400
          : isConfigurationError
            ? 503
            : 500,
      );
    }
  }

  if (pathname === "/api/wompi/events" && request.method === "POST") {
    try {
      const rawEvent = await readJsonBody(request);
      const event = parseEvent(rawEvent);
      if (!event) return jsonResponse({ error: "Notificación no válida." }, 400);
      const headerChecksum = request.headers.get("x-event-checksum");
      if (
        headerChecksum &&
        headerChecksum.toLowerCase() !== event.signature.checksum.toLowerCase()
      ) {
        return jsonResponse({ error: "Firma de notificación no válida." }, 401);
      }
      await processWompiEvent(event, getWompiConfig());
      return jsonResponse({ received: true });
    } catch (error) {
      console.error("No se pudo procesar el evento de Wompi.", error);
      const invalidSignature =
        error instanceof Error &&
        (error.message.includes("firma") || error.message.includes("entorno"));
      const invalidRequest =
        error instanceof SyntaxError ||
        (error instanceof CheckoutError && !(error instanceof CheckoutConfigurationError));
      return jsonResponse(
        { error: "No se pudo validar la notificación de pago." },
        invalidSignature ? 401 : invalidRequest ? 400 : 500,
      );
    }
  }

  if (pathname === "/api/wompi/status" && request.method === "GET") {
    const reference = searchParams.get("reference") ?? "";
    if (!ORDER_REFERENCE_PATTERN.test(reference)) {
      return jsonResponse({ error: "Referencia de pedido no válida." }, 400);
    }
    try {
      const [rows] = await dbPool.execute<OrderStatusRow[]>(
        `SELECT p.estado AS pedido_estado, t.estado AS pago_estado
         FROM pedidos p
         JOIN transacciones t ON t.pedido_id = p.id
         WHERE p.referencia_pago = ?
         LIMIT 1`,
        [reference],
      );
      const order = rows[0];
      if (!order) return jsonResponse({ error: "No se encontró el pedido." }, 404);
      return jsonResponse({
        status:
          order.pago_estado === "aprobada"
            ? "approved"
            : order.pago_estado === "rechazada"
              ? "rejected"
              : "pending",
      });
    } catch (error) {
      console.error("No se pudo consultar el estado del pedido.", error);
      return jsonResponse({ error: "No se pudo consultar el estado del pago." }, 500);
    }
  }

  if (
    pathname === "/api/checkout/wompi" ||
    pathname === "/api/wompi/events" ||
    pathname === "/api/wompi/status"
  ) {
    return new Response(null, {
      status: 405,
      headers: { allow: pathname === "/api/wompi/status" ? "GET" : "POST" },
    });
  }

  return null;
}

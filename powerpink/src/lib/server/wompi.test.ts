import { afterEach, describe, expect, it, vi } from "vitest";

import { handleWompiApiRequest } from "./wompi";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("Wompi API handlers", () => {
  it("does not create an order when payment credentials are missing", async () => {
    vi.stubEnv("WOMPI_PUBLIC_KEY", "");
    vi.stubEnv("WOMPI_INTEGRITY_SECRET", "");
    vi.stubEnv("WOMPI_EVENTS_SECRET", "");
    vi.stubEnv("APP_BASE_URL", "");
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const request = new Request("http://localhost:8080/api/checkout/wompi", {
      method: "POST",
      headers: {
        origin: "http://localhost:8080",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        nombre: "Cliente de prueba",
        correo: "cliente@example.com",
        celular: "3001234567",
        direccion: "Calle 10 # 20-30",
        ciudad: "Bogotá",
        departamento: "Cundinamarca",
        items: [{ productId: 1, quantity: 1 }],
      }),
    });

    const response = await handleWompiApiRequest(request);
    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toMatchObject({
      error: "El pago en línea aún no está configurado. Inténtalo más tarde.",
    });
  });

  it("rejects invalid payment references without querying the database", async () => {
    const request = new Request("http://localhost:8080/api/wompi/status?reference=invalid");
    const response = await handleWompiApiRequest(request);

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toMatchObject({
      error: "Referencia de pedido no válida.",
    });
  });
});

import {
  useEffect,
  useState,
  type FormEventHandler,
  type SetStateAction,
  type Dispatch,
} from "react";
import { PENDING_CHECKOUT_STORAGE_KEY } from "@/config/constants";
import type { DatosComprador, ItemCarrito } from "@/types";

interface UseCheckoutOptions {
  carrito: ItemCarrito[];
  setCarrito: Dispatch<SetStateAction<ItemCarrito[]>>;
  carritoCargado: boolean;
  datosComprador: DatosComprador;
}

export function useCheckout({
  carrito,
  setCarrito,
  carritoCargado,
  datosComprador,
}: UseCheckoutOptions) {
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutStatusMessage, setCheckoutStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!carritoCargado) return;
    const url = new URL(window.location.href);
    const reference = url.searchParams.get("wompi_reference");
    if (!reference) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    setCheckoutStatusMessage("Estamos verificando el estado de tu pago.");

    const pollPaymentStatus = async () => {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/wompi/status?reference=${encodeURIComponent(reference)}`,
          { cache: "no-store" },
        );
        const result: unknown = await response.json();
        if (
          !response.ok ||
          typeof result !== "object" ||
          result === null ||
          !("status" in result)
        ) {
          throw new Error("No se pudo consultar el estado del pago.");
        }
        if (cancelled) return;

        if (result.status === "approved") {
          let pendingCheckout: { reference?: unknown; cartSnapshot?: unknown } | null = null;
          try {
            const savedCheckout = window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
            if (savedCheckout) {
              const parsedCheckout: unknown = JSON.parse(savedCheckout);
              if (
                typeof parsedCheckout === "object" &&
                parsedCheckout !== null &&
                "reference" in parsedCheckout &&
                "cartSnapshot" in parsedCheckout
              ) {
                pendingCheckout = {
                  reference: parsedCheckout.reference,
                  cartSnapshot: parsedCheckout.cartSnapshot,
                };
              }
            }
          } catch (error) {
            console.error("No se pudo recuperar el carrito asociado al pago.", error);
          }
          const currentCartSnapshot = JSON.stringify(
            carrito.map(({ producto, cantidad }) => ({
              productId: producto.id,
              quantity: cantidad,
            })),
          );
          if (
            pendingCheckout?.reference === reference &&
            pendingCheckout.cartSnapshot === currentCartSnapshot
          ) {
            setCarrito([]);
          }
          try {
            window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
          } catch (error) {
            console.error("No se pudo limpiar la referencia de pago guardada.", error);
          }
          url.searchParams.delete("wompi_reference");
          url.searchParams.delete("id");
          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );
          setCheckoutStatusMessage(
            "¡Pago aprobado! Tu pedido quedó confirmado y pronto nos pondremos en contacto.",
          );
          return;
        }
        if (result.status === "rejected") {
          try {
            window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
          } catch (error) {
            console.error("No se pudo limpiar la referencia de pago guardada.", error);
          }
          url.searchParams.delete("wompi_reference");
          url.searchParams.delete("id");
          window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
          );
          setCheckoutStatusMessage(
            "El pago no fue aprobado. Puedes revisar el método de pago e intentarlo nuevamente.",
          );
          return;
        }
        if (attempts >= 10) {
          setCheckoutStatusMessage(
            "El pago sigue pendiente de confirmación. Puedes volver a consultar más tarde.",
          );
          return;
        }
        timeoutId = setTimeout(() => void pollPaymentStatus(), 3000);
      } catch (error) {
        console.error("No se pudo verificar el resultado del pago.", error);
        if (!cancelled) {
          setCheckoutStatusMessage(
            "No pudimos consultar el estado del pago. Inténtalo de nuevo más tarde.",
          );
        }
      }
    };

    void pollPaymentStatus();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [carrito, carritoCargado, setCarrito]);

  const iniciarCheckout: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setCheckoutSubmitting(true);
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout/wompi", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...datosComprador,
          items: carrito.map(({ producto, cantidad }) => ({
            productId: producto.id,
            quantity: cantidad,
          })),
        }),
      });
      const result: unknown = await response.json();
      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("checkoutUrl" in result) ||
        typeof result.checkoutUrl !== "string" ||
        !("reference" in result) ||
        typeof result.reference !== "string"
      ) {
        const errorMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "No se pudo iniciar el pago. Inténtalo de nuevo.";
        throw new Error(errorMessage);
      }

      try {
        window.sessionStorage.setItem(
          PENDING_CHECKOUT_STORAGE_KEY,
          JSON.stringify({
            reference: result.reference,
            cartSnapshot: JSON.stringify(
              carrito.map(({ producto, cantidad }) => ({
                productId: producto.id,
                quantity: cantidad,
              })),
            ),
          }),
        );
      } catch (error) {
        console.error("No se pudo guardar el carrito asociado al pago.", error);
      }
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error("No se pudo iniciar el pago.", error);
      setCheckoutError(
        error instanceof Error ? error.message : "No se pudo iniciar el pago. Inténtalo de nuevo.",
      );
      setCheckoutSubmitting(false);
    }
  };

  return { checkoutSubmitting, checkoutError, checkoutStatusMessage, iniciarCheckout };
}

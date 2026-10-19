import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, FREE_SHIPPING_THRESHOLD_COP } from "@/config/constants";
import { useCart } from "@/hooks/useCart";
import type { ProductoDTO } from "@/types";

const producto: ProductoDTO = {
  id: 7,
  nombre: "Calza Power Pink",
  precioCOP: 75_000,
  categoria: "Ropa Deportiva",
  descripcion: "Calza deportiva",
  precioFormateado: "$ 75.000",
};
const productos = [producto];

describe("useCart", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("adds products, updates quantities, totals and persists the cart", async () => {
    const { result } = renderHook(() => useCart({ productos, catalogoDisponible: true }));
    await waitFor(() => expect(result.current.carritoCargado).toBe(true));

    act(() => {
      result.current.agregarProductos([producto, producto]);
    });

    expect(result.current.carrito).toEqual([{ producto, cantidad: 2 }]);
    expect(result.current.totalItemsCarrito).toBe(2);
    expect(result.current.precioTotalCOP).toBe(FREE_SHIPPING_THRESHOLD_COP);
    expect(result.current.porcentajeEnvioGratis).toBe(100);
    await waitFor(() =>
      expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe(
        JSON.stringify([{ productId: producto.id, quantity: 2 }]),
      ),
    );

    act(() => {
      result.current.cambiarCantidad(producto.id, -2);
    });
    expect(result.current.carrito).toEqual([]);
    expect(result.current.faltaParaEnvioGratis).toBe(FREE_SHIPPING_THRESHOLD_COP);
  });

  it("restores valid products from storage and skips missing products", async () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productId: producto.id, quantity: 3 },
        { productId: 999, quantity: 1 },
        { productId: producto.id, quantity: 0 },
      ]),
    );

    const { result } = renderHook(() => useCart({ productos, catalogoDisponible: true }));
    await waitFor(() => expect(result.current.carritoCargado).toBe(true));

    expect(result.current.carrito).toEqual([{ producto, cantidad: 3 }]);
    expect(result.current.precioTotalCOP).toBe(225_000);
    expect(result.current.porcentajeEnvioGratis).toBe(100);
  });
});

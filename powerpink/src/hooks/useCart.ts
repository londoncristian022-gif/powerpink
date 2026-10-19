import { useEffect, useMemo, useState } from "react";
import { CART_STORAGE_KEY, FREE_SHIPPING_THRESHOLD_COP } from "@/config/constants";
import type { ItemCarrito, ProductoDTO } from "@/types";

interface UseCartOptions {
  productos: ProductoDTO[];
  catalogoDisponible: boolean;
}

export function useCart({ productos, catalogoDisponible }: UseCartOptions) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoCargado, setCarritoCargado] = useState(false);
  const [almacenamientoDisponible, setAlmacenamientoDisponible] = useState(true);
  const [avisoAlmacenamiento, setAvisoAlmacenamiento] = useState<string | null>(null);

  useEffect(() => {
    if (!catalogoDisponible || carritoCargado) return;
    try {
      const carritoGuardado = window.localStorage.getItem(CART_STORAGE_KEY);
      if (carritoGuardado) {
        const datosGuardados: unknown = JSON.parse(carritoGuardado);
        if (!Array.isArray(datosGuardados)) {
          throw new Error("El formato guardado del carrito no es válido.");
        }

        const productosPorId = new Map(productos.map((producto) => [producto.id, producto]));
        const carritoRestaurado = datosGuardados.flatMap((item: unknown) => {
          if (
            typeof item !== "object" ||
            item === null ||
            !("productId" in item) ||
            !("quantity" in item) ||
            typeof item.productId !== "number" ||
            typeof item.quantity !== "number" ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
          ) {
            return [];
          }
          const producto = productosPorId.get(item.productId);
          return producto ? [{ producto, cantidad: item.quantity }] : [];
        });
        setCarrito(carritoRestaurado);
      }
    } catch (error) {
      console.error("No se pudo recuperar el carrito guardado.", error);
      setAlmacenamientoDisponible(false);
      setAvisoAlmacenamiento(
        "No se pudo recuperar el carrito guardado. El carrito estará disponible solo durante esta sesión.",
      );
    } finally {
      setCarritoCargado(true);
    }
  }, [carritoCargado, catalogoDisponible, productos]);

  useEffect(() => {
    if (!carritoCargado || !almacenamientoDisponible) return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(
          carrito.map(({ producto, cantidad }) => ({
            productId: producto.id,
            quantity: cantidad,
          })),
        ),
      );
    } catch (error) {
      console.error("No se pudo guardar el carrito en este navegador.", error);
      setAlmacenamientoDisponible(false);
      setAvisoAlmacenamiento(
        "No se pudo guardar el carrito en este navegador. Los cambios se conservarán solo durante esta sesión.",
      );
    }
  }, [almacenamientoDisponible, carrito, carritoCargado]);

  const totalItemsCarrito = useMemo(
    () => carrito.reduce((total, item) => total + item.cantidad, 0),
    [carrito],
  );
  const precioTotalCOP = useMemo(
    () => carrito.reduce((total, item) => total + item.producto.precioCOP * item.cantidad, 0),
    [carrito],
  );
  const faltaParaEnvioGratis = Math.max(0, FREE_SHIPPING_THRESHOLD_COP - precioTotalCOP);
  const porcentajeEnvioGratis = Math.min(100, (precioTotalCOP / FREE_SHIPPING_THRESHOLD_COP) * 100);

  const agregarProductos = (productosAAgregar: ProductoDTO[]) => {
    setCarrito((prev) =>
      productosAAgregar.reduce((carritoActual, producto) => {
        const existe = carritoActual.find((item) => item.producto.id === producto.id);
        return existe
          ? carritoActual.map((item) =>
              item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
            )
          : [...carritoActual, { producto, cantidad: 1 }];
      }, prev),
    );
  };

  const cambiarCantidad = (id: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id !== id) return item;
          const cantidad = item.cantidad + delta;
          return cantidad > 0 ? { ...item, cantidad } : null;
        })
        .filter((item): item is ItemCarrito => item !== null),
    );
  };

  return {
    carrito,
    setCarrito,
    carritoCargado,
    totalItemsCarrito,
    precioTotalCOP,
    faltaParaEnvioGratis,
    porcentajeEnvioGratis,
    avisoAlmacenamiento,
    agregarProductos,
    cambiarCantidad,
  };
}

import { createServerFn } from "@tanstack/react-start";
import type { ProductoDTO } from "@/types";

export type ProductosResult =
  { success: true; data: ProductoDTO[] } | { success: false; error: string };

export const getProductos = createServerFn({ method: "GET" }).handler(
  async (): Promise<ProductosResult> => {
    try {
      const { listarProductos } = await import("@/lib/server/productos");
      return { success: true, data: await listarProductos() };
    } catch (error) {
      console.error("Error al consultar la base de datos power_pink:", error);
      return {
        success: false,
        error: "Ocurrió un error al cargar el catálogo de productos. Por favor, intenta de nuevo.",
      };
    }
  },
);

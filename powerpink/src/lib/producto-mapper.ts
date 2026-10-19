import type { ProductoDTO } from "@/types";

const formatCOP = (amount: number): string =>
  `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount)} COP`;

export function normalizarProductoBD(value: unknown, index: number): ProductoDTO {
  if (typeof value !== "object" || value === null) {
    throw new Error(`El producto ${index + 1} de la base de datos no tiene un formato válido.`);
  }

  const row = value as Record<string, unknown>;
  const id = typeof row["id"] === "number" ? row["id"] : Number(row["id"]);
  const precio = typeof row["precio"] === "number" ? row["precio"] : Number(row["precio"]);
  const categoria = normalizeCategory(row["categoria"]);
  const imagen = row["imagen"];
  const descripcion = row["descripcion"];
  const imagenUrl =
    typeof imagen === "string" && (/^https?:\/\//i.test(imagen) || imagen.startsWith("/"))
      ? imagen
      : undefined;

  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof row["nombre"] !== "string" ||
    row["nombre"].trim() === "" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    categoria === null ||
    (descripcion !== null && typeof descripcion !== "string") ||
    (imagen !== undefined && typeof imagen !== "string")
  ) {
    throw new Error(`El producto ${index + 1} de la base de datos no cumple el contrato esperado.`);
  }

  return {
    id,
    nombre: row["nombre"],
    precioCOP: precio,
    descripcion,
    precioFormateado: formatCOP(precio),
    categoria,
    ...(imagenUrl ? { imagenUrl } : {}),
  };
}

function normalizeCategory(value: unknown): ProductoDTO["categoria"] | null {
  switch (value) {
    case "Cuidado Capilar":
    case "cuidado_capilar":
      return "Cuidado Capilar";
    case "Ropa Deportiva":
    case "ropa_deportiva":
      return "Ropa Deportiva";
    default:
      return null;
  }
}

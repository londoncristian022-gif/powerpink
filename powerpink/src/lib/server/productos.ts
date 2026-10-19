import type { RowDataPacket } from "mysql2/promise";

import { dbPool } from "@/lib/db";
import { normalizarProductoBD } from "@/lib/producto-mapper";
import type { ProductoDTO } from "@/types";

export async function listarProductos(): Promise<ProductoDTO[]> {
  const [rows] = await dbPool.execute<RowDataPacket[]>(
    `SELECT id, nombre, descripcion, precio, categoria, imagen
     FROM productos
     WHERE categoria IN (?, ?)
     ORDER BY id DESC`,
    ["ropa_deportiva", "cuidado_capilar"],
  );

  return rows.map(normalizarProductoBD);
}

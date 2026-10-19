export interface Producto {
  id: number;
  nombre: string;
  precioCOP: number;
  categoria: "Cuidado Capilar" | "Ropa Deportiva";
  imagenUrl?: string;
  destacado?: boolean;
}

export interface ProductoDTO extends Producto {
  descripcion: string | null;
  precioFormateado: string;
}

export interface ItemCarrito {
  producto: ProductoDTO;
  cantidad: number;
}

export interface Resena {
  id: number;
  nombre: string;
  comentario: string;
  calificacion: number;
  fecha: string;
}

export interface DatosComprador {
  nombre: string;
  correo: string;
  celular: string;
  direccion: string;
  ciudad: string;
  departamento: string;
}

export type SubcategoriaRopa = keyof typeof import("@/config/constants").CLOTHING_SUBCATEGORIES;
export type SubcategoriaCuidado =
  keyof typeof import("@/config/constants").PERSONAL_CARE_SUBCATEGORIES;
export type SubcategoriaRutina =
  (typeof import("@/config/constants").ROUTINE_SUBCATEGORIES)[number];

import { describe, expect, it } from "vitest";

import { normalizarProductoBD } from "@/lib/producto-mapper";

describe("normalizarProductoBD", () => {
  it("adapta una fila del esquema SQL al modelo del catálogo", () => {
    expect(
      normalizarProductoBD(
        {
          id: 1,
          nombre: "Top Deportivo",
          descripcion: null,
          precio: "89900.00",
          categoria: "ropa_deportiva",
          imagen: "top_pink.jpg",
        },
        0,
      ),
    ).toEqual({
      id: 1,
      nombre: "Top Deportivo",
      descripcion: null,
      precioCOP: 89900,
      precioFormateado: "$ 89.900 COP",
      categoria: "Ropa Deportiva",
    });
  });

  it("conserva solo las URLs de imagen utilizables por el navegador", () => {
    expect(
      normalizarProductoBD(
        {
          id: 1,
          nombre: "Top Deportivo",
          descripcion: null,
          precio: "89900.00",
          categoria: "ropa_deportiva",
          imagen: "/images/top_pink.jpg",
        },
        0,
      ).imagenUrl,
    ).toBe("/images/top_pink.jpg");
  });

  it("rechaza las filas que no cumplen el contrato del catálogo", () => {
    expect(() => normalizarProductoBD({ id: 1, precio: "no-es-un-precio" }, 0)).toThrow(
      "El producto 1 de la base de datos no cumple el contrato esperado.",
    );
  });

  it("normaliza categorías de SQL de cuidado capilar", () => {
    expect(
      normalizarProductoBD(
        {
          id: 2,
          nombre: "Shampoo",
          descripcion: null,
          precio: 45000,
          categoria: "cuidado_capilar",
        },
        1,
      ).categoria,
    ).toBe("Cuidado Capilar");
  });
});

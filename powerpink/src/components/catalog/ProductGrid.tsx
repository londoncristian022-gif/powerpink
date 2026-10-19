import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import bundle from "@/assets/bundle.jpg";
import hero from "@/assets/hero.jpg";
import type { ProductoDTO } from "@/types";

interface ProductGridProps {
  productos: ProductoDTO[];
  onAdd: (producto: ProductoDTO) => void;
  emptyMessage?: string;
}

export function ProductGrid({ productos, onAdd, emptyMessage }: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <p className="py-8 text-sm text-[#5A524C]">
        {emptyMessage ?? "Próximamente habrá productos en esta categoría."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {productos.map((producto) => (
        <Card
          key={producto.id}
          className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] shadow-sm transition-shadow hover:shadow-md"
        >
          <div>
            <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-t-2xl bg-[#E8E2D5]">
              <img
                src={
                  producto.imagenUrl || (producto.categoria === "Cuidado Capilar" ? bundle : hero)
                }
                alt={producto.nombre}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src =
                    producto.categoria === "Cuidado Capilar" ? bundle : hero;
                }}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {producto.destacado && (
                <Badge className="absolute left-3 top-3 border-none bg-[#FDFBF7]/95 text-[#E03590]">
                  Favorito
                </Badge>
              )}
            </div>
            <CardContent className="px-4 pb-2 pt-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#786F68]">
                {producto.categoria}
              </span>
              <CardTitle className="mt-1 text-sm font-bold text-[#241E1B]">
                {producto.nombre}
              </CardTitle>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs text-[#5A524C]">
                {producto.descripcion || "Descripción no disponible."}
              </p>
              <p className="mt-2 text-sm font-extrabold text-[#241E1B]">
                {producto.precioFormateado}
              </p>
            </CardContent>
          </div>
          <CardFooter className="px-4 pb-4 pt-2">
            <Button
              type="button"
              onClick={() => onAdd(producto)}
              className="w-full bg-[#E03590] text-xs font-semibold text-white hover:bg-[#C82A7C]"
            >
              Lo quiero
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import type { ProductoDTO, SubcategoriaCuidado, SubcategoriaRopa } from "@/types";

interface CatalogSectionProps {
  productos: ProductoDTO[];
  error: string | null;
  ropaFiltrada: ProductoDTO[];
  cuidadoFiltrado: ProductoDTO[];
  subcategoriaRopa: SubcategoriaRopa | null;
  subcategoriaCuidado: SubcategoriaCuidado | null;
  onResetRopa: () => void;
  onResetCuidado: () => void;
  onAdd: (producto: ProductoDTO) => void;
}

export function CatalogSection({
  productos,
  error,
  ropaFiltrada,
  cuidadoFiltrado,
  subcategoriaRopa,
  subcategoriaCuidado,
  onResetRopa,
  onResetCuidado,
  onAdd,
}: CatalogSectionProps) {
  return (
    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#E8E2D5] pb-6 md:flex-row md:items-end">
        <div>
          <span className="mb-3 inline-flex items-center space-x-1.5 rounded-full border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#E03590]">
            <span className="size-1.5 rounded-full bg-[#E03590]" />
            <span>Selección Exclusiva</span>
          </span>
          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#241E1B] md:text-4xl">
            Las favoritas de la comunidad
          </h2>
          <p className="mt-2 max-w-xl text-xs font-light leading-relaxed text-[#786F68] md:text-sm">
            Piezas de alto rendimiento y productos esenciales seleccionados para acompañar tu estilo
            de vida activo.
          </p>
        </div>
        <div className="self-start md:self-end">
          <span className="rounded-lg border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-1.5 text-xs font-semibold text-[#241E1B]">
            Ropa y cuidado
          </span>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : productos.length === 0 ? (
        <p className="py-8 text-sm text-[#5A524C]">No hay productos disponibles por el momento.</p>
      ) : (
        <div className="space-y-12">
          <section id="ropa" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[#241E1B]">
                {subcategoriaRopa ? `Ropa deportiva · ${subcategoriaRopa}` : "Ropa deportiva"}
              </h3>
              {subcategoriaRopa && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onResetRopa}
                  className="h-auto px-2 py-1 text-xs text-[#E03590] hover:bg-[#F2ECE1]"
                >
                  Ver toda la ropa
                </Button>
              )}
            </div>
            <ProductGrid
              productos={ropaFiltrada}
              onAdd={onAdd}
              emptyMessage="No hay productos de ropa para esta subcategoría por el momento."
            />
          </section>
          <section id="cuidado" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[#241E1B]">
                {subcategoriaCuidado
                  ? `Cuidado capilar · ${subcategoriaCuidado}`
                  : "Cuidado capilar"}
              </h3>
              {subcategoriaCuidado && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onResetCuidado}
                  className="h-auto px-2 py-1 text-xs text-[#E03590] hover:bg-[#F2ECE1]"
                >
                  Ver todo el cuidado
                </Button>
              )}
            </div>
            <ProductGrid
              productos={cuidadoFiltrado}
              onAdd={onAdd}
              emptyMessage="No hay productos de cuidado para esta subcategoría por el momento."
            />
          </section>
        </div>
      )}
    </section>
  );
}

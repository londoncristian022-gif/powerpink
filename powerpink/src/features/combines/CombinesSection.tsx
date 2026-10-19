import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import bundle from "@/assets/bundle.jpg";
import { formatCOP } from "@/config/constants";
import type { ProductoDTO } from "@/types";

interface CombinesSectionProps {
  ropa: ProductoDTO[];
  cuidado: ProductoDTO[];
  productoRopaSeleccionado?: ProductoDTO | undefined;
  productoCuidadoSeleccionado?: ProductoDTO | undefined;
  onSelectRopa: (id: number) => void;
  onSelectCuidado: (id: number) => void;
  onAddCombination: () => void;
}

export function CombinesSection({
  ropa,
  cuidado,
  productoRopaSeleccionado,
  productoCuidadoSeleccionado,
  onSelectRopa,
  onSelectCuidado,
  onAddCombination,
}: CombinesSectionProps) {
  return (
    <section id="combos" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16">
      <div className="rounded-3xl border border-[#E8E2D5] bg-[#F2ECE1] p-6 md:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="aspect-square overflow-hidden rounded-2xl border border-[#E8E2D5] lg:col-span-5">
            <img
              src={bundle}
              alt="Ideas de combinación de ropa y cuidado Power Pink"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6 lg:col-span-7">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E03590]">
                Combines para tu rutina
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-[#241E1B] sm:text-3xl">
                Ropa + cuidado, pensados para ir juntos
              </h2>
              <p className="mt-2 text-sm text-[#5A524C]">
                Explora nuestras opciones preconfiguradas o elige productos del catálogo para crear
                tu propia combinación.
              </p>
            </div>
            <div className="space-y-3" aria-label="Combines preconfigurados">
              <article className="flex items-start gap-4 rounded-2xl border border-[#E3DCCE] bg-[#FDFBF7] p-4 transition-colors hover:border-[#E03590]">
                <span className="shrink-0 self-start rounded-lg bg-[#D8E2DC] px-2.5 py-1 text-xs font-bold text-[#5A6B47]">
                  -15%
                </span>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#241E1B]">
                    Kit Piel que Respira
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#786F68]">
                    Conjunto + bruma facial post-sudor. La ropa te sostiene; la bruma calma tu piel.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-4 rounded-2xl border border-[#E3DCCE] bg-[#FDFBF7] p-4 transition-colors hover:border-[#E03590]">
                <span className="shrink-0 self-start rounded-lg bg-[#D8E2DC] px-2.5 py-1 text-xs font-bold text-[#5A6B47]">
                  -20%
                </span>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#241E1B]">Rutina Recupera</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#786F68]">
                    Calza de compresión + suplemento de magnesio + rodillo. Entrena hoy, rinde
                    mañana.
                  </p>
                </div>
              </article>
              <article className="flex items-start gap-4 rounded-2xl border border-[#E3DCCE] bg-[#FDFBF7] p-4 transition-colors hover:border-[#E03590]">
                <span className="shrink-0 self-start rounded-lg bg-[#D8E2DC] px-2.5 py-1 text-xs font-bold text-[#5A6B47]">
                  Regalo
                </span>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#241E1B]">
                    Ciclo en Equilibrio
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#786F68]">
                    Calza a prueba de fugas + kit de higiene íntima. Entrena todos los días del mes.
                  </p>
                </div>
              </article>
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#241E1B]">
              Crea tu combinación personalizada
            </h3>
            <div className="space-y-3">
              <label className="block rounded-xl border border-[#E3DCCE] bg-[#FDFBF7] p-4">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#E03590]">
                  Ropa deportiva
                </span>
                <select
                  aria-label="Seleccionar prenda para la combinación"
                  value={productoRopaSeleccionado?.id ?? ""}
                  onChange={(event) => onSelectRopa(Number(event.target.value))}
                  disabled={ropa.length === 0}
                  className="w-full bg-transparent text-sm font-semibold text-[#241E1B] outline-none disabled:text-[#786F68]"
                >
                  {ropa.length === 0 ? (
                    <option value="">No hay prendas disponibles</option>
                  ) : (
                    ropa.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} — {producto.precioFormateado}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block rounded-xl border border-[#E3DCCE] bg-[#FDFBF7] p-4">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-[#5A6B47]">
                  Cuidado capilar
                </span>
                <select
                  aria-label="Seleccionar producto de cuidado para la combinación"
                  value={productoCuidadoSeleccionado?.id ?? ""}
                  onChange={(event) => onSelectCuidado(Number(event.target.value))}
                  disabled={cuidado.length === 0}
                  className="w-full bg-transparent text-sm font-semibold text-[#241E1B] outline-none disabled:text-[#786F68]"
                >
                  {cuidado.length === 0 ? (
                    <option value="">No hay productos disponibles</option>
                  ) : (
                    cuidado.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} — {producto.precioFormateado}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[#5A524C]">
                Total de la combinación:{" "}
                <span className="font-extrabold text-[#241E1B]">
                  {formatCOP(
                    (productoRopaSeleccionado?.precioCOP ?? 0) +
                      (productoCuidadoSeleccionado?.precioCOP ?? 0),
                  )}
                </span>
              </p>
              <Button
                type="button"
                onClick={onAddCombination}
                disabled={ropa.length === 0 || cuidado.length === 0}
                className="bg-[#E03590] px-6 py-3 text-xs font-bold text-white hover:bg-[#C82A7C]"
              >
                <PlusCircle aria-hidden="true" className="mr-2 size-4" />
                Agregar combinación al carrito
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Dispatch, SetStateAction } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FREE_SHIPPING_THRESHOLD_COP,
  CLOTHING_SUBCATEGORIES,
  PERSONAL_CARE_SUBCATEGORIES,
  ROUTINE_SUBCATEGORIES,
  formatCOP,
} from "@/config/constants";
import type { SubcategoriaCuidado, SubcategoriaRopa, SubcategoriaRutina } from "@/types";

interface SiteHeaderProps {
  precioTotalCOP: number;
  faltaParaEnvioGratis: number;
  totalItemsCarrito: number;
  menuRopaOpen: boolean;
  setMenuRopaOpen: Dispatch<SetStateAction<boolean>>;
  menuCuidadoOpen: boolean;
  setMenuCuidadoOpen: Dispatch<SetStateAction<boolean>>;
  menuRutinasOpen: boolean;
  setMenuRutinasOpen: Dispatch<SetStateAction<boolean>>;
  subcategoriaSeleccionada: SubcategoriaRopa | null;
  setSubcategoriaSeleccionada: Dispatch<SetStateAction<SubcategoriaRopa | null>>;
  subcategoriaCuidadoSeleccionada: SubcategoriaCuidado | null;
  setSubcategoriaCuidadoSeleccionada: Dispatch<SetStateAction<SubcategoriaCuidado | null>>;
  rutinaSeleccionada: SubcategoriaRutina | null;
  setRutinaSeleccionada: Dispatch<SetStateAction<SubcategoriaRutina | null>>;
  onOpenCart: () => void;
}

export function SiteHeader({
  precioTotalCOP,
  faltaParaEnvioGratis,
  totalItemsCarrito,
  menuRopaOpen,
  setMenuRopaOpen,
  menuCuidadoOpen,
  setMenuCuidadoOpen,
  menuRutinasOpen,
  setMenuRutinasOpen,
  subcategoriaSeleccionada,
  setSubcategoriaSeleccionada,
  subcategoriaCuidadoSeleccionada,
  setSubcategoriaCuidadoSeleccionada,
  rutinaSeleccionada,
  setRutinaSeleccionada,
  onOpenCart,
}: SiteHeaderProps) {
  return (
    <>
      <div className="bg-[#5A6B47] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        {precioTotalCOP >= FREE_SHIPPING_THRESHOLD_COP ? (
          <span>
            Alcanzaste el monto anunciado para envío gratis. Aplican condiciones de entrega.
          </span>
        ) : (
          <span>
            Envíos gratis en compras superiores a $150.000 COP
            {precioTotalCOP > 0 &&
              ` (Agrega ${formatCOP(faltaParaEnvioGratis)} para alcanzar el umbral anunciado)`}
          </span>
        )}
      </div>

      <header className="sticky top-0 z-40 border-b border-[#E8E2D5] bg-[#FDFBF7]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <a
            href="/"
            className="text-xl font-extrabold tracking-tight text-[#241E1B]"
            aria-label="Power Pink, inicio"
          >
            POWER PINK <span className="text-[#E03590]">⚡</span>
          </a>
          <nav
            aria-label="Secciones del catálogo"
            className="hidden items-center gap-6 text-sm font-medium text-[#5A524C] md:flex"
          >
            <div
              className="relative py-2"
              onMouseEnter={() => {
                setMenuCuidadoOpen(false);
                setMenuRutinasOpen(false);
                setMenuRopaOpen(true);
              }}
              onMouseLeave={() => setMenuRopaOpen(false)}
              onBlur={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setMenuRopaOpen(false);
                }
              }}
            >
              <Button
                type="button"
                variant="ghost"
                aria-expanded={menuRopaOpen}
                aria-controls="menu-subcategorias-ropa"
                onClick={() => {
                  setMenuCuidadoOpen(false);
                  setMenuRutinasOpen(false);
                  setMenuRopaOpen((open) => !open);
                }}
                className="h-auto px-0 py-0 text-sm font-medium text-[#5A524C] hover:bg-transparent hover:text-[#E03590] focus-visible:text-[#E03590]"
              >
                Ropa
              </Button>
              {menuRopaOpen && (
                <div
                  id="menu-subcategorias-ropa"
                  className="absolute left-0 top-full z-50 w-48 space-y-1 rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-3 shadow-lg"
                >
                  <a
                    href="#ropa"
                    onClick={() => {
                      setSubcategoriaSeleccionada(null);
                      setMenuRopaOpen(false);
                    }}
                    className="block rounded-xl px-4 py-2 text-xs font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
                  >
                    Todas las prendas
                  </a>
                  {(Object.keys(CLOTHING_SUBCATEGORIES) as SubcategoriaRopa[]).map(
                    (subcategoria) => (
                      <a
                        key={subcategoria}
                        href="#ropa"
                        aria-current={
                          subcategoriaSeleccionada === subcategoria ? "true" : undefined
                        }
                        onClick={() => {
                          setSubcategoriaSeleccionada(subcategoria);
                          setMenuRopaOpen(false);
                        }}
                        className="block rounded-xl px-4 py-2 text-xs font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
                      >
                        {subcategoria}
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>
            <div
              className="relative py-2"
              onMouseEnter={() => {
                setMenuRopaOpen(false);
                setMenuRutinasOpen(false);
                setMenuCuidadoOpen(true);
              }}
              onMouseLeave={() => setMenuCuidadoOpen(false)}
              onBlur={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setMenuCuidadoOpen(false);
                }
              }}
            >
              <Button
                type="button"
                variant="ghost"
                aria-expanded={menuCuidadoOpen}
                aria-controls="menu-subcategorias-cuidado"
                onClick={() => {
                  setMenuRopaOpen(false);
                  setMenuRutinasOpen(false);
                  setMenuCuidadoOpen((open) => !open);
                }}
                className="h-auto px-0 py-0 text-sm font-medium text-[#5A524C] hover:bg-transparent hover:text-[#E03590] focus-visible:text-[#E03590]"
              >
                Cuidado
              </Button>
              {menuCuidadoOpen && (
                <div
                  id="menu-subcategorias-cuidado"
                  className="absolute left-0 top-full z-50 w-52 space-y-1 rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-3 shadow-lg"
                >
                  <a
                    href="#cuidado"
                    onClick={() => {
                      setSubcategoriaCuidadoSeleccionada(null);
                      setMenuCuidadoOpen(false);
                    }}
                    className="block rounded-xl px-4 py-2 text-xs font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
                  >
                    Todo el cuidado
                  </a>
                  {(Object.keys(PERSONAL_CARE_SUBCATEGORIES) as SubcategoriaCuidado[]).map(
                    (subcategoria) => (
                      <a
                        key={subcategoria}
                        href="#cuidado"
                        aria-current={
                          subcategoriaCuidadoSeleccionada === subcategoria ? "true" : undefined
                        }
                        onClick={() => {
                          setSubcategoriaCuidadoSeleccionada(subcategoria);
                          setMenuCuidadoOpen(false);
                        }}
                        className="block rounded-xl px-4 py-2 text-xs font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
                      >
                        {subcategoria}
                      </a>
                    ),
                  )}
                </div>
              )}
            </div>
            <div
              className="relative py-2"
              onMouseEnter={() => {
                setMenuRopaOpen(false);
                setMenuCuidadoOpen(false);
                setMenuRutinasOpen(true);
              }}
              onMouseLeave={() => setMenuRutinasOpen(false)}
              onBlur={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setMenuRutinasOpen(false);
                }
              }}
            >
              <Button
                type="button"
                variant="ghost"
                aria-expanded={menuRutinasOpen}
                aria-controls="menu-subcategorias-rutinas"
                onClick={() => {
                  setMenuRopaOpen(false);
                  setMenuCuidadoOpen(false);
                  setMenuRutinasOpen((open) => !open);
                }}
                className="h-auto px-0 py-0 text-sm font-medium text-[#5A524C] hover:bg-transparent hover:text-[#E03590] focus-visible:text-[#E03590]"
              >
                Rutinas
              </Button>
              {menuRutinasOpen && (
                <div
                  id="menu-subcategorias-rutinas"
                  className="absolute left-0 top-full z-50 w-44 space-y-1 rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-3 shadow-lg"
                >
                  {ROUTINE_SUBCATEGORIES.map((subcategoria) => (
                    <a
                      key={subcategoria}
                      href="#rutinas"
                      aria-current={rutinaSeleccionada === subcategoria ? "true" : undefined}
                      onClick={() => {
                        setRutinaSeleccionada(subcategoria);
                        setMenuRutinasOpen(false);
                      }}
                      className="block rounded-xl px-4 py-2 text-xs font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
                    >
                      {subcategoria}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a
              href="#combos"
              className="font-semibold text-[#E03590] transition-colors hover:text-[#C82A7C]"
            >
              Combines
            </a>
          </nav>
          <Button
            type="button"
            variant="outline"
            className="flex items-center space-x-1 rounded-full border-[#E3DCCE] bg-[#F2ECE1] px-4 py-2 text-sm font-medium text-[#241E1B] transition-colors hover:bg-[#E8E2D5] hover:text-[#E03590]"
            aria-label={`Abrir carrito, ${totalItemsCarrito} productos`}
            onClick={onOpenCart}
          >
            <ShoppingBag aria-hidden="true" className="size-4" />
            <span>Carrito</span>
            <span className="ml-1 rounded-full bg-[#E03590] px-2 py-0.5 text-xs font-bold text-white">
              {totalItemsCarrito}
            </span>
          </Button>
        </div>
      </header>
    </>
  );
}

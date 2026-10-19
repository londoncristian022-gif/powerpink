import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FREE_SHIPPING_THRESHOLD_COP, formatCOP } from "@/config/constants";
import type { ItemCarrito } from "@/types";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: ItemCarrito[];
  precioTotalCOP: number;
  faltaParaEnvioGratis: number;
  porcentajeEnvioGratis: number;
  onChangeQuantity: (id: number, delta: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  carrito,
  precioTotalCOP,
  faltaParaEnvioGratis,
  porcentajeEnvioGratis,
  onChangeQuantity,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full max-w-md flex-col overflow-hidden border-l border-[#E8E2D5] bg-[#FDFBF7] p-6 text-[#241E1B]">
        <div className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b border-[#E8E2D5] pb-4 pr-10 text-left">
            <SheetTitle className="font-serif text-xl font-bold">Tu carrito de compras</SheetTitle>
            <SheetDescription>
              Revisa tus productos y cantidades antes de continuar.
            </SheetDescription>
          </SheetHeader>

          <div className="shrink-0 space-y-1.5 border-b border-[#E8E2D5] py-4">
            <div className="flex justify-between text-xs">
              <span className="text-[#786F68]">Progreso hacia el umbral de envío gratis</span>
              <span className="font-bold text-[#E03590]">{porcentajeEnvioGratis.toFixed(0)}%</span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-[#E8E2D5]"
              role="progressbar"
              aria-label="Progreso hacia el umbral de envío gratis"
              aria-valuemin={0}
              aria-valuemax={FREE_SHIPPING_THRESHOLD_COP}
              aria-valuenow={Math.min(precioTotalCOP, FREE_SHIPPING_THRESHOLD_COP)}
            >
              <div
                className="h-full bg-[#E03590] transition-all duration-300"
                style={{ width: `${porcentajeEnvioGratis}%` }}
              />
            </div>
            <p className="pt-1 text-[11px] text-[#786F68]">
              {precioTotalCOP >= FREE_SHIPPING_THRESHOLD_COP
                ? "Alcanzaste el monto anunciado; consulta las condiciones de entrega."
                : `Agrega ${formatCOP(faltaParaEnvioGratis)} para alcanzar el umbral anunciado.`}
            </p>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4">
            {carrito.length === 0 ? (
              <p className="py-12 text-center text-xs text-[#786F68]">Tu carrito está vacío.</p>
            ) : (
              carrito.map((item) => (
                <div
                  key={item.producto.id}
                  className="flex items-center justify-between gap-4 border-b border-[#E8E2D5] pb-3"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold text-[#241E1B]">
                      {item.producto.nombre}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#786F68]">
                      {item.producto.precioFormateado} c/u
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center space-x-3 rounded-full border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Quitar una unidad de ${item.producto.nombre}`}
                      onClick={() => onChangeQuantity(item.producto.id, -1)}
                      className="h-auto p-0 text-xs font-bold text-[#786F68] hover:bg-transparent hover:text-[#241E1B]"
                    >
                      −
                    </Button>
                    <span
                      className="min-w-4 text-center text-xs font-bold text-[#241E1B]"
                      aria-label={`Cantidad: ${item.cantidad}`}
                    >
                      {item.cantidad}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Agregar una unidad de ${item.producto.nombre}`}
                      onClick={() => onChangeQuantity(item.producto.id, 1)}
                      className="h-auto p-0 text-xs font-bold text-[#786F68] hover:bg-transparent hover:text-[#241E1B]"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {carrito.length > 0 && (
          <div className="shrink-0 space-y-4 border-t border-[#E8E2D5] pt-4">
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <span className="text-xl font-extrabold text-[#E03590]">
                {formatCOP(precioTotalCOP)}
              </span>
            </div>
            <p className="text-[11px] text-[#786F68]">
              Paga en Wompi con los métodos habilitados para este comercio. El pedido se confirma
              cuando el pago sea aprobado.
            </p>
            <Button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-2xl bg-[#E03590] py-3.5 text-xs font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-[#C82A7C]"
            >
              Finalizar compra
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

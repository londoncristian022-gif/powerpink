import type { FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCOP } from "@/config/constants";
import type { DatosComprador } from "@/types";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datosComprador: DatosComprador;
  onChangeBuyerData: (field: keyof DatosComprador, value: string) => void;
  precioTotalCOP: number;
  carritoVacio: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function CheckoutModal({
  open,
  onOpenChange,
  datosComprador,
  onChangeBuyerData,
  precioTotalCOP,
  carritoVacio,
  submitting,
  error,
  onSubmit,
}: CheckoutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#E3DCCE] bg-[#FDFBF7] text-[#241E1B] sm:rounded-3xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-[#241E1B]">
              Finalizar compra
            </DialogTitle>
            <DialogDescription className="text-[#5A524C]">
              Ingresa tus datos de contacto y envío para continuar al checkout seguro de Wompi.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-[#5A524C] sm:col-span-2">
              Nombre completo
              <input
                name="nombre"
                value={datosComprador.nombre}
                onChange={(event) => onChangeBuyerData("nombre", event.target.value)}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
            <label className="text-xs font-medium text-[#5A524C]">
              Correo electrónico
              <input
                type="email"
                name="correo"
                value={datosComprador.correo}
                onChange={(event) => onChangeBuyerData("correo", event.target.value)}
                maxLength={150}
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
            <label className="text-xs font-medium text-[#5A524C]">
              Celular
              <input
                type="tel"
                name="celular"
                value={datosComprador.celular}
                onChange={(event) => onChangeBuyerData("celular", event.target.value)}
                pattern="[+]?[0-9 ()-]{7,20}"
                autoComplete="tel"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
            <label className="text-xs font-medium text-[#5A524C] sm:col-span-2">
              Dirección de envío
              <input
                name="direccion"
                value={datosComprador.direccion}
                onChange={(event) => onChangeBuyerData("direccion", event.target.value)}
                minLength={5}
                maxLength={255}
                autoComplete="street-address"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
            <label className="text-xs font-medium text-[#5A524C]">
              Ciudad
              <input
                name="ciudad"
                value={datosComprador.ciudad}
                onChange={(event) => onChangeBuyerData("ciudad", event.target.value)}
                minLength={2}
                maxLength={100}
                autoComplete="address-level2"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
            <label className="text-xs font-medium text-[#5A524C]">
              Departamento
              <input
                name="departamento"
                value={datosComprador.departamento}
                onChange={(event) => onChangeBuyerData("departamento", event.target.value)}
                minLength={2}
                maxLength={100}
                autoComplete="address-level1"
                required
                className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-3 py-2.5 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
              />
            </label>
          </div>
          <div className="rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] p-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Total del pedido:</span>
              <span className="text-[#E03590]">{formatCOP(precioTotalCOP)}</span>
            </div>
            <p className="mt-2 text-xs text-[#5A524C]">
              En Wompi podrás seleccionar Nequi, PSE u otro método habilitado para la cuenta del
              comercio. El total se valida nuevamente en el servidor.
            </p>
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="border-[#D5CEBF] bg-[#F2ECE1] text-[#241E1B] hover:bg-[#E8E2D5]"
            >
              Volver
            </Button>
            <Button
              type="submit"
              disabled={carritoVacio || submitting}
              className="bg-[#E03590] text-white hover:bg-[#C82A7C]"
            >
              {submitting ? "Conectando con Wompi..." : "Continuar a pagar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Badge } from "@/components/ui/badge";
import hero from "@/assets/hero.jpg";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-10 pt-6 md:pb-14">
      <div className="relative flex min-h-[480px] items-center justify-end overflow-hidden rounded-3xl border border-[#E8E2D5] bg-[#F2ECE1] p-6 shadow-sm md:min-h-[520px] md:p-12">
        <img
          src={hero}
          alt="Colección Power Pink"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#F2ECE1]/20 to-[#F2ECE1]/70" />
        <div className="relative z-10 max-w-md rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1]/95 p-6 shadow-md backdrop-blur-md sm:p-8 md:p-10">
          <Badge className="mb-3 rounded-full border-none bg-[#E8E2D5] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#E03590] hover:bg-[#E8E2D5]">
            Colección Power Pink
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight text-[#241E1B] md:text-4xl">
            Muévete fuerte.
            <br />
            Cuídate mejor.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#5A524C]">
            Ropa deportiva que te acompaña y productos de cuidado para tu estilo de vida activo.
            Todo en un solo lugar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#combos"
              className="rounded-xl bg-[#E03590] px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#C82A7C]"
            >
              Arma tu combinación
            </a>
            <a
              href="#rutinas"
              className="rounded-xl border border-[#D5CEBF] bg-transparent px-5 py-3 text-xs font-semibold text-[#241E1B] transition-colors hover:bg-[#E8E2D5]"
            >
              Descubre tu rutina
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

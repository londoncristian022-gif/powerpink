import { Button } from "@/components/ui/button";
import type { SubcategoriaRutina } from "@/types";

interface RoutineSectionProps {
  seleccionada: SubcategoriaRutina | null;
  onSelect: (rutina: SubcategoriaRutina | null) => void;
}

interface IdeaRutina {
  title: string;
  actividades: readonly SubcategoriaRutina[];
  text: string;
}

const IDEAS_RUTINA: IdeaRutina[] = [
  {
    title: "Yoga & Pilates",
    actividades: ["Yoga", "Pilates"],
    text: "Momentos de movimiento consciente y pausa.",
  },
  {
    title: "Fuerza & Gym",
    actividades: ["Gym"],
    text: "Arma un look cómodo para tu entrenamiento.",
  },
  {
    title: "Running",
    actividades: ["Running"],
    text: "Sal, explora y encuentra tu propio ritmo.",
  },
];

export function RoutineSection({ seleccionada, onSelect }: RoutineSectionProps) {
  return (
    <section id="rutinas" className="scroll-mt-24 border-y border-[#E8E2D5] bg-[#F2ECE1]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <span className="text-xs font-bold uppercase tracking-wider text-[#E03590]">
          Encuentra tu ritmo
        </span>
        <h2 className="mt-1 text-2xl font-extrabold text-[#241E1B]">
          Ideas para moverte a tu manera
        </h2>
        {seleccionada && (
          <div className="mt-3 flex items-center gap-3">
            <p className="text-sm text-[#5A524C]">Rutina seleccionada: {seleccionada}</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onSelect(null)}
              className="h-auto px-2 py-1 text-xs text-[#E03590] hover:bg-[#FDFBF7]"
            >
              Ver todas
            </Button>
          </div>
        )}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {IDEAS_RUTINA.filter(
            (idea) => !seleccionada || idea.actividades.includes(seleccionada),
          ).map((idea) => (
            <article
              key={idea.title}
              className="rounded-2xl border border-[#E3DCCE] bg-[#FDFBF7] p-6"
            >
              <h3 className="font-bold text-[#241E1B]">{idea.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A524C]">{idea.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

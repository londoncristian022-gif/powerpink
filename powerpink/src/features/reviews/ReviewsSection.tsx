import type { FormEventHandler } from "react";
import { Button } from "@/components/ui/button";
import type { Resena } from "@/types";

interface ReviewsSectionProps {
  resenas: Resena[];
  nombre: string;
  onNombreChange: (value: string) => void;
  comentario: string;
  onComentarioChange: (value: string) => void;
  calificacion: number;
  onCalificacionChange: (value: number) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function ReviewsSection({
  resenas,
  nombre,
  onNombreChange,
  comentario,
  onComentarioChange,
  calificacion,
  onCalificacionChange,
  onSubmit,
}: ReviewsSectionProps) {
  return (
    <section className="border-t border-[#E8E2D5] bg-[#FDFBF7]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E03590]">
            Experiencias
          </span>
          <h2 className="mt-1 text-2xl font-extrabold text-[#241E1B] sm:text-3xl">
            Comunidad Power Pink
          </h2>
          <p className="mt-2 text-xs text-[#5A524C]">
            Las opiniones que agregues aquí solo se muestran durante esta sesión de demostración.
          </p>
        </div>
        <form
          onSubmit={onSubmit}
          className="mx-auto mb-10 max-w-lg space-y-4 rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-6"
        >
          <h3 className="text-sm font-bold text-[#241E1B]">Escribe tu opinión</h3>
          <label className="block text-xs font-medium text-[#5A524C]">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(event) => onNombreChange(event.target.value)}
              maxLength={60}
              autoComplete="name"
              required
              placeholder="Tu nombre"
              className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#FDFBF7] px-3 py-2 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
            />
          </label>
          <fieldset>
            <legend className="mb-1 text-xs font-medium text-[#5A524C]">Calificación</legend>
            <div
              className="flex gap-1"
              role="group"
              aria-label="Calificación de una a cinco estrellas"
            >
              {[1, 2, 3, 4, 5].map((estrella) => (
                <button
                  key={estrella}
                  type="button"
                  aria-label={`${estrella} ${estrella === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={calificacion === estrella}
                  onClick={() => onCalificacionChange(estrella)}
                  className={`text-2xl transition-colors ${
                    estrella <= calificacion ? "text-amber-500" : "text-[#D5CEBF]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs font-medium text-[#5A524C]">
            Comentario
            <textarea
              value={comentario}
              onChange={(event) => onComentarioChange(event.target.value)}
              maxLength={500}
              rows={3}
              required
              placeholder="Comparte tu opinión"
              className="mt-1 w-full rounded-xl border border-[#E3DCCE] bg-[#FDFBF7] px-3 py-2 text-sm text-[#241E1B] outline-none focus:border-[#E03590]"
            />
          </label>
          <Button
            type="submit"
            className="w-full bg-[#E03590] text-xs font-semibold text-white hover:bg-[#C82A7C]"
          >
            Añadir opinión a esta sesión
          </Button>
        </form>
        {resenas.length === 0 ? (
          <p className="mx-auto max-w-xl rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-6 text-center text-sm leading-relaxed text-[#5A524C]">
            Aún no hay opiniones en esta sesión.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {resenas.map((resena) => (
              <article
                key={resena.id}
                className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-[#E3DCCE] bg-[#F2ECE1] p-6 text-center"
              >
                <p
                  className="mb-2 text-amber-500"
                  aria-label={`Calificación: ${resena.calificacion} de 5 estrellas`}
                >
                  {"★".repeat(resena.calificacion)}
                  <span className="text-[#D5CEBF]">{"★".repeat(5 - resena.calificacion)}</span>
                </p>
                <p className="text-sm italic text-[#5A524C]">{resena.comentario}</p>
                <p className="mt-3 text-xs font-semibold text-[#241E1B]">
                  {resena.nombre} · {resena.fecha}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

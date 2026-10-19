import { useState, type FormEvent } from "react";
import type { Resena } from "@/types";

export function useReviews() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [nombreResena, setNombreResena] = useState("");
  const [comentarioResena, setComentarioResena] = useState("");
  const [calificacionResena, setCalificacionResena] = useState(5);

  const publicarResena = (event: FormEvent<HTMLFormElement>): boolean => {
    event.preventDefault();
    const nombre = nombreResena.trim();
    const comentario = comentarioResena.trim();
    if (!nombre || !comentario) return false;

    setResenas((prev) => [
      {
        id: Date.now(),
        nombre,
        comentario,
        calificacion: calificacionResena,
        fecha: new Date().toLocaleDateString("es-CO"),
      },
      ...prev,
    ]);
    setNombreResena("");
    setComentarioResena("");
    setCalificacionResena(5);
    return true;
  };

  return {
    resenas,
    nombreResena,
    setNombreResena,
    comentarioResena,
    setComentarioResena,
    calificacionResena,
    setCalificacionResena,
    publicarResena,
  };
}

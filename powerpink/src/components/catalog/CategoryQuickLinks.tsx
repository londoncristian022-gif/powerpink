import { Activity, ArrowRight, Shirt, Sparkles } from "lucide-react";

const CATEGORIES = [
  {
    title: "Ropa deportiva",
    text: "Tops, conjuntos, leggings y chaquetas deportivas.",
    href: "#ropa",
    icon: Shirt,
  },
  {
    title: "Cuidado capilar",
    text: "Tónicos capilares, cuidado y reparación.",
    href: "#cuidado",
    icon: Sparkles,
  },
  {
    title: "Ideas de rutina",
    text: "Yoga, running, gym y pilates.",
    href: "#rutinas",
    icon: Activity,
  },
];

export function CategoryQuickLinks() {
  return (
    <section aria-label="Explora nuestras secciones" className="mx-auto max-w-7xl px-6 py-4">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <a
              key={category.title}
              href={category.href}
              className="flex h-44 flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-[#F2ECE1] p-6 transition-all hover:border-[#E03590]/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#241E1B]">{category.title}</h2>
                  <Icon aria-hidden="true" className="size-5 text-[#E03590]" />
                </div>
                <p className="mt-2 text-xs text-[#786F68]">{category.text}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#E03590]">
                Explorar catálogo <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

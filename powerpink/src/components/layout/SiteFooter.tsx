export function SiteFooter() {
  return (
    <footer className="bg-[#241E1B] py-12 text-[#D5CEBF]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 text-xs md:grid-cols-4">
        <div>
          <h2 className="mb-3 text-sm font-extrabold text-white">Power Pink ⚡</h2>
          <p className="leading-relaxed text-[#A8A095]">
            Ropa deportiva y productos de cuidado para acompañar tu estilo de vida activo.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">Catálogo</h3>
          <ul className="space-y-2 text-[#A8A095]">
            <li>
              <a href="#ropa" className="hover:text-white">
                Ropa deportiva
              </a>
            </li>
            <li>
              <a href="#cuidado" className="hover:text-white">
                Cuidado capilar
              </a>
            </li>
            <li>
              <a href="#combos" className="hover:text-white">
                Combines
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">Inspírate</h3>
          <ul className="space-y-2 text-[#A8A095]">
            <li>
              <a href="#rutinas" className="hover:text-white">
                Ideas de rutina
              </a>
            </li>
            <li>
              <a href="#catalogo" className="hover:text-white">
                Ver productos
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">Información</h3>
          <p className="leading-relaxed text-[#A8A095]">
            Los precios se muestran en pesos colombianos. Los pagos se procesan por Wompi y los
            pedidos se confirman únicamente al aprobarse la transacción.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-[#38302C] px-6 pt-6 text-center text-[11px] text-[#8C8377]">
        © 2026 Power Pink. Todos los derechos reservados.
      </div>
    </footer>
  );
}

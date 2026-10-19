import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CategoryQuickLinks } from "@/components/catalog/CategoryQuickLinks";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { RoutineSection } from "@/components/catalog/RoutineSection";
import { HeroSection } from "@/components/layout/HeroSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CLOTHING_SUBCATEGORIES, PERSONAL_CARE_SUBCATEGORIES } from "@/config/constants";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { CheckoutModal } from "@/features/cart/CheckoutModal";
import { CombinesSection } from "@/features/combines/CombinesSection";
import { ReviewsSection } from "@/features/reviews/ReviewsSection";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useReviews } from "@/hooks/useReviews";
import { getProductos } from "@/lib/productos";
import type {
  DatosComprador,
  ProductoDTO,
  SubcategoriaCuidado,
  SubcategoriaRopa,
  SubcategoriaRutina,
} from "@/types";

const PRODUCTOS_VACIOS: ProductoDTO[] = [];

export const Route = createFileRoute("/")({
  loader: () => getProductos(),
  head: () => ({
    meta: [
      { title: "Power Pink ⚡ | Catálogo Exclusivo" },
      {
        name: "description",
        content: "Ropa deportiva de alto rendimiento y fórmulas avanzadas para el cuidado capilar.",
      },
      { property: "og:title", content: "Power Pink ⚡ | Catálogo Exclusivo" },
      {
        property: "og:description",
        content: "Ropa deportiva y cuidado capilar en pesos colombianos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const loaderData = Route.useLoaderData();
  const productos = loaderData.success ? loaderData.data : PRODUCTOS_VACIOS;
  const {
    carrito,
    setCarrito,
    carritoCargado,
    totalItemsCarrito,
    precioTotalCOP,
    faltaParaEnvioGratis,
    porcentajeEnvioGratis,
    avisoAlmacenamiento,
    agregarProductos,
    cambiarCantidad,
  } = useCart({ productos, catalogoDisponible: loaderData.success });
  const {
    resenas,
    nombreResena,
    setNombreResena,
    comentarioResena,
    setComentarioResena,
    calificacionResena,
    setCalificacionResena,
    publicarResena: guardarResena,
  } = useReviews();
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [datosComprador, setDatosComprador] = useState<DatosComprador>({
    nombre: "",
    correo: "",
    celular: "",
    direccion: "",
    ciudad: "",
    departamento: "",
  });
  const { checkoutSubmitting, checkoutError, checkoutStatusMessage, iniciarCheckout } = useCheckout(
    {
      carrito,
      setCarrito,
      carritoCargado,
      datosComprador,
    },
  );
  const [menuRopaOpen, setMenuRopaOpen] = useState(false);
  const [menuCuidadoOpen, setMenuCuidadoOpen] = useState(false);
  const [menuRutinasOpen, setMenuRutinasOpen] = useState(false);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<SubcategoriaRopa | null>(
    null,
  );
  const [subcategoriaCuidadoSeleccionada, setSubcategoriaCuidadoSeleccionada] =
    useState<SubcategoriaCuidado | null>(null);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<SubcategoriaRutina | null>(null);
  const [ropaSeleccionadaId, setRopaSeleccionadaId] = useState<number | undefined>();
  const [cuidadoSeleccionadoId, setCuidadoSeleccionadoId] = useState<number | undefined>();
  const ropa = useMemo(
    () => productos.filter((producto) => producto.categoria === "Ropa Deportiva"),
    [productos],
  );
  const cuidado = useMemo(
    () => productos.filter((producto) => producto.categoria === "Cuidado Capilar"),
    [productos],
  );
  const ropaFiltrada = useMemo(() => {
    if (!subcategoriaSeleccionada) return ropa;
    const patron = CLOTHING_SUBCATEGORIES[subcategoriaSeleccionada];
    return ropa.filter((producto) =>
      patron.test(`${producto.nombre} ${producto.descripcion ?? ""}`),
    );
  }, [ropa, subcategoriaSeleccionada]);
  const cuidadoFiltrado = useMemo(() => {
    if (!subcategoriaCuidadoSeleccionada) return cuidado;
    const patron = PERSONAL_CARE_SUBCATEGORIES[subcategoriaCuidadoSeleccionada];
    return cuidado.filter((producto) =>
      patron.test(`${producto.nombre} ${producto.descripcion ?? ""}`),
    );
  }, [cuidado, subcategoriaCuidadoSeleccionada]);
  const productoRopaSeleccionado =
    ropa.find((producto) => producto.id === ropaSeleccionadaId) ?? ropa[0];
  const productoCuidadoSeleccionado =
    cuidado.find((producto) => producto.id === cuidadoSeleccionadoId) ?? cuidado[0];

  const agregarAlCarrito = async (producto: ProductoDTO) => {
    agregarProductos([producto]);
    await mostrarToast("¡Añadido al carrito!", `${producto.nombre} se agregó correctamente.`);
  };

  const agregarCombinacion = async () => {
    if (!productoRopaSeleccionado || !productoCuidadoSeleccionado) return;
    const productosCombinacion = [productoRopaSeleccionado, productoCuidadoSeleccionado];

    agregarProductos(productosCombinacion);
    await mostrarToast(
      "Combinación añadida",
      `Agregamos al carrito: ${productosCombinacion.map((producto) => producto.nombre).join(" y ")}.`,
    );
  };

  const mostrarToast = async (title: string, text: string) => {
    const { default: Swal } = await import("sweetalert2");
    await Swal.fire({
      icon: "success",
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const publicarResena = async (event: FormEvent<HTMLFormElement>) => {
    if (!guardarResena(event)) return;
    await mostrarToast(
      "Opinión añadida a la demostración",
      "Se muestra solo en esta sesión y no se publica en el sitio.",
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#241E1B] selection:bg-pink-100 selection:text-pink-600">
      <SiteHeader
        precioTotalCOP={precioTotalCOP}
        faltaParaEnvioGratis={faltaParaEnvioGratis}
        totalItemsCarrito={totalItemsCarrito}
        menuRopaOpen={menuRopaOpen}
        setMenuRopaOpen={setMenuRopaOpen}
        menuCuidadoOpen={menuCuidadoOpen}
        setMenuCuidadoOpen={setMenuCuidadoOpen}
        menuRutinasOpen={menuRutinasOpen}
        setMenuRutinasOpen={setMenuRutinasOpen}
        subcategoriaSeleccionada={subcategoriaSeleccionada}
        setSubcategoriaSeleccionada={setSubcategoriaSeleccionada}
        subcategoriaCuidadoSeleccionada={subcategoriaCuidadoSeleccionada}
        setSubcategoriaCuidadoSeleccionada={setSubcategoriaCuidadoSeleccionada}
        rutinaSeleccionada={rutinaSeleccionada}
        setRutinaSeleccionada={setRutinaSeleccionada}
        onOpenCart={() => setIsCarritoOpen(true)}
      />

      <main>
        {checkoutStatusMessage && (
          <p
            role="status"
            className="mx-auto mt-4 max-w-7xl rounded-xl border border-[#E3DCCE] bg-[#F2ECE1] px-6 py-3 text-sm text-[#5A524C]"
          >
            {checkoutStatusMessage}
          </p>
        )}
        {avisoAlmacenamiento && (
          <p role="status" className="mx-auto mt-4 max-w-7xl px-6 text-sm text-[#786F68]">
            {avisoAlmacenamiento}
          </p>
        )}
        <HeroSection />

        <CategoryQuickLinks />

        <CatalogSection
          productos={productos}
          error={loaderData.success ? null : loaderData.error}
          ropaFiltrada={ropaFiltrada}
          cuidadoFiltrado={cuidadoFiltrado}
          subcategoriaRopa={subcategoriaSeleccionada}
          subcategoriaCuidado={subcategoriaCuidadoSeleccionada}
          onResetRopa={() => setSubcategoriaSeleccionada(null)}
          onResetCuidado={() => setSubcategoriaCuidadoSeleccionada(null)}
          onAdd={agregarAlCarrito}
        />

        <RoutineSection seleccionada={rutinaSeleccionada} onSelect={setRutinaSeleccionada} />

        <CombinesSection
          ropa={ropa}
          cuidado={cuidado}
          productoRopaSeleccionado={productoRopaSeleccionado}
          productoCuidadoSeleccionado={productoCuidadoSeleccionado}
          onSelectRopa={setRopaSeleccionadaId}
          onSelectCuidado={setCuidadoSeleccionadoId}
          onAddCombination={agregarCombinacion}
        />

        <ReviewsSection
          resenas={resenas}
          nombre={nombreResena}
          onNombreChange={setNombreResena}
          comentario={comentarioResena}
          onComentarioChange={setComentarioResena}
          calificacion={calificacionResena}
          onCalificacionChange={setCalificacionResena}
          onSubmit={publicarResena}
        />
      </main>

      <SiteFooter />

      <CartDrawer
        open={isCarritoOpen}
        onOpenChange={setIsCarritoOpen}
        carrito={carrito}
        precioTotalCOP={precioTotalCOP}
        faltaParaEnvioGratis={faltaParaEnvioGratis}
        porcentajeEnvioGratis={porcentajeEnvioGratis}
        onChangeQuantity={cambiarCantidad}
        onCheckout={() => {
          setIsCarritoOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        datosComprador={datosComprador}
        onChangeBuyerData={(field, value) =>
          setDatosComprador((prev) => ({ ...prev, [field]: value }))
        }
        precioTotalCOP={precioTotalCOP}
        carritoVacio={carrito.length === 0}
        submitting={checkoutSubmitting}
        error={checkoutError}
        onSubmit={iniciarCheckout}
      />
    </div>
  );
}

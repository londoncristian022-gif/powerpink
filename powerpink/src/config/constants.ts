export const POWER_PINK_COLORS = {
  cream: "#FDFBF7",
  sand: "#F2ECE1",
  sage: "#5A6B47",
  pink: "#E03590",
  pinkHover: "#C82A7C",
  ink: "#241E1B",
  border: "#E3DCCE",
  borderSoft: "#E8E2D5",
  warmWhite: "#D5CEBF",
  sageTint: "#D8E2DC",
  muted: "#786F68",
  body: "#5A524C",
} as const;

export const FREE_SHIPPING_THRESHOLD_COP = 150_000;

export const CART_STORAGE_KEY = "power_pink_cart";
export const PENDING_CHECKOUT_STORAGE_KEY = "power_pink_pending_checkout";

export const CLOTHING_SUBCATEGORIES = {
  Calzas: /calza|legging|leggins|biker/i,
  Tops: /\btop\b/i,
  Conjuntos: /conjunto|set/i,
  Chaquetas: /chaqueta/i,
} as const;

export const PERSONAL_CARE_SUBCATEGORIES = {
  "Skincare deportivo": /skincare|piel|facial/i,
  Suplementos: /suplement|colágeno|magnesio|vitamina/i,
  "Higiene íntima": /íntim|intim|higiene/i,
  Recuperación: /recuper|post-entreno|post entreno/i,
} as const;

export const ROUTINE_SUBCATEGORIES = ["Yoga", "Running", "Gym", "Pilates"] as const;

export const formatCOP = (amount: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

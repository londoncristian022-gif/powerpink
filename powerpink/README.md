# Power Pink — Plataforma E-Commerce

Plataforma de comercio electrónico para ropa deportiva y productos de cuidado personal. Construida con renderizado del lado del servidor (SSR), una interfaz responsiva y checkout alojado por Wompi.

## Tecnologías

- **Framework:** TanStack Start y React
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Servidor de producción:** Nitro con runtime Node.js
- **Base de datos:** MySQL o MariaDB, mediante `mysql2`
- **Pagos:** Wompi Web Checkout para invitados
- **Persistencia del carrito:** `localStorage` del navegador
- **Pruebas:** Vitest y Testing Library

> PostgreSQL no está soportado por la implementación actual. La base de datos y las consultas están diseñadas para MySQL/MariaDB.

## Requisitos

- Node.js **20.19+** o **22.12+**
- npm
- MySQL o MariaDB

## Instalación local

1. Clona el repositorio y entra en la carpeta del proyecto:

   ```sh
   git clone <URL_DEL_REPOSITORIO>
   cd powerpink
   ```

2. Instala las dependencias:

   ```sh
   npm install
   ```

3. Crea el archivo local de variables a partir de la plantilla:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Edita `.env` con la configuración local de MySQL y, cuando vayas a probar pagos, las credenciales de Wompi Sandbox. No subas `.env` a Git.

5. Crea el esquema e importa los datos iniciales:

   ```sh
   mysql -u root -p < schema.sql
   ```

   En XAMPP también puedes importar `schema.sql` desde phpMyAdmin. El script crea la base de datos `power_pink`.

6. Inicia el servidor de desarrollo:

   ```sh
   npm run dev
   ```

   Abre la URL que muestre Vite (por defecto, `http://localhost:8080`).

## Variables de entorno

La aplicación carga `.env` al iniciar el servidor. La plantilla [`.env.example`](./.env.example) contiene los valores locales de ejemplo.

### Base de datos

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=power_pink
DB_USER=root
DB_PASSWORD=
```

Utiliza un usuario y una contraseña propios en entornos compartidos o de producción; no uses el usuario administrador de MySQL para la aplicación en producción.

### Wompi

```dotenv
WOMPI_ENVIRONMENT=sandbox
WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=
APP_BASE_URL=http://localhost:8080
```

- `WOMPI_ENVIRONMENT`: `sandbox` para pruebas o `production` para cobros reales.
- `WOMPI_PUBLIC_KEY`: llave pública del entorno seleccionado.
- `WOMPI_INTEGRITY_SECRET`: secreto usado por el servidor para firmar el checkout.
- `WOMPI_EVENTS_SECRET`: secreto para verificar la firma de los eventos recibidos.
- `APP_BASE_URL`: URL base de la aplicación. En producción debe ser una URL pública con HTTPS.

El flujo actual no necesita `WOMPI_PRIVATE_KEY`. No publiques secretos, no los incluyas en variables `VITE_*` y no los compartas en código, capturas o conversaciones.

## Base de datos y migraciones

`schema.sql` define el esquema para una instalación nueva e incluye tablas para productos, usuarios, pedidos, detalles y transacciones. Los precios y totales se almacenan en pesos colombianos (COP).

Si ya existe una base de datos creada con una versión anterior del esquema, haz una copia de seguridad y aplica una sola vez:

```sh
mysql -u usuario -p nombre_base_datos < migrations/20261019_wompi_guest_checkout.sql
```

La migración modifica `pedidos` para habilitar pedidos de invitados y guardar sus datos de contacto, envío y referencia de pago. **No la ejecutes de nuevo después de aplicarla:** el script no es idempotente. Las instalaciones nuevas que importen el `schema.sql` actual no necesitan esta migración.

El catálogo consulta productos en MySQL/MariaDB desde el servidor. Actualmente reconoce las categorías `ropa_deportiva` y `cuidado_capilar`; el esquema no implementa inventario ni disponibilidad por stock.

## Checkout y notificaciones Wompi

El checkout de invitado envía al servidor los datos del comprador y los identificadores/cantidades de los productos. El servidor vuelve a consultar los precios en la base de datos, crea el pedido y genera la URL de Wompi con la firma de integridad. La aplicación no considera aprobado un pago únicamente por el retorno del navegador.

Para habilitar la confirmación automática:

1. Configura primero credenciales de Sandbox y valida el flujo de prueba.
2. Publica la aplicación en una URL HTTPS accesible desde Internet.
3. Registra `https://<tu-dominio>/api/wompi/events` como URL de eventos en el panel de Wompi.
4. Habilita el evento `transaction.updated` y configura el secreto de eventos correspondiente.
5. Confirma que los métodos de pago requeridos, por ejemplo Nequi o PSE, estén habilitados para la cuenta del comercio.
6. Cambia a credenciales de producción y `WOMPI_ENVIRONMENT=production` solo cuando la configuración del comercio y el entorno estén listos.

El servidor valida la firma del evento y comprueba el entorno, la referencia, la moneda y el monto antes de actualizar el estado del pedido. `localhost` sirve para desarrollo, pero Wompi no puede notificar a un webhook local sin un túnel HTTPS público.

## Estructura del proyecto

```text
src/
├── components/
│   ├── catalog/                 # Catálogo, tarjetas, enlaces y rutinas
│   ├── layout/                  # Header, hero y footer
│   └── ui/                      # Componentes de interfaz reutilizables
├── config/
│   └── constants.ts             # Colores, filtros, claves y umbral de envío
├── features/
│   ├── cart/                    # Drawer del carrito y modal de checkout
│   ├── combines/                # Creador de combinaciones
│   └── reviews/                 # Sección de reseñas
├── hooks/
│   ├── useCart.ts               # Estado, persistencia y cálculos del carrito
│   ├── useCheckout.ts           # Inicio y seguimiento del pago
│   └── useReviews.ts            # Estado de reseñas de la sesión
├── lib/
│   ├── server/                  # Consultas de productos y servicios Wompi
│   └── productos.ts             # Función de servidor para cargar el catálogo
├── routes/
│   └── index.tsx                # Loader y composición de la página principal
├── types/
│   ├── index.ts                 # Tipos compartidos
│   └── producto.ts              # Re-export de compatibilidad
└── server.ts                    # Entrada SSR y rutas de API Wompi
```

La ruta `src/routes/index.tsx` ensambla las vistas y conecta sus hooks. Los módulos de servidor de catálogo y pagos permanecen en `src/lib/server/`; `src/server.ts` ya es el archivo de entrada del servidor.

## Comandos de desarrollo

```sh
npm run dev       # Servidor local
npm run lint      # ESLint
npm test          # Pruebas
npm run build     # Build de producción
npm run preview   # Vista previa del build
```

Verificación de tipos:

```sh
npm exec tsc -- --noEmit
```

## Consideraciones operativas

- El umbral de envío de `$150.000 COP` se muestra en la interfaz; no reemplaza una cotización o integración logística.
- Las reseñas actuales se conservan solo en el estado de la sesión del navegador; no se almacenan ni publican en el servidor.
- Las combinaciones personalizadas agregan productos al precio normal. Las tarjetas de promociones preconfiguradas son informativas y no calculan ni aplican descuentos en el checkout.
- Antes de aceptar pedidos reales, define cobertura y tarifas de envío, inventario, devoluciones, privacidad, canales de soporte y textos legales.
- En producción, utiliza un runtime Node.js compatible con el build de Nitro, HTTPS, secretos gestionados fuera del repositorio, acceso protegido a MySQL/MariaDB, copias de seguridad y un procedimiento de restauración probado.

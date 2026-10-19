CREATE DATABASE IF NOT EXISTS power_pink
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE power_pink;

CREATE TABLE IF NOT EXISTS roles (
    codigo VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (codigo, nombre) VALUES
    ('visitante', 'Visitante'),
    ('cliente', 'Cliente'),
    ('cliente_vip', 'Cliente VIP'),
    ('admin', 'Administrador'),
    ('gestor_inventario', 'Gestor de inventario'),
    ('gestor_pedidos', 'Gestor de pedidos'),
    ('editor_marketing', 'Editor de marketing'),
    ('soporte', 'Soporte')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'cliente',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol) REFERENCES roles (codigo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL COMMENT 'Precio en pesos colombianos (COP)',
    imagen VARCHAR(255) NOT NULL DEFAULT 'default.png',
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_productos_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NULL,
    estado ENUM('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')
        NOT NULL DEFAULT 'pendiente',
    total DECIMAL(12, 2) NOT NULL COMMENT 'Total del pedido en pesos colombianos (COP)',
    comprador_nombre VARCHAR(100) NULL,
    comprador_correo VARCHAR(150) NULL,
    comprador_celular VARCHAR(25) NULL,
    direccion_envio VARCHAR(255) NULL,
    ciudad_envio VARCHAR(100) NULL,
    departamento_envio VARCHAR(100) NULL,
    referencia_pago VARCHAR(64) NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pedidos_usuario_id (usuario_id),
    INDEX idx_pedidos_estado (estado),
    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pedido_detalles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL
        COMMENT 'Precio unitario al comprar, en pesos colombianos (COP)',
    UNIQUE KEY uq_pedido_producto (pedido_id, producto_id),
    INDEX idx_pedido_detalles_producto_id (producto_id),
    CONSTRAINT fk_pedido_detalles_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_pedido_detalles_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transacciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    referencia_externa VARCHAR(150) UNIQUE,
    metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta', 'pasarela') NOT NULL,
    estado ENUM('pendiente', 'aprobada', 'rechazada', 'reembolsada')
        NOT NULL DEFAULT 'pendiente',
    monto DECIMAL(12, 2) NOT NULL
        COMMENT 'Monto de la transacción en pesos colombianos (COP)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transacciones_pedido_id (pedido_id),
    INDEX idx_transacciones_estado (estado),
    CONSTRAINT fk_transacciones_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO usuarios (nombre, email, password, rol) VALUES
    ('Super Admin', 'admin@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'admin'),
    ('Gestor Inventario', 'inventario@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'gestor_inventario'),
    ('Gestor Pedidos', 'pedidos@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'gestor_pedidos'),
    ('Editor Marketing', 'marketing@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'editor_marketing'),
    ('Soporte Cliente', 'soporte@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'soporte'),
    ('Cliente VIP', 'vip@powerpink.com', '$2y$10$wT8d1X9sE4k4z3h1Y.U3/O8L5n5O7T2J2S9W8v7A1B2C3D4E5F6G', 'cliente_vip')
ON DUPLICATE KEY UPDATE rol = VALUES(rol);

INSERT INTO productos (nombre, descripcion, precio, imagen, categoria) VALUES
    ('Top Deportivo Power Magenta', 'Top de alto soporte con tecnología de secado rápido.', 89900.00, 'top_pink.jpg', 'ropa_deportiva'),
    ('Leggins Biker Deep Black', 'Leggins pretina alta con ajuste anatómico.', 119900.00, 'leggins_black.jpg', 'ropa_deportiva'),
    ('Shampoo Reparación Capilar', 'Fórmula fortificada para restauración de fibra capilar.', 45000.00, 'shampoo.jpg', 'cuidado_capilar'),
    ('Tratamiento Nutritivo Power', 'Mascarilla hidratante intensiva post-entreno.', 52000.00, 'tratamiento.jpg', 'cuidado_capilar');

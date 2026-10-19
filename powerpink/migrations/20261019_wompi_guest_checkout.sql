ALTER TABLE pedidos
    MODIFY COLUMN usuario_id INT UNSIGNED NULL,
    ADD COLUMN comprador_nombre VARCHAR(100) NULL AFTER total,
    ADD COLUMN comprador_correo VARCHAR(150) NULL AFTER comprador_nombre,
    ADD COLUMN comprador_celular VARCHAR(25) NULL AFTER comprador_correo,
    ADD COLUMN direccion_envio VARCHAR(255) NULL AFTER comprador_celular,
    ADD COLUMN ciudad_envio VARCHAR(100) NULL AFTER direccion_envio,
    ADD COLUMN departamento_envio VARCHAR(100) NULL AFTER ciudad_envio,
    ADD COLUMN referencia_pago VARCHAR(64) NULL UNIQUE AFTER departamento_envio;

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS monitorias_pac;
USE monitorias_pac;

-- Tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de materias
CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL
);

-- Tabla de disponibilidades de monitores
CREATE TABLE disponibilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('disponible', 'ocupado') DEFAULT 'disponible',
    FOREIGN KEY (monitor_id) REFERENCES usuarios(id)
);

-- Tabla de citas agendadas
CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT,
    disponibilidad_id INT,
    materia_id INT,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado ENUM('pendiente', 'realizada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id),
    FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidades(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id)
);

-- Tabla de asistencias
CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT,
    monitor_id INT,
    estudiante_id INT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    validada_por_admin BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (cita_id) REFERENCES citas(id),
    FOREIGN KEY (monitor_id) REFERENCES usuarios(id),
    FOREIGN KEY (estudiante_id) REFERENCES usuarios(id)
);

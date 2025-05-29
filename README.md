# Plataforma Web para la Gestión de Monitorías Académicas del PAC – Universidad Católica de Pereira

Este proyecto consiste en el desarrollo de una aplicación web destinada a optimizar el proceso de gestión de monitorías académicas, mejorando la trazabilidad, organización y eficiencia de las sesiones entre estudiantes y monitores dentro del Programa de Acompañamiento al Currículo (PAC).

---

### Características Principales

Esta plataforma integral incluye funcionalidades clave segmentadas según los perfiles de usuario:

* **Estudiantes:**
    * Visualización de disponibilidad de monitores.
    * Agendar monitorías paso a paso (materia, monitor, horario, confirmación).
    *	Visualizar sus sesiones agendadas.
    *	Cancelar o reprogramar citas.
    *	Recibir recordatorios de monitorías programadas.


* **Monitores:**
    * Registrar disponibilidad horaria.
    * Visualización de citas programadas.
    * Registro de asistencia.
    * Consulta de horas trabajadas acumuladas.

* **Administrador / Coordinador PAC:**
    * Creación, edición y eliminación de perfiles de monitores.
    * Gestión completa de agendas y citas del sistema.
    * Validación de sesiones realizadas.

---

### Vistas de la Interfaz de Usuario (Mockups Visuales)

#### Panel del Estudiante
![Panel Estudiante](docs/screenshots/panel-estudiante.png)

#### Flujo de Agendamiento
![Agendamiento Paso a Paso](docs/screenshots/agendar-monitoria.png)

#### Panel del Monitor
![Panel Monitor](docs/screenshots/panel-monitor.png)

#### Registro de Disponibilidad
![Registro de Disponibilidad](docs/screenshots/registro-disponibilidad.png)

#### Panel Administrativo
![Panel Admin](docs/screenshots/panel-admin.png)

---

### Diagramas Técnicos

#### Diagrama General del Flujo del Software
![Flujo General](docs/architecture/flujo-software.png)

#### Diagrama de Arquitectura por Capas
![Arquitectura en Capas](docs/architecture/arquitectura-capas.png)

---

## Estructura de la Base de Datos

El esquema completo de la base de datos se encuentra en `docs/database/schema.sql`. Incluye entidades como usuarios, sesiones, disponibilidad, validaciones y reportes.

#### Modelo Entidad-Relación (MER)
![MER](docs/database/modelo-er.png)

#### Modelo Relacional
![Modelo Relacional](docs/database/modelo-relacional.png)

---

## Configuración del Entorno de Desarrollo

### Estructura del Repositorio

* `/frontend/`: Next.js (paneles, componentes, páginas por rol).
* `/backend/`: Express.js (rutas, controladores, lógica de negocio).
* `/database/`: Scripts SQL de creación y migración.
* `/docs/`: Documentación técnica, diagramas, mockups.

### Pasos para Ejecución Local

```bash
# Clonar el repositorio
https://github.com/usuario/plataforma-monitorias-pac.git

# Backend
cd backend
npm install
npm start

# Frontend
cd ../frontend
npm install
npm run dev
```

### Configurar Base de Datos

- Crear una base de datos `monitorias_pac` en MySQL.
- Importar el archivo `schema.sql` ubicado en `/database/`.

### Archivo `.env`

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=monitorias_pac
```

---

## Tecnologías Utilizadas

- **Frontend:** Next.js
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Control de versiones:** GitHub

---

## Contribuciones

Este es un proyecto académico desarrollado por:

- **DAVID RICARDO RIVERA ARBELAEZ**
- **Sebastián Patiño Pineda**
- **Cristhian Andres Avalo Valencia**

---

## Licencia

Todos los derechos reservados. Este proyecto es para fines académicos y no se permite su uso o distribución comercial sin autorización expresa.


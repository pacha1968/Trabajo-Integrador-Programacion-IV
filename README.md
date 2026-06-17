# 🎓 SGA - Gestión de Cursos | Programación IV

Trabajo Final Integrador (Primera Entrega) para la cátedra de Programación IV de la Licenciatura en Sistemas de la Facultad de Ciencias de la Administración - UNER.

Aplicación web Full-Stack diseñada para la administración de un catálogo de cursos, implementando un ciclo de vida de datos completo (BREAD) y eliminación lógica (*Soft Delete*).

---

# 🚀 Tecnologías Utilizadas

## Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Bootstrap 5

## Backend
- Node.js
- Express.js

## Base de Datos
- PostgreSQL
- Driver `pg`

## Seguridad
- Encriptación de contraseñas (`crypto`)
- Autenticación con JSON Web Tokens (`jsonwebtoken`)

---

# 🛠️ Requisitos Previos

Antes de ejecutar el proyecto, asegurarse de tener instalado:

- Node.js (v16 o superior)
- PostgreSQL en ejecución local o remota

---

# 📦 Instalación y Configuración

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
```

---

## 2. Configuración de la Base de Datos

- La estructura y datos iniciales de la base fueron provistos por la cátedra como parte del enunciado del trabajo práctico, por lo que no se incluyen scripts SQL ni dumps dentro del repositorio.

---

## 3. Configuración del Backend

Navegar a la carpeta del servidor e instalar las dependencias:

```bash
cd backend
npm install
```

Crear el archivo de entorno:

```bash
cp .env.example .env
```

Editar el archivo `.env` con las credenciales correspondientes de PostgreSQL y la clave secreta de JWT.

---

## 4. Ejecución del Backend

Levantar el servidor de Express:

```bash
node index.js
```

El servidor quedará ejecutándose en:

```text
http://localhost:3000
```

---

## 5. Lanzar el Frontend

Abrir el archivo:

```text
frontend/index.html
```

en el navegador web.

---

# 📂 Estructura de Carpetas

```text
/
├── frontend/              # Lado del Cliente (UI y lógica de presentación)
│   ├── css/               # Hojas de estilo y personalizaciones
│   ├── js/                # Scripts principales
│   └── *.html             # Vistas de la aplicación
│
├── backend/               # Lado del Servidor (API REST)
│   ├── src/               # Código fuente de la API
│   │   ├── config/        # Configuración de conexión a la BD
│   │   ├── controllers/   # Manejo de peticiones y respuestas (req, res)
│   │   ├── repositories/  # Capa de acceso a datos (Consultas SQL)
│   │   └── routes/        # Definición de endpoints
│   ├── index.js           # Punto de entrada principal y middlewares
│   ├── .env.example       # Variables de entorno de ejemplo
│   └── package.json       # Dependencias y scripts
│
├── .gitignore             # Archivos ignorados por Git
└── README.md              # Documentación del proyecto
```

---

## 🏗️ Arquitectura del Sistema

El diseño del lado del servidor se fundamenta en el principio de **Separación de Responsabilidades (Separation of Concerns)**. Se abandonó el enfoque monolítico inicial para adoptar una estructura modular en capas, lo que permite escalar el sistema hacia futuros módulos (Estudiantes, Inscripciones) de forma segura.

La topología del backend se compone de:
* 🔀 **Routes:** Definen las URLs y derivan el tráfico.
* 🧠 **Controllers:** Manejan las validaciones y las respuestas al cliente.
* 💾 **Repositories:** Contienen de forma exclusiva las consultas SQL a PostgreSQL.
* ⚙️ **Config:** Administra la conexión a la base de datos y credenciales de forma segura.





# Sistema de Gestión Académica (SGA) - UNER 🎓

Proyecto desarrollado como Trabajo Final Integrador para la cátedra de **Programación IV (2026)** de la Licenciatura en Sistemas en la **Facultad de Ciencias de la Administración - UNER**.

Este sistema es una aplicación web responsiva diseñada para gestionar estudiantes, cursos e inscripciones mediante una arquitectura RESTful, aplicando estrictos estándares de seguridad y experiencia de usuario.

## 🚀 Tecnologías y Arquitectura

El proyecto está dividido en dos capas claramente separadas (Frontend y Backend) para asegurar la escalabilidad:

### **Frontend**
* **HTML5 & CSS3:** Semántica y estilos personalizados (`styless.css`).
* **JavaScript (Vanilla):** Lógica asíncrona (`fetch` API), delegación de eventos y *Live Search* (Debounce).
* **Bootstrap 5 & Bootstrap Icons:** Framework CSS para diseño responsivo y maquetación (Flexbox/Grid).
* **SweetAlert2:** Para la estandarización de modales y alertas del sistema.

### **Backend**
* **Node.js & Express.js:** Servidor y enrutamiento de la API REST.
* **PostgreSQL (pg):** Motor de base de datos relacional.
* **Bcrypt / JSON Web Tokens (JWT):** Para encriptación de contraseñas y autenticación por sesión segura (Vigilante de rutas).
* **Puppeteer:** Utilizado para la generación dinámica de Diplomas/Certificados en formato PDF.
* **Dotenv:** Para la gestión segura de información sensible mediante variables de entorno.

---

## ✨ Características Principales

Cumpliendo con los requerimientos funcionales de la cátedra, el sistema incluye:

1. **Autenticación Segura:** Login protegido. El token JWT se almacena y se envía en los *headers* (`Authorization: Bearer <token>`) en cada petición HTTP al backend.
2. **Soft Deletes (Borrados Lógicos):** No se realizan `DELETE` físicos en la base de datos. Se actualizan los campos de estado (`id_curso_estado`, `activo`) para mantener la integridad referencial.
3. **BREAD Completo:** Operaciones de *Browse, Read, Edit, Add, Delete* en los módulos principales.
4. **Buscador en Tiempo Real (Live Search):** Implementación de funciones *Debounce* en el frontend para filtrar registros de la base de datos de manera instantánea y eficiente sin recargar la página.
5. **Paginación Dinámica:** Tanto en backend (mediante `LIMIT` y `OFFSET`) como en frontend para optimizar la carga de datos.
6. **Generación de Diplomas:** Exportación nativa a PDF de los certificados de los alumnos.

---

## ⚙️ Instalación y Configuración

Siga estos pasos para desplegar el proyecto en un entorno local:

### 1. Base de Datos
1. Crear una base de datos en PostgreSQL.
2. Ejecutar el script SQL incluido en la carpeta `database` (o en la raíz) para generar las tablas (`usuarios`, `estudiantes`, `cursos`, `inscripciones`, etc.) y sus relaciones.
   * *Nota Técnica:* Si se insertan registros de prueba manualmente vía SQL, se recomienda sincronizar las secuencias de las llaves primarias usando: `SELECT setval(pg_get_serial_sequence('nombre_tabla', 'id_columna'), (SELECT MAX(id_columna) FROM nombre_tabla));`

### 2. Variables de Entorno (Backend)
En la carpeta `/backend`, crear un archivo llamado `.env` basándose en el `.env.example` (si existe), o configurar las siguientes variables:
```env
PORT=3000
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_de_tu_bd
JWT_SECRET=tu_clave_secreta_super_segura
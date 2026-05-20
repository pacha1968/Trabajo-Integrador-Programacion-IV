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

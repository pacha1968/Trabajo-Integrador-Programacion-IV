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

Editar el archivo `.env` con las credenciales correspondientes de PostgreSQL.

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
│   ├── index.js           # Punto de entrada principal
│   ├── .env.example       # Variables de entorno de ejemplo
│   └── package.json       # Dependencias y scripts
│
├── database/              # Scripts SQL y estructura de BD
│
├── .gitignore             # Archivos ignorados por Git
└── README.md              # Documentación del proyecto
```

---

# 🗺️ Roadmap y Evolución Arquitectónica

Para esta **Primera Entrega**, el backend se encuentra centralizado en un único archivo (`index.js`) con el objetivo de garantizar una implementación funcional rápida y cumplir con los requisitos mínimos solicitados por la cátedra.

## 🔜 Plan para la Entrega Final

El proyecto será refactorizado hacia una arquitectura modular basada en separación de responsabilidades, implementando:

- Routes
- Controllers
- Services
- Repositories

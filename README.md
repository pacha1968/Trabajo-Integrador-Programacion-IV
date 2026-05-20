# 🎓 SGA - Gestión de Cursos | Programación IV

Trabajo Final Integrador (Primera Entrega) para la cátedra de Programación IV de la Licenciatura en Sistemas (FCAD - UNER). 
Aplicación web Full-Stack diseñada para la administración de un catálogo de cursos, implementando un ciclo de vida de datos completo (BREAD) y eliminación lógica (Soft Delete).

## 🚀 Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Bootstrap 5 (Componentes, Modales y Toasts).
* **Backend:** Node.js, Express.js.
* **Base de Datos:** PostgreSQL (mediante el driver pg).
* **Seguridad:** Encriptación de contraseñas (crypto) y Autenticación con JSON Web Tokens (jsonwebtoken).

## 🛠️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
* Node.js (v16 o superior).
* PostgreSQL en ejecución local o remota.

## 📦 Instalación y Configuración

1. Clonar el repositorio:
   git clone <url-del-repositorio>

2. Configuración de la Base de Datos:
   * Crear una base de datos en PostgreSQL.
   * (Opcional: Ejecutar los scripts SQL ubicados en la carpeta database/ para generar las tablas).

3. Configuración del Backend:
   Navega a la carpeta del servidor e instala las dependencias:
   cd backend
   npm install

   Crea tu archivo de entorno copiando la plantilla:
   cp .env.example .env

   Edita el archivo .env recién creado con tus credenciales de PostgreSQL.

4. Ejecución:
   Levanta el servidor de Express:
   node index.js
   El servidor estará escuchando peticiones en http://localhost:3000

5. Lanzar el Frontend:
   Abre el archivo frontend/index.html en tu navegador web.

## 📂 Estructura de Carpetas (Estado Actual)

En esta primera iteración, el proyecto prioriza la funcionalidad:

/
├── frontend/              # Lado del Cliente (UI y lógica de presentación)
│   ├── css/               # Hojas de estilo y personalizaciones de Bootstrap
│   ├── js/                # Scripts principales (ej. cursos.js con peticiones)
│   └── *.html             # Vistas de la aplicación
├── backend/               # Lado del Servidor (API REST)
│   ├── index.js           # Entry point unificado
│   ├── .env.example       # Plantilla de variables de entorno seguras
│   └── package.json       # Manifiesto de dependencias
├── .gitignore             # Archivos excluidos del control de versiones
└── README.md              # Documentación del proyecto

## 🗺️ Roadmap y Evolución Arquitectónica

Para esta **Primera Entrega**, el código del backend se encuentra unificado en un único archivo (index.js) para garantizar el funcionamiento ágil de los endpoints y cumplir con los requisitos funcionales de la cátedra.

**Plan para la Entrega Final:** El servidor será sometido a un proceso de refactorización profunda para migrar hacia una **Arquitectura en Capas** (Separación de Responsabilidades). Se implementará una estructura modular que divida el código en Routes, Controllers, Services y Repositories.

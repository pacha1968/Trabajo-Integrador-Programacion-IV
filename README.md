# 🎓 SGA - Sistema de Gestión Académica

## Trabajo Final Integrador - Programación IV

Sistema desarrollado como Trabajo Final Integrador para la asignatura **Programación IV** de la **Licenciatura en Sistemas**, Facultad de Ciencias de la Administración, Universidad Nacional de Entre Ríos (UNER).

SGA (Sistema de Gestión Académica) es una aplicación web Full Stack destinada a la administración de cursos, estudiantes e inscripciones, implementando operaciones BREAD (Browse, Read, Edit, Add, Delete), control de reglas de negocio, autenticación mediante JWT y generación automática de diplomas en formato PDF.

---

## 🚀 Tecnologías Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Bootstrap 5
* Bootstrap Icons
* SweetAlert2

### Backend

* Node.js
* Express.js
* PostgreSQL
* JSON Web Tokens (JWT)
* bcrypt
* Puppeteer
* Handlebars

---

## 🏗️ Arquitectura del Proyecto

El sistema se encuentra dividido en dos capas principales:

### Frontend

Responsable de la interfaz de usuario, interacción con el sistema y consumo de la API REST mediante peticiones HTTP asincrónicas.

### Backend

Responsable de la lógica de negocio, acceso a datos, validaciones, autenticación y generación de documentos PDF.

La aplicación implementa una arquitectura por capas compuesta por:

* Routes
* Middlewares
* Controllers
* Repositories
* Config

Esta organización permite mantener una adecuada separación de responsabilidades y facilita el mantenimiento del sistema.

---

## ✨ Funcionalidades Implementadas

### Autenticación

* Inicio de sesión mediante JWT.
* Protección de rutas privadas mediante middleware de autorización.
* Persistencia de sesión utilizando Local Storage.

### Gestión de Cursos

* Alta de cursos.
* Consulta de cursos.
* Modificación de cursos.
* Baja lógica de cursos.
* Búsquedas dinámicas.
* Paginación de resultados.
* Generación masiva de diplomas.

### Gestión de Estudiantes

* Alta de estudiantes.
* Consulta de estudiantes.
* Modificación de estudiantes.
* Baja lógica de estudiantes.
* Búsquedas dinámicas.
* Paginación de resultados.
* Perfil individual del estudiante.

### Gestión de Inscripciones

* Registro de inscripciones.
* Consulta de inscripciones.
* Baja lógica de inscripciones.
* Validación de cupos máximos.
* Prevención de inscripciones duplicadas.

### Generación de Diplomas

* Emisión individual de certificados en formato PDF.
* Generación automática a partir de los datos almacenados en la base de datos.
* Renderizado dinámico utilizando Handlebars y Puppeteer.

### Borrado Lógico (Soft Delete)

Para preservar la integridad histórica de la información, el sistema no elimina registros físicamente de la base de datos. En su lugar, actualiza los estados correspondientes permitiendo conservar la trazabilidad de los datos.

---

## 📋 Requisitos Previos

Antes de ejecutar el proyecto es necesario contar con:

* Node.js v16 o superior.
* PostgreSQL v13 o superior.
* Git.
* Visual Studio Code (recomendado).
* Extensión Live Server (opcional).

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Trabajo-Integrador-Programacion-IV
```

### 2. Configurar la Base de Datos

1. Crear una base de datos PostgreSQL.
2. Ejecutar el script SQL proporcionado por la cátedra para generar la estructura completa.
3. Verificar que todas las tablas y secuencias hayan sido creadas correctamente.



### 3. Instalar dependencias del Backend

Ingresar a la carpeta backend:

```bash
cd backend
npm install
```

### Generación de PDFs

El sistema utiliza las siguientes librerías para la generación automática de diplomas:

```bash
npm install puppeteer handlebars
```

Estas dependencias ya se encuentran declaradas en el archivo `package.json`, por lo que normalmente serán instaladas automáticamente al ejecutar:

```bash
npm install
```

**Importante:** Puppeteer descarga una versión propia de Chromium durante la instalación. Este proceso puede tardar algunos minutos dependiendo de la velocidad de conexión.

---

## ⚙️ Configuración de Variables de Entorno

Dentro de la carpeta `backend`, crear un archivo `.env` tomando como referencia el archivo `.env.example`.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sga_db
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=clave_secreta_segura
```

---

## ▶️ Ejecución del Proyecto

### Backend

Desde la carpeta backend:

```bash
node index.js
```

Servidor disponible en:

```text
http://localhost:3000
```

### Frontend

Abrir el proyecto en Visual Studio Code y ejecutar:

```text
Open with Live Server
```

La aplicación quedará disponible en:

```text
http://127.0.0.1:5500
```

---

## 📂 Estructura General del Proyecto

```text
/
├── frontend/                  # Lado del Cliente (Interfaz de Usuario)
│   ├── css/                   # Estilos personalizados y Bootstrap
│   ├── js/                    # Scripts de interacción y consumo de API (fetch)
│   └── *.html                 # Vistas HTML5 del sistema
│
├── backend/                   # Lado del Servidor (API RESTful)
│   ├── src/                   # Código fuente de la aplicación
│   │   ├── config/            # Pool de conexiones a PostgreSQL (db.js)
│   │   ├── controllers/       # Controladores de lógica de negocio y renders de PDFs
│   │   ├── middlewares/       # Validadores de datos y esquemas de verificación JWT
│   │   ├── repositories/      # Capa de datos puramente SQL (Consultas parametrizadas)
│   │   └── routes/            # Enrutadores y mapeo de verbos HTTP (.routes.js)
│   │
│   ├── index.js               # Punto de entrada principal y middlewares globales
│   ├── .env.example           # Guía estructurada de variables de entorno
│   └── package.json           # Dependencias y scripts de automatización NPM
│
├── .gitignore                 # Definición de exclusión de archivos para Git
└── README.md                  # Documentación técnica del proyecto
```

---

## 🔐 Seguridad

La aplicación implementa:

* Autenticación mediante JWT.
* Validación de tokens en rutas protegidas.
* Consultas SQL parametrizadas.
* Separación de responsabilidades mediante arquitectura por capas.
* CORS y helmet

---

## 👨‍💻 Autores

Trabajo desarrollado por:

Maidana Ulises
Pacharoni Tomás 
Epifania Ríos
Pablo Ruiz Díaz
Lucas Sánchez



Licenciatura en Sistemas
Facultad de Ciencias de la Administración
Universidad Nacional de Entre Ríos (UNER)

Programación IV - Trabajo Final Integrador
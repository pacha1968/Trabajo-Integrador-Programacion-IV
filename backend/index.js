require('dotenv').config(); //
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken'); //
const crypto = require('crypto'); // Para hashear la contraseña

const app = express();
app.use(cors());
app.use(express.json());

// Configuración con variables de entorno
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ruta de Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Hashear la contraseña recibida para compararla con la de la DB
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'SELECT id_usuario, nombre_usuario, nombre, apellido FROM usuarios WHERE nombre_usuario = $1 AND contrasenia = $2 AND activo = 1',
      [username, hash]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // 2. Generar el Token JWT obligatorio
      const token = jwt.sign(
        { id: user.id_usuario, username: user.nombre_usuario },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ 
        success: true, 
        message: "¡Bienvenido!",
        token, // Enviamos el token al frontend
        user: { nombre: user.nombre, apellido: user.apellido }
      });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
});

// Ruta de Cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cursos');
    res.json(result.rows);
  } catch(err) {
    console.error('Error al consultar los cursos', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// Un solo app.listen al final de todo
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
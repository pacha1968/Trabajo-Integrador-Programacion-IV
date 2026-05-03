const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fcad_cursos',
  password: 'Fcad2026',
  port: 5432,
});

// Ruta de Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1 AND contrasenia = $2', 
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: "Login exitoso" });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
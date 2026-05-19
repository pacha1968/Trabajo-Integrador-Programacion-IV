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

app.get('/api/stats', async (req, res) => {
    try {
        // Contamos alumnos activos y cursos que no estén eliminados (Soft Delete)
        const estudiantes = await pool.query('SELECT COUNT(*) FROM estudiantes WHERE activo = 1');
        const cursos = await pool.query('SELECT COUNT(*) FROM cursos WHERE id_curso_estado != 4');
        
        res.json({
            totalEstudiantes: estudiantes.rows[0].count,
            totalCursos: cursos.rows[0].count
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Ruta POST para crear un nuevo curso
app.post('/api/cursos', async (req, res) => {
  // Extraemos los datos que envía el frontend
  const {nombre, cupo, descripcion, fecha_inicio, cantidad_horas } = req.body;
  
  if (!nombre || nombre.trim() === '' || !isNaN(nombre.trim())) {
      return res.status(400).json({ success: false, message: 'El nombre del curso es inválido o son solo números.' });
  }

  if (cantidad_horas <= 0 || cupo <= 0) {
      return res.status(400).json({ success: false, message: 'Las horas y los cupos deben ser números positivos.' });
  }

  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  const fechaHoyFormateada = hoy.toISOString().split('T')[0];

  if (fecha_inicio < fechaHoyFormateada) {
      return res.status(400).json({ success: false, message: 'La fecha de inicio no puede ser en el pasado.' });
  }

  try {
    // Armamos la consulta SQL (Usamos $1, $2 para evitar inyecciones SQL)
    // Asumimos que id_curso_estado = 1 significa "Activo" (ajustalo si usas otro ID)
    const query = `
      INSERT INTO cursos 
      (nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado, id_usuario_modificacion, fecha_hora_modificacion) 
      VALUES ($1, $2, $3, $4, $5, 1, 1, CURRENT_TIMESTAMP(0)) 
      RETURNING *
    `;
    const values = [nombre, descripcion, fecha_inicio, cantidad_horas, cupo]; 

    // Ejecutamos la consulta
    const result = await pool.query(query, values);
    
    // Devolvemos respuesta exitosa al frontend
    res.status(201).json({ success: true, curso: result.rows[0] });
  } catch(err) {
    console.error('Error al insertar el curso:', err);
    res.status(500).json({ success: false, message: 'Error al guardar en la base de datos' });
  }
});

app.delete('/api/cursos/:id', async (req, res)=>{
  const {id} = req.params;

  try{
    const query = 'UPDATE cursos SET id_curso_estado = 4, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $1 RETURNING *';

    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }
    res.json({ success: true, message: 'Curso eliminado exitosamente', curso: result.rows[0] });
  }catch(err){
    console.error('Error al eliminar el curso:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar el curso' });
  }
});


//Actualizar curso existente
app.put('/api/cursos/:id', async (req, res) => {

  //obtenemos el id desde la url
  const idCurso = req.params.id;
  //Extraemos los datos que envia el front
  const{nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado} = req.body;
  
  try {
    //armamos la consulta SQL para actualizar el curso
    const query = 'UPDATE cursos SET nombre = $1, descripcion = $2, fecha_inicio = $3, cantidad_horas= $4, inscriptos_max = $5, id_curso_estado = $6, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $7 RETURNING *';
    //asignamos los valores a los parametros de la consulta
    const values = [nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado, idCurso];
    //ejecutamos la consulta
    const result = await pool.query(query, values);
    //validamos que exista el curso a actualizar
    if(result.rowCount === 0){
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    //respuesta exitosa
    res.status(200).json({ success: true, message: 'Curso actualizado exitosamente', curso: result.rows[0] });
  } catch (error) {
      console.error('Error en el PUT', error);
      res.status(500).json({ success: false, message: 'Error al actualizar el curso' });
  }
});





// Un solo app.listen al final de todo
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
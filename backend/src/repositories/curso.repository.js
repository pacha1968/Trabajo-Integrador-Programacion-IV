const pool = require('../config/db.js');

//funcion para obtener todos los cursos de la base de datos
const obtenerCursos = async () => {
    const result = await pool.query('SELECT * FROM cursos');
    return result.rows;
};

//funcion para crear un nuevo curso en la base de datos
const crearCurso = async (datos) =>{
    const query = `
        INSERT INTO cursos 
        (nombre, descripcion, fecha_inicio, cantidad_horas, inscriptos_max, id_curso_estado, id_usuario_modificacion, fecha_hora_modificacion) 
        VALUES ($1, $2, $3, $4, $5, 1, 1, CURRENT_TIMESTAMP(0)) 
        RETURNING *
    `;
    const values = [datos.nombre, datos.descripcion, datos.fecha_inicio, datos.cantidad_horas, datos.cupo]; 
    const result = await pool.query(query, values);
    return result.rows[0];
};


//funcion para eliminar un curso de la base de datos (Soft Delete)
const eliminarCurso = async (id) => {
    const query = 'UPDATE cursos SET id_curso_estado = 4, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result;
}

//funcion para actualizar un curso en la base de datos
const actualizarCurso = async (id, datos) => {
    const query = 'UPDATE cursos SET nombre = $1, descripcion = $2, fecha_inicio = $3, cantidad_horas= $4, inscriptos_max = $5, id_curso_estado = $6, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $7 RETURNING *';
    const values = [datos.nombre, datos.descripcion, datos.fecha_inicio, datos.cantidad_horas, datos.inscriptos_max, datos.id_curso_estado, id];
    const result = await pool.query(query, values);
    return result;
}


module.exports = {
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso
}
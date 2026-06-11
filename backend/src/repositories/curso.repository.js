import pool from '../config/db.js';

const obtenerCursos = async (limit, offset, filters = {}) => {
    // 1. Array para guardar las condiciones (siempre excluimos los eliminados)
    let whereClauses = ['id_curso_estado != 4'];
    let values = [];
    let paramIndex = 1;

    // 2. Filtro por Nombre
    if (filters.nombre) {
        whereClauses.push(`nombre ILIKE $${paramIndex}`);
        values.push(`%${filters.nombre}%`);
        paramIndex++;
    }

    // 3. Filtro por Estado 
    if (filters.estado) {
        whereClauses.push(`id_curso_estado = $${paramIndex}`);
        values.push(parseInt(filters.estado));
        paramIndex++;
    }

    // 4. Filtro por Fecha
    if (filters.fecha) {
        whereClauses.push(`fecha_inicio::date = $${paramIndex}`);
        values.push(filters.fecha);
        paramIndex++;
    }

    // Unimos todo con " AND "
    const whereString = 'WHERE ' + whereClauses.join(' AND ');

    // 5. Contamos el total REAL usando el mismo array de values
    const queryTotal = `SELECT COUNT(*) FROM cursos ${whereString}`;
    const totalResult = await pool.query(queryTotal, values);
    const totalCursos = parseInt(totalResult.rows[0].count);

    // 6. Buscamos los cursos. Creamos una copia de values para no romper la consulta anterior
    const queryCursos = `SELECT * FROM cursos ${whereString} ORDER BY id_curso_estado ASC, id_curso ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const valuesCursos = [...values, limit, offset];
    const result = await pool.query(queryCursos, valuesCursos);

    return {
        cursos: result.rows,
        total: totalCursos
    };
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


export default{
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso
}
import db from '../config/db.js';

const obtenerEstudiantes = async (limit, offset, search) => {
    // 1. Consulta base para traer los datos
    let query = 'SELECT id_estudiante, documento, nombres, apellido, email, fecha_nacimiento, activo FROM estudiantes WHERE activo = 1';
    
    // 2. Consulta paralela para contar el total de registros (vital para la paginación)
    let queryCount = 'SELECT COUNT(*) FROM estudiantes WHERE activo = 1';
    
    const values = [];
    const countValues = [];

    // Si el usuario escribió algo en el buscador, agregamos el filtro (buscamos por DNI o Apellido)
    if (search) {
        query += ' AND (documento ILIKE $1 OR apellido ILIKE $1)';
        queryCount += ' AND (documento ILIKE $1 OR apellido ILIKE $1)';
        // El % permite buscar coincidencias parciales (ej: "Garc" encuentra "García")
        values.push(`%${search}%`); 
        countValues.push(`%${search}%`);
    }

    // Agregamos el ordenamiento, el límite y el offset a la consulta principal
    // El índice de los parámetros ($1, $2, etc.) depende de si hubo búsqueda o no
    query += ` ORDER BY apellido ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    // Ejecutamos ambas consultas al mismo tiempo para ahorrar tiempo
    const [resEstudiantes, resCount] = await Promise.all([
        db.query(query, values),
        db.query(queryCount, countValues)
    ]);

    return {
        estudiantes: resEstudiantes.rows,
        total: parseInt(resCount.rows[0].count)
    };
};

const crearEstudiante = async (estudiante) => {
    const { documento, nombres, apellido, email, fecha_nacimiento, id_usuario_modificacion } = estudiante;
    const query = `
        INSERT INTO estudiantes 
        (documento, nombres, apellido, email, fecha_nacimiento, activo, id_usuario_modificacion, fecha_hora_modificacion) 
        VALUES ($1, $2, $3, $4, $5, 1, $6, CURRENT_TIMESTAMP) 
        RETURNING *
    `;
    const values = [documento, nombres, apellido, email, fecha_nacimiento, id_usuario_modificacion];
    const { rows } = await db.query(query, values);
    return rows[0];
};

const eliminarEstudiante = async (id_estudiante, id_usuario_modificacion) => {
    const query = `
        UPDATE estudiantes 
        SET activo = 0, 
            id_usuario_modificacion = $2, 
            fecha_hora_modificacion = CURRENT_TIMESTAMP 
        WHERE id_estudiante = $1 
        RETURNING *
    `;
    const { rows } = await db.query(query, [id_estudiante, id_usuario_modificacion]);
    return rows[0];
};

const actualizarEstudiante = async (id_estudiante, estudiante, id_usuario_modificacion) => {
    const  {nombres, apellido, email, fecha_nacimiento } = estudiante;
    
    const query = `
        UPDATE estudiantes 
        SET nombres = $1, 
            apellido = $2, 
            email = $3, 
            fecha_nacimiento = $4,
            id_usuario_modificacion = $5, 
            fecha_hora_modificacion = CURRENT_TIMESTAMP 
        WHERE id_estudiante = $6 
        RETURNING *
    `;
    
    const values = [nombres, apellido, email, fecha_nacimiento, id_usuario_modificacion, id_estudiante];
    const { rows } = await db.query(query, values);
    return rows[0];
};

export default {
    obtenerEstudiantes,
    crearEstudiante,
    eliminarEstudiante,
    actualizarEstudiante
};
import db from '../config/db.js';

const obtenerEstudiantes = async (limit, offset, search) => {
    let query = 'SELECT id_estudiante, documento, nombres, apellido, email, fecha_nacimiento, activo FROM estudiantes WHERE activo = 1';
    
    let queryCount = 'SELECT COUNT(*) FROM estudiantes WHERE activo = 1';
    
    const values = [];
    const countValues = [];

    if (search) {
        const filtroFuzzy = `
            (documento ILIKE $1 OR 
             translate(apellido, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE translate($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') OR 
             translate(nombres, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE translate($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU'))
        `;
        
        query += ` AND ${filtroFuzzy}`;
        queryCount += ` AND ${filtroFuzzy}`;
        
        values.push(`%${search}%`); 
        countValues.push(`%${search}%`);
    }

    query += ` ORDER BY apellido ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

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
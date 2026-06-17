import pool from '../config/db.js';

const obtenerCursos = async (limit, offset, filters = {}) => {
    let whereClauses = ['id_curso_estado != 4'];
    let values = [];
    let paramIndex = 1;

    if (filters.nombre) {
        whereClauses.push(`nombre ILIKE $${paramIndex}`);
        values.push(`%${filters.nombre}%`);
        paramIndex++;
    }

    if (filters.estado) {
        whereClauses.push(`id_curso_estado = $${paramIndex}`);
        values.push(parseInt(filters.estado));
        paramIndex++;
    }

    if (filters.fecha) {
        whereClauses.push(`fecha_inicio::date = $${paramIndex}`);
        values.push(filters.fecha);
        paramIndex++;
    }

    const whereString = 'WHERE ' + whereClauses.join(' AND ');

    const queryTotal = `SELECT COUNT(*) FROM cursos ${whereString}`;
    const totalResult = await pool.query(queryTotal, values);
    const totalCursos = parseInt(totalResult.rows[0].count);

    const queryCursos = `SELECT * FROM cursos ${whereString} ORDER BY id_curso_estado ASC, id_curso ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const valuesCursos = [...values, limit, offset];
    const result = await pool.query(queryCursos, valuesCursos);

    return {
        cursos: result.rows,
        total: totalCursos
    };
};
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


const eliminarCurso = async (id) => {
    const query = 'UPDATE cursos SET id_curso_estado = 4, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result;
}

const actualizarCurso = async (id, datos) => {
    const query = 'UPDATE cursos SET nombre = $1, descripcion = $2, fecha_inicio = $3, cantidad_horas= $4, inscriptos_max = $5, id_curso_estado = $6, id_usuario_modificacion = 1, fecha_hora_modificacion = CURRENT_TIMESTAMP(0) WHERE id_curso = $7 RETURNING *';
    const values = [datos.nombre, datos.descripcion, datos.fecha_inicio, datos.cantidad_horas, datos.inscriptos_max, datos.id_curso_estado, id];
    const result = await pool.query(query, values);
    return result;
}


const obtenerDatosParaReporte = async (idCurso) => {
    const queryCurso = `
        SELECT id_curso, nombre, cantidad_horas, inscriptos_max
        FROM cursos
        WHERE id_curso = $1
    `;
    const resultCurso = await pool.query(queryCurso, [idCurso]);
    
    if (resultCurso.rows.length === 0) return null;

    const curso = resultCurso.rows[0];

    const queryAlumnos = `
        SELECT e.documento, e.nombres, e.apellido, e.email
        FROM inscripciones i
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
        WHERE i.id_curso = $1 AND i.id_inscripcion_estado = 1
        ORDER BY e.apellido ASC, e.nombres ASC
    `;
    const resultAlumnos = await pool.query(queryAlumnos, [idCurso]);

    return {
        id_curso: curso.id_curso,
        nombre: curso.nombre,
        cantidad_horas: curso.cantidad_horas,
        inscriptos_max: curso.inscriptos_max,
        total_inscriptos: resultAlumnos.rows.length,
        estudiantes: resultAlumnos.rows 
    };
};

const contarInscriptosActivos = async (idCurso) => {
    // Asumimos que id_inscripcion_estado = 1 significa "Activo" según la lógica que armó tu compañero
    const query = 'SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1 AND id_inscripcion_estado = 1';
    const result = await pool.query(query, [idCurso]);
    return parseInt(result.rows[0].count);
};



export default{
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso,
    obtenerDatosParaReporte,
    contarInscriptosActivos
}
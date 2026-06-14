import pool from '../config/db.js';

// 1. Verifica si el curso está abierto y si tiene cupo disponible
const verificarDisponibilidadCurso = async (id_curso) => {
    const query = `
        SELECT 
            c.id_curso_estado, 
            c.inscriptos_max,
            (SELECT COUNT(*) FROM inscripciones i WHERE i.id_curso = c.id_curso AND i.id_inscripcion_estado = 1) as inscriptos_actuales
        FROM cursos c 
        WHERE c.id_curso = $1
    `;
    const result = await pool.query(query, [id_curso]);
    return result.rows[0];
};

const verificarInscripcionDuplicada = async (id_curso, id_estudiante) => {
    const query = `
        SELECT id_inscripcion
        FROM inscripciones
        WHERE id_curso = $1 AND id_estudiante = $2 AND id_inscripcion_estado = 1
    `;
    const result = await pool.query(query, [id_curso, id_estudiante]);
    return result.rows.length > 0; // Retorna true si ya existe una inscripción activa
}

// ==========================================
// FUNCIONES BREAD
// ==========================================

// B - Browse / Read: Obtener lista paginada con JOINs para traer nombres legibles

// B - Browse / Read: Obtener lista paginada con JOINs y Filtros
const obtenerInscripciones = async (limit, offset, estudiante = '', curso = '') => {
    
    // Consulta principal para traer los datos
    let baseQuery = `
        SELECT 
            i.id_inscripcion, 
            i.fecha_hora_inscripcion,
            c.nombre AS curso_nombre,
            e.nombres AS estudiante_nombres,
            e.apellido AS estudiante_apellido,
            e.documento AS estudiante_documento,
            ie.descripcion AS estado
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
        JOIN inscripciones_estados ie ON i.id_inscripcion_estado = ie.id_inscripcion_estado
        WHERE 1=1
    `;

    // Consulta paralela para contar el total (necesario para la paginación)
    let countQuery = `
        SELECT COUNT(*)
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
        WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Filtro 1: Búsqueda de Estudiante (por nombre, apellido o DNI)
    if (estudiante) {
        const busqueda = `%${estudiante}%`;
        // Usamos CAST por si el documento es integer en tu BD y le aplicamos ILIKE
        const filtroSql = ` AND (e.nombres ILIKE $${paramIndex} OR e.apellido ILIKE $${paramIndex} OR CAST(e.documento AS TEXT) ILIKE $${paramIndex})`;
        baseQuery += filtroSql;
        countQuery += filtroSql;
        queryParams.push(busqueda);
        paramIndex++;
    }

    // Filtro 2: Búsqueda por ID de Curso
    if (curso) {
        const filtroSql = ` AND i.id_curso = $${paramIndex}`;
        baseQuery += filtroSql;
        countQuery += filtroSql;
        queryParams.push(curso);
        paramIndex++;
    }

    // 1ro: Ejecutamos el COUNT con los filtros aplicados
    const countResult = await pool.query(countQuery, queryParams);

    // 2do: Le agregamos el ordenamiento, LIMIT y OFFSET a la consulta principal
    baseQuery += ` ORDER BY i.id_inscripcion_estado ASC, i.id_inscripcion DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const finalParams = [...queryParams, limit, offset];
    
    // Ejecutamos la consulta principal
    const result = await pool.query(baseQuery, finalParams);

    return {
        data: result.rows,
        total: parseInt(countResult.rows[0].count)
    };
}
// A - Add: Crear una nueva inscripción
const crearInscripcion = async (id_curso, id_estudiante, id_isuario_modificacion) =>  {
    const query = `
        INSERT INTO inscripciones 
        (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion) 
        VALUES ($1, $2, NOW(), 1, $3, NOW()) 
        RETURNING *
    `;
    const result = await pool.query(query, [id_curso, id_estudiante, id_isuario_modificacion]);
    return result.rows[0];
};

// D - Delete: Borrado Lógico (Soft Delete)
const cancelarInscripcion = async (id_inscripcion, id_usuario_modificacion) => {
    // Estado 2 = Cancelada
    const query = `
        UPDATE inscripciones 
        SET id_inscripcion_estado = 2, 
            id_usuario_modificacion = $2, 
            fecha_hora_modificacion = NOW() 
        WHERE id_inscripcion = $1 
        RETURNING *
    `;

    const result = await pool.query(query, [id_inscripcion, id_usuario_modificacion]);
    return result.rows[0];
}

const obtenerDatosParaDiploma = async (idInscripcion) => {
    // CORRECCIÓN: Usar pool.query y $1 en lugar de db.query y ?
    const query = `
        SELECT i.id_inscripcion, e.nombres, e.apellido, e.documento, c.nombre AS curso_nombre, c.cantidad_horas
        FROM inscripciones i
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
        JOIN cursos c ON i.id_curso = c.id_curso
        WHERE i.id_inscripcion = $1
    `;
    
    const result = await pool.query(query, [idInscripcion]);

    // CORRECCIÓN: PostgreSQL devuelve los datos dentro del array result.rows
    return result.rows[0] || null;
};




export default {
    verificarDisponibilidadCurso,
    verificarInscripcionDuplicada,
    obtenerInscripciones,
    crearInscripcion,
    cancelarInscripcion,
    obtenerDatosParaDiploma 
}
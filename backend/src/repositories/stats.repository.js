import pool from '../config/db.js';

const obtenerEstadisticas = async () => {
    // 1. Buscamos los totales
    const estudiantes = await pool.query('SELECT COUNT(*) FROM estudiantes WHERE activo = 1');
    const cursos = await pool.query('SELECT COUNT(*) FROM cursos WHERE id_curso_estado != 4');
    const inscripciones = await pool.query('SELECT COUNT(*) FROM inscripciones'); 

    // 2. Buscamos los últimos cursos para la tabla de "Accesos Rápidos"
    const cursosRecientes = await pool.query(`
        SELECT id_curso, nombre 
        FROM cursos 
        WHERE id_curso_estado != 4 
        ORDER BY id_curso DESC 
        LIMIT 3
    `);

    return {
        totalEstudiantes: estudiantes.rows[0].count,
        totalCursos: cursos.rows[0].count,
        totalInscripciones: inscripciones.rows[0].count,
        cursosRapidos: cursosRecientes.rows
    };
}

export default {
    obtenerEstadisticas
};
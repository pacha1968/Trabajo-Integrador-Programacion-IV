const pool = require('../config/db.js');

const obtenerEstadisticas = async () => {
    const estudiantes = await pool.query('SELECT COUNT(*) FROM estudiantes WHERE activo = 1');
    const cursos = await pool.query('SELECT COUNT(*) FROM cursos WHERE id_curso_estado != 4');
    return {
        totalEstudiantes: estudiantes.rows[0].count,
        totalCursos: cursos.rows[0].count
    };
}

module.exports = {
    obtenerEstadisticas
};
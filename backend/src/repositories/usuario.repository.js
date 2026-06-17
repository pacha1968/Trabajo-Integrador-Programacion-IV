import pool from '../config/db.js';

const buscarUsuarioParaLogin = async (username, passwordHash) => {
    const result = await pool.query(
        'SELECT id_usuario, nombre_usuario, nombre, apellido FROM usuarios WHERE nombre_usuario = $1 AND contrasenia = $2 AND activo = 1',
        [username, passwordHash]
    );
    return result.rows[0]; 
};

export default {
    buscarUsuarioParaLogin
}
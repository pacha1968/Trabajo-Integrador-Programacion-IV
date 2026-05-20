const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const usuarioRepository = require('../repositories/usuario.repository.js');

const login = async (req, res) => {
    const { username, password } = req.body;

    try{
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        const user = await usuarioRepository.buscarUsuarioParaLogin(username, hash);
        
        if(user){
            const token = jwt.sign(
                { id: user.id_usuario, username: user.nombre_usuario },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );
            
            res.json({ 
                success: true, 
                message: "¡Bienvenido!",
                token,
                user: { nombre: user.nombre, apellido: user.apellido }
            });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos"});
        }
    }catch(err){
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
};

module.exports = {
    login
}
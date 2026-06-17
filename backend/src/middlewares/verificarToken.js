import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token de autenticación.' });
    }

    try {
        const token = tokenHeader.split(' ')[1];
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        req.usuario = payloadDecodificado;
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};
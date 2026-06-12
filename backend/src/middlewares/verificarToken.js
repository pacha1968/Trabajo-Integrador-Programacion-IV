import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers que manda el frontend
    const tokenHeader = req.header('Authorization');

    // 2. Si no mandaron nada, los rebotamos
    if (!tokenHeader) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token de autenticación.' });
    }

    try {
        // Los tokens suelen venir con el formato "Bearer eyJhbGci..." así que lo separamos
        const token = tokenHeader.split(' ')[1];

        // 3. Verificamos que sea válido y no esté vencido
        const payloadDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Guardamos los datos del usuario en la request por si el controlador los necesita
        req.usuario = payloadDecodificado;
        
        // 5. Si todo está bien, dejamos pasar la petición al siguiente middleware o controlador
        next();
    } catch (error) {
        // Si el token es falso, lo inventaron o se venció (pasaron las 2hs):
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
    }
};
import { validationResult } from 'express-validator';

export const validarCampos = (req, res, next) => {
    // validationResult recolecta todos los errores que encontró express-validator
    const errors = validationResult(req);
    
    // Si hay errores, frenamos la petición acá y devolvemos un estado 400 (Bad Request)
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Error de validación en los datos enviados',
            errors: errors.array() 
        });
    }
    
    next(); 
};
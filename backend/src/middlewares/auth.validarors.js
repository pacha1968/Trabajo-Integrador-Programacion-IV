import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js'; // Reutilizamos nuestro patovica genérico

export const validarLogin = [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty().trim(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    
    // Si hay errores, el patovica frena todo acá:
    validarCampos
];
import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const validarLogin = [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty().trim(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    
    validarCampos
];
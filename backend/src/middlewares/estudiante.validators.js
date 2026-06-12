import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js'; 

export const validarCrearEstudiante = [
    check('documento', 'El Documento/DNI es obligatorio').not().isEmpty().trim(),
    check('nombres', 'El nombre es obligatorio').not().isEmpty().trim(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty().trim(),
    check('email', 'Debe proporcionar un email válido').isEmail().normalizeEmail(),
    check('fecha_nacimiento', 'La fecha de nacimiento es obligatoria').not().isEmpty(),
    
    // Si alguna validación de arriba falla, el patovica frena la petición acá
    validarCampos
];
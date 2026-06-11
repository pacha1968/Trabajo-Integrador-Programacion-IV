import { check } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const validarCrearCurso = [
    // 1. Reglas de validación
    check('nombre', 'El nombre del curso es obligatorio').not().isEmpty().trim().escape(),
    check('cantidad_horas', 'La cantidad de horas debe ser un número mayor a 0').isNumeric({ min: 1 }),
    check('cupo', 'El cupo (inscriptos_max) debe ser un número entero').isInt({ min: 1 }),
    check('fecha_inicio', 'Debe enviar una fecha de inicio válida').not().isEmpty(),
    
    // 2. Después de revisar todo, llamamos al patovica para que decida si pasa o rebota
    validarCampos
];


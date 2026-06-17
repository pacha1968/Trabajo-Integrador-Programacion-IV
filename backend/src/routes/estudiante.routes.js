import express from 'express';
import estudianteController from '../controllers/estudiante.controller.js';
import { validarCrearEstudiante } from '../middlewares/estudiante.validators.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/', verificarToken, estudianteController.obtenerEstudiantes);

router.post('/', verificarToken, validarCrearEstudiante, estudianteController.crearEstudiante);
router.delete('/:id', verificarToken, estudianteController.eliminarEstudiante);
router.put('/:id', verificarToken, validarCrearEstudiante, estudianteController.actualizarEstudiante);

export default router;
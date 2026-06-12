import express from 'express';
import estudianteController from '../controllers/estudiante.controller.js';
import { validarCrearEstudiante } from '../middlewares/estudiante.validators.js';
import { verificarToken } from '../middlewares/verificarToken.js'; // <-- Importamos al vigilante

const router = express.Router();

// Toda petición a /api/estudiantes debe pasar primero por verificarToken
router.get('/', verificarToken, estudianteController.obtenerEstudiantes);

// Para crear, pasa por verificarToken y luego por las validaciones de los campos
router.post('/', verificarToken, validarCrearEstudiante, estudianteController.crearEstudiante);
router.delete('/:id', verificarToken, estudianteController.eliminarEstudiante);
router.put('/:id', verificarToken, validarCrearEstudiante, estudianteController.actualizarEstudiante);

export default router;
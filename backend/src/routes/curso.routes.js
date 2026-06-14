import express from 'express';
import * as cursosController from '../controllers/curso.controller.js';
import { validarCrearCurso } from '../middlewares/curso.validators.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.get('/', cursosController.obtenerCursos);

// ==========================================
// RUTAS PROTEGIDAS (Requieren inicio de sesión)
// ==========================================

// CORRECCIÓN: Se agregó la 's' a cursosController en estas 3 rutas
router.post('/', verificarToken, validarCrearCurso, cursosController.crearCurso);
router.put('/:id', verificarToken, validarCrearCurso, cursosController.actualizarCurso);
router.delete('/:id', verificarToken, cursosController.eliminarCurso); 

router.get('/:id/reporte', cursosController.descargarReporte);

export default router;
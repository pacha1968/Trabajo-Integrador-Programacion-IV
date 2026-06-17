import express from 'express';
import * as inscripcionesController from '../controllers/inscripciones.controller.js';
import { validarInscripcion } from '../middlewares/inscripciones.validators.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = express.Router();

router.use(verificarToken); 

router.get('/', inscripcionesController.listar);
router.post('/', validarInscripcion, inscripcionesController.crear);
router.delete('/:id', inscripcionesController.eliminar);
router.get('/:id/diploma', inscripcionesController.descargarDiploma);
export default router;

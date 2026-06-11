import express from 'express';
import cursoController from '../controllers/curso.controller.js';
import { validarCrearCurso } from '../middlewares/curso.validators.js';
import { verificarToken } from '../middlewares/verificarToken.js'; // <- Importación corregida

const router = express.Router();
router.get('/', cursoController.obtenerCursos);


// ==========================================
// RUTAS PROTEGIDAS (Requieren inicio de sesión)
// ==========================================

// POST y PUT: Doble seguridad. Primero verificamos quién es (Token), y después si mandó bien los datos
router.post('/', verificarToken, validarCrearCurso, cursoController.crearCurso);
router.put('/:id', verificarToken, validarCrearCurso, cursoController.actualizarCurso);

// DELETE: Solo verificamos quién es (Token) porque no envía datos en el body
router.delete('/:id', verificarToken, cursoController.eliminarCurso); 

export default router;
import express from 'express';
import statsController from '../controllers/stats.controller.js'; 
import { verificarToken } from '../middlewares/verificarToken.js'; // <-- Importamos al vigilante

const router = express.Router();

// Ruta protegida por el token
router.get('/', verificarToken, statsController.obtenerEstadisticas);

export default router;
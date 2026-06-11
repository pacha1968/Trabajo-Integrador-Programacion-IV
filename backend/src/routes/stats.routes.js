import express from 'express';
import statsController from '../controllers/stats.controller.js'; 
const router = express.Router();

// ruta actual:
router.get('/', statsController.obtenerEstadisticas);

export default router;
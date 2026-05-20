const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller.js');

// Ruta para obtener estadísticas de alumnos y cursos
router.get('/', statsController.obtenerEstadisticas);

module.exports = router;
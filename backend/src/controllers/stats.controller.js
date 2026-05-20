const statsRepository = require('../repositories/stats.repository.js');

const obtenerEstadisticas = async (req, res) => {
    try {
        const stats = await statsRepository.obtenerEstadisticas();
        res.json(stats);
    } catch (error) {
        console.error('Error en el controlador de estadísticas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}; 

module.exports = {
    obtenerEstadisticas
};
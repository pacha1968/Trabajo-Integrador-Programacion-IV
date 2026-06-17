import statsRepository from '../repositories/stats.repository.js';

const obtenerEstadisticas = async (req, res) => {
    try {
        const stats = await statsRepository.obtenerEstadisticas();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error en el controlador de estadísticas:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}; 

export default {
    obtenerEstadisticas
};
import inscripcionesRepository from '../repositories/inscripciones.repository.js';

const listar = async (req, res) => {
    try{
        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const resultado = await incripcionesRepository.obtenerInscripciones(limit, offset);
        res.json({
            success: true,
            data: resultado.data,
            pagination: {
                totalItems: resultado.total,
                currentPage: page,
                totalPages: Math.ceil(resultado.total / limit)
            }
        });
    } catch (error) {
        console.error('Error al listar inscripciones:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

const eliminar = async (req, res) => {
    try{
        const {id} = req.params;
        const id_usuario_modificacion = req.usuario.id_usuario; 

        const inscripcionCancelada = await inscripcionesRepository.cancelarInscripcion(id, id_usuario_modificacion);

        if (!inscripcionCancelada) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada o ya cancelada' });
        }
        res.json({
            success: true,
            message: 'Inscripción dada de baja correctamente (Soft Delete)',
            data: inscripcionCancelada
        });

    }catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

export default { listar, crear, eliminar };

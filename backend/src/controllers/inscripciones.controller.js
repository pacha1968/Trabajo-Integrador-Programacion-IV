import inscripcionesRepository from '../repositories/inscripciones.repository.js';

const listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Capturamos los filtros que vienen de la URL
        const estudiante = req.query.estudiante || '';
        const curso = req.query.curso || '';

        // Pasamos todo al repositorio
        const resultado = await inscripcionesRepository.obtenerInscripciones(limit, offset, estudiante, curso);
        
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
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
const crear = async (req, res) => {
    try {
        const { id_curso, id_estudiante } = req.body;
        
        // Sacamos el ID del usuario directamente del Token JWT (para la auditoría)
        const id_usuario_modificacion = req.usuario.id;

        const nuevaInscripcion = await inscripcionesRepository.crearInscripcion(id_curso, id_estudiante, id_usuario_modificacion);

        res.status(201).json({
            success: true,
            message: 'Inscripción confirmada con éxito',
            data: nuevaInscripcion
        });
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const eliminar = async (req, res) => {
    try {
        const { id } = req.params; 
        const id_usuario_modificacion = req.usuario.id; 

        const inscripcionCancelada = await inscripcionesRepository.cancelarInscripcion(id, id_usuario_modificacion);

        if (!inscripcionCancelada) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }

        res.json({
            success: true,
            message: 'Inscripción dada de baja correctamente (Soft Delete)',
            data: inscripcionCancelada
        });
    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Acá está la línea que tiraba el error. Ahora sí tiene las 3 funciones definidas arriba.
export default { listar, crear, eliminar };
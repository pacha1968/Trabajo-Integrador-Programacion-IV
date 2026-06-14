import estudianteRepository from '../repositories/estudiante.repository.js';

const obtenerEstudiantes = async (req, res) => {
    try {
        // Capturamos los parámetros de la URL (si no vienen, usamos valores por defecto)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; // Mostramos 5 alumnos por página
        const search = req.query.search || '';
        
        // Calculamos cuántos registros hay que saltear
        // Ej: Página 1 = offset 0. Página 2 = offset 5.
        const offset = (page - 1) * limit;

        const { estudiantes, total } = await estudianteRepository.obtenerEstudiantes(limit, offset, search);
        
        // Calculamos el total de páginas
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({ 
            success: true, 
            data: estudiantes,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

const crearEstudiante = async (req, res) => {
    const { documento, nombres, apellido, email, fecha_nacimiento } = req.body;
    const id_usuario_modificacion = req.usuario?.id || req.usuario?.id_usuario || 1;

    try {
        const nuevoEstudiante = await estudianteRepository.crearEstudiante({ documento, nombres, apellido, email, fecha_nacimiento, id_usuario_modificacion });
        res.status(201).json({ success: true, estudiante: nuevoEstudiante });
    } catch (error) {
        console.error('Error al crear estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al guardar el estudiante en la base de datos' });
    }
};

const eliminarEstudiante = async (req, res) => {
    const { id } = req.params;
    const id_usuario_modificacion = req.usuario?.id || req.usuario?.id_usuario || 1;

    try {
        const estudianteEliminado = await estudianteRepository.eliminarEstudiante(id, id_usuario_modificacion);
        
        if (!estudianteEliminado) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }
        
        res.status(200).json({ success: true, message: 'Estudiante dado de baja correctamente' });
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al intentar eliminar el estudiante' });
    }
};

const actualizarEstudiante = async (req, res) => {
    const { id } = req.params;
    const { documento, nombres, apellido, email, fecha_nacimiento } = req.body;
    const id_usuario_modificacion = req.usuario?.id || req.usuario?.id_usuario || 1;

    try {
        const estudianteActualizado = await estudianteRepository.actualizarEstudiante(
            id, 
            { documento, nombres, apellido, email, fecha_nacimiento }, 
            id_usuario_modificacion
        );

        if (!estudianteActualizado) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        res.status(200).json({ success: true, estudiante: estudianteActualizado });
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al intentar actualizar el estudiante' });
    }
};


// Exportar:
export default {
    obtenerEstudiantes,
    crearEstudiante,
    eliminarEstudiante,
    actualizarEstudiante,
};
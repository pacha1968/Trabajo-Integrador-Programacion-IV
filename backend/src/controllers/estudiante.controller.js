import estudianteRepository from '../repositories/estudiante.repository.js';
import db from '../config/db.js'; 

const obtenerEstudiantes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; 
        const search = req.query.search || '';
        
        const offset = (page - 1) * limit;

        const { estudiantes, total } = await estudianteRepository.obtenerEstudiantes(limit, offset, search);
        
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
        // --- 1. VALIDACIÓN DE DNI ÚNICO ---
        const dniExistente = await db.query('SELECT id_estudiante FROM estudiantes WHERE documento = $1', [documento]);
        if (dniExistente.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El DNI ingresado ya está registrado en el sistema.' });
        }

        // --- 2. VALIDACIÓN DE EMAIL ÚNICO ---
        const emailExistente = await db.query('SELECT id_estudiante FROM estudiantes WHERE email = $1', [email]);
        if (emailExistente.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya pertenece a otro estudiante.' });
        }

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
        const dniExistente = await db.query('SELECT id_estudiante FROM estudiantes WHERE documento = $1 AND id_estudiante != $2', [documento, id]);
        if (dniExistente.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El DNI ingresado ya está registrado en otro estudiante.' });
        }

        const emailExistente = await db.query('SELECT id_estudiante FROM estudiantes WHERE email = $1 AND id_estudiante != $2', [email, id]);
        if (emailExistente.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo electrónico ya pertenece a otro estudiante.' });
        }

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

export default {
    obtenerEstudiantes,
    crearEstudiante,
    eliminarEstudiante,
    actualizarEstudiante,
};
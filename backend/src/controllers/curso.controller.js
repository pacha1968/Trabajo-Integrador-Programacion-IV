import usuarioRepository from '../repositories/usuario.repository.js';
import cursoRepository from '../repositories/curso.repository.js';
const obtenerCursos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Limpiamos los filtros: Solo los pasamos si REALMENTE tienen algo válido
        const filters = {};
        
        if (req.query.nombre && req.query.nombre !== 'undefined' && req.query.nombre.trim() !== '') {
            filters.nombre = req.query.nombre;
        }
        
        // Evitamos que pasen valores vacíos, "0", o textos como "Todos"
        if (req.query.estado && req.query.estado !== '0' && req.query.estado !== 'Todos' && req.query.estado !== 'undefined' && req.query.estado !== '') {
            filters.estado = req.query.estado;
        }
        
        if (req.query.fecha && req.query.fecha !== 'undefined' && req.query.fecha !== '') {
            filters.fecha = req.query.fecha;
        }

        const { cursos, total } = await cursoRepository.obtenerCursos(limit, offset, filters);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: cursos,
            pagination: {
                totalItems: total,
                totalPages: totalPages || 1, // Si no hay resultados, mostramos al menos 1 página vacía
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (err) {
        console.error('Error al consultar los cursos', err);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
};

const crearCurso = async (req, res) => {
    const {nombre, cupo, descripcion, fecha_inicio, cantidad_horas} = req.body;

    if (!nombre || nombre.trim() === '' || !isNaN(nombre.trim())) {
        return res.status(400).json({ success: false, message: 'El nombre del curso es obligatorio y no puede ser un número.' });
    }
    if (cantidad_horas <= 0 || cupo <= 0) {
        return res.status(400).json({ success: false, message: 'Las horas y los cupos deben ser números positivos.' });
    }
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const fechaHoyFormateada = hoy.toISOString().split('T')[0];
    if (fecha_inicio < fechaHoyFormateada) {
        return res.status(400).json({ success: false, message: 'La fecha de inicio no puede ser en el pasado.' });
    }  
    try {
        const nuevoCurso = await cursoRepository.crearCurso({nombre, cupo, descripcion, fecha_inicio, cantidad_horas});
        res.status(201).json({ success: true, curso: nuevoCurso });
    } catch (error) {
        console.error('Error al crear curso:', error);
        res.status(500).json({ success: false, message: 'Error al guardar en la base de datos' });
    }
}

const eliminarCurso = async (req, res) => {
    const {id} = req.params;

    try {
        const result = await cursoRepository.eliminarCurso(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        }
        res.json({ success: true, message: 'Curso eliminado correctamente', curso: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar el curso' });
    }
}

const actualizarCurso = async (req, res) => {
    const idCurso = req.params.id;
    const datos = req.body;
    try{
        const result = await cursoRepository.actualizarCurso(idCurso, datos);
        if(result.rowCount === 0){  
            return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        }
        res.json({ success: true, message: 'Curso actualizado correctamente', curso: result.rows[0] });
    }catch(error){
        console.error('Error al actualizar curso:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el curso' });
    }
};

export default {
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso
};
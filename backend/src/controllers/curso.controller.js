const cursoRepository = require('../repositories/curso.repository.js');

const obtenerCursos = async (req, res) => {
    try {
        const cursos = await cursoRepository.obtenerCursos();
        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        res.status(500).json({ message: error.message });
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

module.exports = {
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso
};
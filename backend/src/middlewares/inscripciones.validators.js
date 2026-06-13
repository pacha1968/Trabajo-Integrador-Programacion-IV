import {check} from 'express-validator';
import { validarCampos } from './validarCampos.js';
import inscripcionesRepository from '../repositories/inscripciones.repository.js'; 

export const validarInscripcion = [
    check('id_curso', 'Debe enviar un ID de curso válido').isInt({ min: 1 }),
    check('id_estudiante', 'Debe enviar un ID de estudiante válido').isInt({ min: 1 }),

    // 2. Regla de Negocio: Verificamos Cupo y Estado del Curso
    check('id_curso').custom(async (id_curso) => {
        const datosCurso = await inscripcionesRepository.verificarDisponibilidadCurso(id_curso);
        
        if (!datosCurso) {
            throw new Error('El curso solicitado no existe en la base de datos');
        }

        // Estado 2 = Inscripción Abierta
        if (parseInt(datosCurso.id_curso_estado) !== 2) {
            throw new Error('Las inscripciones para este curso no están habilitadas actualmente');
        }

        // Validación del inscriptos_max
        if (parseInt(datosCurso.inscriptos_actuales) >= parseInt(datosCurso.inscriptos_max)) {
            throw new Error(`Cupo superado. El curso ya alcanzó su límite máximo de ${datosCurso.inscriptos_max} alumnos`);
        }

        return true;
    }),

    // 3. Regla de Negocio: Evitar Inscripciones Duplicadas
    check('id_estudiante').custom(async (id_estudiante, { req }) => {
        const { id_curso } = req.body;
        
        // Solo verificamos si mandaron un id_curso válido
        if (id_curso) {
            const estaDuplicado = await inscripcionesRepository.verificarInscripcionDuplicada(id_curso, id_estudiante);
            if (estaDuplicado) {
                throw new Error('El estudiante ya cuenta con una inscripción activa en este curso');
            }
        }
        return true;
    }),

    // Finalmente, pasamos por el filtro genérico que corta la petición si hubo algún error arriba
    validarCampos
]
import inscripcionesRepository from '../repositories/inscripciones.repository.js';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';

const listar = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const estudiante = req.query.estudiante || '';
        const curso = req.query.curso || '';

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
        const id_usuario_modificacion = req.usuario?.id || 1;
        const esDuplicada = await inscripcionesRepository.verificarInscripcionDuplicada(id_curso, id_estudiante);
        if (esDuplicada) {
            return res.status(400).json({ 
                success: false, 
                message: 'El estudiante ya se encuentra inscripto y activo en este curso.' 
            });
        }

        const disponibilidad = await inscripcionesRepository.verificarDisponibilidadCurso(id_curso);
        if (!disponibilidad) {
            return res.status(404).json({ success: false, message: 'El curso especificado no existe.' });
        }

        if (disponibilidad.id_curso_estado !== 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'No es posible registrar inscripciones. El curso no se encuentra en estado de Inscripción Abierta.' 
            });
        }

        if (parseInt(disponibilidad.inscriptos_actuales) >= parseInt(disponibilidad.inscriptos_max)) {
            return res.status(400).json({ 
                success: false, 
                message: `Cupo máximo alcanzado. El límite de este curso es de ${disponibilidad.inscriptos_max} alumnos.` 
            });
        }

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
        const id_usuario_modificacion = req.usuario?.id || 1; 

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

const descargarDiploma = async (req, res) => {
    const idInscripcion = req.params.id;

    try {
        const datos = await inscripcionesRepository.obtenerDatosParaDiploma(idInscripcion);

        if (!datos) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }

        const plantillaHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Arial', sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; }
                .diploma-container { border: 15px double #0056b3; padding: 40px; background-color: white; width: 800px; height: 500px; margin: 20px auto; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.1); position: relative; }
                h1 { color: #0056b3; font-size: 42px; margin-top: 30px; text-transform: uppercase; }
                h2 { font-size: 20px; color: #6c757d; font-weight: normal; margin-bottom: 40px; }
                .nombre-alumno { font-size: 32px; font-weight: bold; color: #212529; border-bottom: 2px solid #0056b3; display: inline-block; padding-bottom: 5px; margin-bottom: 20px; }
                .texto-medio { font-size: 18px; color: #495057; line-height: 1.6; margin: 20px; }
                .curso-titulo { font-size: 24px; font-weight: bold; color: #0056b3; }
                .footer-diploma { margin-top: 50px; display: flex; justify-content: space-between; padding: 0 50px; }
                .firma { border-top: 1px solid #ced4da; width: 200px; padding-top: 5px; font-size: 14px; color: #6c757d; }
            </style>
        </head>
        <body>
            <div class="diploma-container">
                <h1>Diploma de Certificación</h1>
                <h2>Sistema de Gestión Académica</h2>
                
                <p class="texto-medio">Se extiende el presente certificado a:</p>
                <div class="nombre-alumno">{{nombres}} {{apellido}}</div>
                <p class="texto-medio">DNI: <strong>{{documento}}</strong>, por haber completado y aprobado el curso de:</p>
                <div class="curso-titulo">"${datos.nombre}"</div>
                <p class="texto-medio">Con una carga horaria de {{cantidad_horas}} horas cátedra.</p>
                
                <div class="footer-diploma">
                    <div class="firma">Secretaría Académica</div>
                    <div class="firma">Firma del Instructor</div>
                </div>
            </div>
        </body>
        </html>
        `;

        const template = handlebars.compile(plantillaHtml);
        const htmlFinal = template(datos);

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true
        });
        
        await browser.close();
        
        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Diploma_Inscripcion_${idInscripcion}.pdf`);
        return res.send(Buffer.from(pdfBuffer));
        
    } catch (error) {
        console.error('Error al generar el diploma:', error);
        res.status(500).json({ success: false, message: 'Error al generar el diploma' });
    }
}

export { listar, crear, eliminar, descargarDiploma };
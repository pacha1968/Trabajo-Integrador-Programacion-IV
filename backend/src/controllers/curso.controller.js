import usuarioRepository from '../repositories/usuario.repository.js';
import cursoRepository from '../repositories/curso.repository.js';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';

const obtenerCursos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const filters = {};
        
        if (req.query.nombre && req.query.nombre !== 'undefined' && req.query.nombre.trim() !== '') {
            filters.nombre = req.query.nombre;
        }
        
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

const descargarReporte = async (req, res) => {
    const { id } = req.params;

    try {
        const datos = await cursoRepository.obtenerDatosParaReporte(id);

        if (!datos) {
            return res.status(404).json({ success: false, message: 'Curso no encontrado' });
        }

        const plantillaHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Arial', sans-serif; color: #333; margin: 30px; }
                .header { border-bottom: 3px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
                .universidad { font-size: 12px; text-transform: uppercase; color: #6c757d; font-weight: bold; }
                h1 { color: #0056b3; font-size: 24px; margin: 5px 0; }
                .info-curso { background-color: #f8f9fa; padding: 15px; rounded-radius: 5px; margin-bottom: 25px; border-left: 5px solid #0056b3; }
                .info-grid { display: flex; justify-content: space-between; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { background-color: #0056b3; color: white; padding: 10px; text-align: left; font-size: 14px; }
                td { padding: 10px; border-bottom: 1px solid #dee2e6; font-size: 13px; }
                tr:nth-child(even) { background-color: #f8f9fa; }
                .sin-alumnos { text-align: center; color: #6c757d; padding: 30px; font-style: italic; }
                .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #adb5bd; border-top: 1px solid #dee2e6; padding-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="universidad">Sistema de Gestión Académica (SGA)</div>
                <h1>Lista de Inscriptos por Curso</h1>
            </div>

            <div class="info-curso">
                <h2 style="margin-top:0; color:#212529; font-size:18px;">${datos.nombre}</h2>
                <div class="info-grid">
                    <div><strong>ID Curso:</strong> #CU-{{id_curso}}</div>
                    <div><strong>Carga Horaria:</strong> {{cantidad_horas}} horas</div>
                    <div><strong>Total Alumnos:</strong> {{total_inscriptos}} / {{inscriptos_max}}</div>
                </div>
            </div>

            <h3>Nómina de Estudiantes</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 20%;">Documento</th>
                        <th style="width: 40%;">Apellido y Nombre</th>
                        <th style="width: 40%;">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each estudiantes}}
                    <tr>
                        <td><strong>{{this.documento}}</strong></td>
                        <td>{{this.apellido}}, {{this.nombres}}</td>
                        <td>{{this.email}}</td>
                    </tr>
                    {{else}}
                    <tr>
                        <td colspan="3" class="sin-alumnos">No hay estudiantes activos inscritos en este curso actualmente.</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>

            <div class="footer">
                Reporte generado automáticamente el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}
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
            landscape: false, 
            printBackground: true,
            margin: { top: '20px', bottom: '40px', left: '20px', right: '20px' }
        });

        await browser.close();

        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Reporte_Curso_${id}.pdf`);
        
        return res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Error al generar el reporte del curso:', error);
        res.status(500).json({ success: false, message: 'Error al generar el reporte' });
    }
};



export  {
    obtenerCursos,
    crearCurso,
    eliminarCurso,
    actualizarCurso,
    descargarReporte
};
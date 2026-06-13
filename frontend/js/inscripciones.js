// ==========================================
// 1. CONTROL DE ACCESO, NAVBAR INTERACTIVO Y LOGOUT
// ==========================================
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html'; 
}

document.addEventListener('DOMContentLoaded', async () => {
    // Inyecta el nombre del usuario logueado en el nuevo Dropdown
    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.getElementById('nombreUsuarioNavbar');
    if (nombreAdmin && displayAdmin) {
        displayAdmin.textContent = nombreAdmin;
    }

    // Escucha el clic en el botón de Cerrar Sesión del nuevo menú
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            window.location.href = 'login.html'; 
        });
    }

    // Carga inicial de datos
    await cargarInscripciones();
    await cargarEstudiantesParaSelect();
    await cargarCursosParaSelect();
});

// ==========================================
// VARIABLES GLOBALES
// ==========================================
const tbodyInscripciones = document.getElementById('tbody-inscripciones');
const paginacionContainer = document.getElementById('paginacion-container');
const formNuevaInscripcion = document.getElementById('formNuevaInscripcion');
const selectEstudiante = document.getElementById('selectEstudiante');
const selectCurso = document.getElementById('selectCurso');

let paginaActual = 1;
let idInscripcionSeleccionada = null; 

// ==========================================
// FUNCIONES DE CARGA Y RENDERIZADO TABLA
// ==========================================
async function cargarInscripciones() {
    try {
        // Capturamos los filtros directamente del HTML
        const inputEstudiante = document.getElementById('filtroEstudiante')?.value.trim() || '';
        const inputCurso = document.getElementById('filtroSelectCurso')?.value || '';

        // Armamos la URL con los parámetros
        const url = `http://localhost:3000/api/inscripciones?page=${paginaActual}&limit=5&estudiante=${encodeURIComponent(inputEstudiante)}&curso=${encodeURIComponent(inputCurso)}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            renderizarTabla(data.data);
            renderizarPaginacion(data.pagination);
        } else {
            manejarAlerta(false, 'Error', 'Error al cargar inscripciones: ' + data.message);
        }
    } catch (error) {
        tbodyInscripciones.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error de conexión con el servidor</td></tr>';
    }
}

function renderizarTabla(inscripciones) {
    tbodyInscripciones.innerHTML = '';

    if (inscripciones.length === 0) {
        tbodyInscripciones.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron inscripciones con esos parámetros.</td></tr>';
        return;
    }

    inscripciones.forEach(insc => {
        const fecha = new Date(insc.fecha_hora_inscripcion).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
        
        // Verificamos si está activa o cancelada según el texto que viene de la BD
        const esCancelada = insc.estado && insc.estado.toLowerCase().includes('cancelada'); 

        const estadoBadge = !esCancelada 
            ? `<span class="badge bg-success-subtle text-success rounded-pill px-3">${insc.estado}</span>`
            : `<span class="badge bg-danger-subtle text-danger rounded-pill px-3">${insc.estado}</span>`;

        const btnBorrar = !esCancelada
            ? `<button onclick="abrirModalBaja(${insc.id_inscripcion})" class="btn btn-sm btn-outline-danger border-0" title="Anular Inscripción"><i class="bi bi-x-circle-fill"></i></button>`
            : '';

        const fila = `
            <tr>
                <td class="ps-4 text-muted small">#IN-${insc.id_inscripcion}</td>
                <td><span class="fw-bold">${insc.estudiante_nombres} ${insc.estudiante_apellido}</span><br><small class="text-muted">DNI: ${insc.estudiante_documento}</small></td>
                <td>${insc.curso_nombre}</td>
                <td>${fecha}</td>
                <td>${estadoBadge}</td>
                <td class="text-center">
                    <button onclick="generarPDF(${insc.id_inscripcion})" class="btn btn-sm btn-outline-dark border-0 me-1" title="Descargar Diploma"><i class="bi bi-file-earmark-pdf-fill text-danger"></i></button>
                    ${btnBorrar}
                </td>
            </tr>
        `;
        tbodyInscripciones.innerHTML += fila;
    });
}

// ==========================================
// FILTROS (LIVE SEARCH)
// ==========================================

// Función Debounce: Evita saturar al servidor con peticiones por cada letra
const debounce = (func, delay) => {
    let temporizador;
    return (...args) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => func.apply(this, args), delay);
    };
};

// Función centralizada para reiniciar la página y buscar
const aplicarFiltros = () => {
    paginaActual = 1; 
    cargarInscripciones(); 
};

// Capturamos los inputs
const inputFiltroEstudiante = document.getElementById('filtroEstudiante');
const selectFiltroCurso = document.getElementById('filtroSelectCurso');

// Escuchador para el texto: se activa 300ms después de que el usuario deja de tipear
if (inputFiltroEstudiante) {
    inputFiltroEstudiante.addEventListener('keyup', debounce(aplicarFiltros, 300));
}

// Escuchador para el selector: se activa inmediatamente al elegir otra opción
if (selectFiltroCurso) {
    selectFiltroCurso.addEventListener('change', aplicarFiltros);
}

// ==========================================
// LLENAR SELECTORES DINÁMICAMENTE
// ==========================================
async function cargarEstudiantesParaSelect() {
    try {
        const response = await fetch('http://localhost:3000/api/estudiantes?limit=100', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            data.data.forEach(est => {
                if(est.activo === 1 || est.activo === true) {
                    const option = document.createElement('option');
                    option.value = est.id_estudiante;
                    option.textContent = `${est.apellido}, ${est.nombres} (DNI: ${est.documento})`;
                    selectEstudiante.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar estudiantes:', error);
    }
}

async function cargarCursosParaSelect() {
    try {
        const response = await fetch('http://localhost:3000/api/cursos?limit=100', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const filtroSelectCurso = document.getElementById('filtroSelectCurso');

        if (data.success) {
            data.data.forEach(curso => {
                // 1. Para el MODAL: Solo mostramos cursos con estado "Inscripción Abierta" (id: 2)
                if (curso.id_curso_estado === 2) {
                    const optionModal = document.createElement('option');
                    optionModal.value = curso.id_curso;
                    optionModal.textContent = `${curso.nombre} (Cupo Máx: ${curso.inscriptos_max})`;
                    selectCurso.appendChild(optionModal);
                }
                
                // 2. Para la BARRA DE FILTROS: Mostramos TODOS los cursos
                if (filtroSelectCurso) {
                    const optionFiltro = document.createElement('option');
                    optionFiltro.value = curso.id_curso;
                    optionFiltro.textContent = curso.nombre;
                    filtroSelectCurso.appendChild(optionFiltro);
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    }
}

// ==========================================
// ALERTAS UNIFICADAS CON SWEETALERT2
// ==========================================
const manejarAlerta = (esExitoso, titulo, mensaje) => {
    if (esExitoso) {
        Swal.fire({
            icon: 'success',
            title: titulo,
            text: mensaje || 'Operación realizada correctamente.',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: titulo || 'Ocurrió un problema',
            text: mensaje || 'Error de conexión con el servidor.',
            confirmButtonColor: '#0056b3'
        });
    }
};

// ==========================================
// ALTA DE INSCRIPCIÓN Y BAJA
// ==========================================
if (formNuevaInscripcion) {
    formNuevaInscripcion.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id_estudiante = parseInt(selectEstudiante.value);
        const id_curso = parseInt(selectCurso.value);

        if (isNaN(id_estudiante) || isNaN(id_curso)) {
            manejarAlerta(false, 'Datos incompletos', 'Por favor, seleccione un estudiante y un curso.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/inscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_estudiante, id_curso })
            });

            const data = await response.json();

            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalNuevaInscripcion')).hide();
                formNuevaInscripcion.reset();
                cargarInscripciones();
                manejarAlerta(true, '¡Excelente!', 'La inscripción fue registrada correctamente.');
            } else {
                let mensajeError = data.message;
                if (data.errors && data.errors.length > 0) {
                    mensajeError = data.errors[0].msg;
                }
                manejarAlerta(false, 'No se pudo inscribir', mensajeError);
            }
        } catch (error) {
            manejarAlerta(false, 'Error crítico', 'Ocurrió un error al registrar la inscripción.');
        }
    });
}

// NUEVA BAJA LÓGICA CON SWEETALERT
window.abrirModalBaja = async function(id) {
    const confirmacion = await Swal.fire({
        title: '¿Anular inscripción?', 
        text: "La inscripción cambiará a estado Cancelada y liberará el cupo.",
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d', 
        confirmButtonText: 'Sí, anular', 
        cancelButtonText: 'Cancelar',
        reverseButtons: true // Consistencia visual con el módulo de Cursos
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/inscripciones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                manejarAlerta(true, '¡Anulada!', 'Inscripción cancelada exitosamente.');
                cargarInscripciones();
            } else {
                manejarAlerta(false, 'Error', data.message);
            }
        } catch (error) {
            manejarAlerta(false, 'Error crítico', 'Error de conexión al anular.');
        }
    }
};

// ==========================================
// PAGINACIÓN Y PDF
// ==========================================
function renderizarPaginacion(pagination) {
    if (pagination.totalItems === 0) {
        paginacionContainer.innerHTML = '';
        return;
    }

    paginacionContainer.innerHTML = `
        <nav>
            <ul class="pagination shadow-sm">
                <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPagina(${pagination.currentPage - 1})">
                        <i class="bi bi-chevron-left"></i> Anterior
                    </button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link text-dark fw-semibold">
                        Página ${pagination.currentPage} de ${pagination.totalPages}
                    </span>
                </li>
                <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
                    <button class="page-link" onclick="cambiarPagina(${pagination.currentPage + 1})">
                        Siguiente <i class="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    `;
}

window.cambiarPagina = function(nuevaPagina) {
    paginaActual = nuevaPagina;
    cargarInscripciones(); 
};

window.generarPDF = function(id) {
    manejarAlerta(true, 'Próximamente', `PDF de inscripción #${id} en desarrollo.`);
};
// 1. Verificación de Seguridad
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

const tbodyInscripciones = document.getElementById('tbody-inscripciones');
const paginacionContainer = document.getElementById('paginacion-container');
const formNuevaInscripcion = document.getElementById('formNuevaInscripcion');
const selectEstudiante = document.getElementById('selectEstudiante');
const selectCurso = document.getElementById('selectCurso');

let paginaActual = 1;
let idInscripcionSeleccionada = null; // Para el modal de baja

document.addEventListener('DOMContentLoaded', async () => {
    await cargarInscripciones();
    await cargarEstudiantesParaSelect();
    await cargarCursosParaSelect();
});

// ==========================================
// FUNCIONES DE CARGA Y FILTROS
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
            mostrarToast('Error al cargar inscripciones: ' + data.message, 'danger');
        }
    } catch (error) {
        tbodyInscripciones.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error de conexión</td></tr>';
    }
}

// Evento para el botón de filtrar
document.getElementById('btnFiltrar')?.addEventListener('click', () => {
    paginaActual = 1; // Volvemos a la página 1 al buscar
    cargarInscripciones();
});

// Evento para buscar rápido al apretar "Enter" en el input
document.getElementById('filtroEstudiante')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        paginaActual = 1;
        cargarInscripciones();
    }
});

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
        const response = await fetch('http://localhost:3000/api/cursos?limit=100');
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
// ALTA DE INSCRIPCIÓN Y BAJA
// ==========================================

formNuevaInscripcion.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id_estudiante = parseInt(selectEstudiante.value);
    const id_curso = parseInt(selectCurso.value);

    if (isNaN(id_estudiante) || isNaN(id_curso)) {
        mostrarToast('Por favor, seleccione un estudiante y un curso.', 'danger');
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
            const modalElement = document.getElementById('modalNuevaInscripcion');
            bootstrap.Modal.getInstance(modalElement).hide();
            formNuevaInscripcion.reset();
            cargarInscripciones();
            mostrarToast('¡Inscripción registrada con éxito!', 'success');
        } else {
            let mensajeError = data.message;
            if (data.errors && data.errors.length > 0) {
                mensajeError = data.errors[0].msg;
            }
            mostrarToast('Error: ' + mensajeError, 'danger');
        }
    } catch (error) {
        mostrarToast('Ocurrió un error al registrar la inscripción.', 'danger');
    }
});


window.abrirModalBaja = function(id) {
    idInscripcionSeleccionada = id;
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
    modal.show();
};

const btnConfirmarBaja = document.getElementById('btnConfirmarBaja');

if (btnConfirmarBaja) {
    btnConfirmarBaja.addEventListener('click', async () => {
        if (!idInscripcionSeleccionada) return;

        try {
            const response = await fetch(`http://localhost:3000/api/inscripciones/${idInscripcionSeleccionada}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();

            if (data.success) {
                mostrarToast('Inscripción anulada correctamente.', 'success');
                cargarInscripciones();
            } else {
                mostrarToast('Error: ' + data.message, 'danger');
            }
        } catch (error) {
            bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
            mostrarToast('Error de conexión al anular.', 'danger');
        }
    });
}

// ==========================================
// UTILIDADES Y PAGINACIÓN
// ==========================================

function mostrarToast(mensaje, tipo) {
    const toastElement = document.getElementById('toastNotificacion');
    if (!toastElement) return;
    const toastMensaje = document.getElementById('toastMensaje');
    const toast = new bootstrap.Toast(toastElement);
    
    toastElement.classList.remove('text-bg-success', 'text-bg-danger');
    toastElement.classList.add(`text-bg-${tipo}`);
    toastMensaje.textContent = mensaje;
    
    toast.show();
}

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
    mostrarToast(`Próximamente: PDF de inscripción #${id}`, 'success');
};
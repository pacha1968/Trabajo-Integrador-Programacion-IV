const tablaCursos = document.getElementById('tabla-cursos');

async function cargarCursos(){
    try {
        const response = await fetch('http://localhost:3000/api/cursos');
        
        if (!response.ok){
            throw new Error('Error en la respuesta del servidor');
        }

        const cursos = await response.json();
        tablaCursos.innerHTML = '';

        const cursosActivos = cursos.filter(cursos => cursos.id_curso_estado !== 4);
        
        if (cursosActivos.length === 0){
            tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center">No hay cursos disponibles</td></tr>';
            return;
        }
        
        cursosActivos.forEach(curso => {
            let badgeClass = '';
            let estadoTexto = '';

            switch(curso.id_curso_estado) {
                case 1:
                    estadoTexto = 'Borrador';
                    badgeClass = 'bg-secondary-subtle text-secondary'; 
                    break;
                case 2:
                    estadoTexto = 'Inscripcion Abierta';
                    badgeClass = 'bg-success-subtle text-success';     
                    break;
                case 3: 
                    estadoTexto = 'Inscripcion Cerrada';
                    badgeClass = 'bg-warning-subtle text-warning';
                    break;
                default:
                    estadoTexto = 'Desconocido';
                    badgeClass = 'bg-dark-subtle text-dark';
            }
            const fila = `
                <tr>
                    <td class="ps-4 text-muted small">#${curso.id_curso}</td>
                    <td>
                        <span class="fw-bold">${curso.nombre}</span><br>
                        <small class="text-muted">${curso.descripcion || 'Sin descripción'}</small>
                    </td>
                    <td>${formatearFecha(curso.fecha_inicio)}</td>
                    <td>${curso.inscriptos_max} alumnos</td>
                    <td><span class="badge ${badgeClass} rounded-pill px-3">${estadoTexto}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary border-0 me-1" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <!-- AGREGAMOS EL ONCLICK AQUÍ -->
                        <button onclick="eliminarCurso(${curso.id_curso})" class="btn btn-sm btn-outline-danger border-0" title="Eliminar">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
            tablaCursos.innerHTML += fila;
        });
    } catch (error) {
        console.error(error);
        tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Ocurrió un error al cargar el catálogo. Verificá que el backend esté encendido (node index.js).</td></tr>';
    }
}

function formatearFecha(fechaString) {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}





//EvetListener para el formulario de nuevo curso
// Seleccionamos el formulario usando el ID que le pusimos en el HTML
const formNuevoCurso = document.getElementById('formNuevoCurso');

if (formNuevoCurso) {
    formNuevoCurso.addEventListener('submit', async (e) => {
        // Evitamos que la página se recargue sola
        e.preventDefault();

        const inputs = formNuevoCurso.querySelectorAll('.form-control');
        inputs.forEach(input => input.classList.remove('is-invalid'));

        let esValido = true;

        const nombre = document.getElementById('inputNombre');
        const cupo = document.getElementById('inputCupo');
        const fecha = document.getElementById('inputFecha');
        const horas = document.getElementById('inputHoras');

        if (!nombre.value.trim() || !isNaN(nombre.value.trim())) {
            nombre.classList.add('is-invalid');
            esValido = false;
        }

        if (parseInt(cupo.value) <= 0 || cupo.value === '') {
            cupo.classList.add('is-invalid');
            esValido = false;
        }

        if (parseInt(horas.value) <= 0 || horas.value === '') {
            horas.classList.add('is-invalid');
            esValido = false;
        }

        const hoy = new Date();
        hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
        const fechaHoyFormateada = hoy.toISOString().split('T')[0];

        if (fecha.value < fechaHoyFormateada || fecha.value === '') {
            fecha.classList.add('is-invalid');
            esValido = false;
        }
        if (!esValido) return;

        // Armamos el objeto con los datos de los inputs
        const nuevoCurso = {
            nombre: document.getElementById('inputNombre').value,
            cupo: parseInt(document.getElementById('inputCupo').value),
            descripcion: document.getElementById('inputDescripcion').value,
            fechaInicio: document.getElementById('inputFecha').value,
            cantidadHoras: parseInt(document.getElementById('inputHoras').value)
        };

        try {
            // Hacemos la petición POST al backend
            const response = await fetch('http://localhost:3000/api/cursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoCurso)
            });

            const data = await response.json();

            if (data.success) {
                formNuevoCurso.reset();
                
                const modalElement = document.getElementById('modalNuevoCurso');
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

                cargarCursos(); 
                
                const toastElement = document.getElementById('toastNotificacion');
                const toastMensaje = document.getElementById('toastMensaje');
                const toast = new bootstrap.Toast(toastElement);
                
                toastElement.classList.remove('text-bg-danger');
                toastElement.classList.add('text-bg-success');
                toastMensaje.textContent = '¡Curso creado con éxito!';
                toast.show();
            } else {
                const toastElement = document.getElementById('toastNotificacion');
                const toastMensaje = document.getElementById('toastMensaje');
                const toast = new bootstrap.Toast(toastElement);
                
                toastElement.classList.remove('text-bg-success');
                toastElement.classList.add('text-bg-danger');
                toastMensaje.textContent = 'Error: ' + data.message;
                toast.show();
            }

        } catch (error) {
            console.error('Error en la petición:', error);
            alert('Ocurrió un error al intentar crear el curso.');
        }
    });
}





let idCursoSeleccionado = null
async function eliminarCurso(id){
    idCursoSeleccionado = id;
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'))
    modal.show();
}

const btnConfirmarBaja = document.getElementById('btnConfirmarBaja');


if (btnConfirmarBaja) {
    btnConfirmarBaja.addEventListener('click', async () => {
        if (!idCursoSeleccionado) return;

        try {
            const response = await fetch(`http://localhost:3000/api/cursos/${idCursoSeleccionado}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            // Referencias para manejar el modal y el toast
            const modalElement = document.getElementById('modalConfirmarEliminar');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            
            const toastElement = document.getElementById('toastNotificacion');
            const toastMensaje = document.getElementById('toastMensaje');
            const toast = new bootstrap.Toast(toastElement);

            // Cerramos el modal sí o sí
            modalInstance.hide();

            if (data.success) {
                // Configuramos el toast para éxito (verde)
                toastElement.classList.remove('text-bg-danger');
                toastElement.classList.add('text-bg-success');
                toastMensaje.textContent = '¡Curso eliminado con éxito!';
                
                cargarCursos(); 
            } else {
                
                toastElement.classList.remove('text-bg-success');
                toastElement.classList.add('text-bg-danger');
                toastMensaje.textContent = 'Error: ' + data.message;
            }

            toast.show();

        } catch (error) {
            console.error('Error al eliminar:', error);
            
            const toastElement = document.getElementById('toastNotificacion');
            const toastMensaje = document.getElementById('toastMensaje');
            const toast = new bootstrap.Toast(toastElement);
            
            bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
            
            toastElement.classList.remove('text-bg-success');
            toastElement.classList.add('text-bg-danger');
            toastMensaje.textContent = 'Error de conexión con el servidor.';
            toast.show();
        }
    });
}















document.addEventListener('DOMContentLoaded', cargarCursos);
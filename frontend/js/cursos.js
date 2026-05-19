const tablaCursos = document.getElementById('tabla-cursos');
let cursosCache = [];


async function cargarCursos(){
    try {
        const response = await fetch('http://localhost:3000/api/cursos');
        
        if (!response.ok){
            throw new Error('Error en la respuesta del servidor');
        }

        const cursos = await response.json();
        cursosCache = cursos; // Guardamos TODOS los cursos en la memoria global
        
        // Mandamos a dibujar la tabla por primera vez con todos los datos
        renderizarTabla(cursosCache); 

    } catch (error) {
        console.error(error);
        tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Ocurrió un error al cargar el catálogo. Verificá que el backend esté encendido (node index.js).</td></tr>';
    }
}

function renderizarTabla(arrayDeCursos) {
    tablaCursos.innerHTML = '';
    const cursosActivos = arrayDeCursos.filter(curso => curso.id_curso_estado !== 4);
    
    if (cursosActivos.length === 0){
        tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron cursos con esos parámetros.</td></tr>';
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
                estadoTexto = 'Inscripción Abierta';
                badgeClass = 'bg-success-subtle text-success';     
                break;
            case 3: 
                estadoTexto = 'Inscripción Cerrada';
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
                    <button onclick="abrirModalEditar(${curso.id_curso})" class="btn btn-sm btn-outline-primary border-0 me-1" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button onclick="eliminarCurso(${curso.id_curso})" class="btn btn-sm btn-outline-danger border-0" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>
        `;
        tablaCursos.innerHTML += fila;
    });
}

// ==========================================
// 3. LÓGICA DEL BOTÓN DE FILTRADO
// ==========================================
const btnFiltrar = document.getElementById('btnFiltrar');

const quitarTildes = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

if (btnFiltrar) {
    btnFiltrar.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const inputNombre = document.getElementById('filtroNombre');
        const inputEstado = document.getElementById('filtroEstado');
        const inputFecha = document.getElementById('filtroFecha');

        if (!inputNombre || !inputEstado || !inputFecha) {
            console.error("¡Error! No se encontraron los IDs (filtroNombre, filtroEstado, filtroFecha) en el HTML.");
            return;
        }

        // 2. Capturamos los valores ¡Y LE APLICAMOS LA FUNCIÓN MÁGICA!
        const textoNombre = quitarTildes(inputNombre.value.toLowerCase().trim());
        const valorEstado = inputEstado.value;
        const valorFecha = inputFecha.value;

        // 3. Filtramos la memoria global
        const cursosFiltrados = cursosCache.filter(curso => {
            
            // REGLA A (Nombre): ¡AQUÍ TAMBIÉN LE APLICAMOS LA FUNCIÓN MÁGICA al nombre de la BD!
            const nombreCurso = quitarTildes((curso.nombre || "").toLowerCase());
            const coincideNombre = textoNombre === "" || nombreCurso.includes(textoNombre);

            // REGLA B (Estado)
            const coincideEstado = valorEstado === "" || curso.id_curso_estado.toString() === valorEstado;

            // REGLA C (Fecha)
            let coincideFecha = true;
            if (valorFecha !== "") {
                const fechaCurso = curso.fecha_inicio ? curso.fecha_inicio.split('T')[0] : "";
                coincideFecha = fechaCurso === valorFecha;
            }

            return coincideNombre && coincideEstado && coincideFecha;
        });

        // 4. Llamamos a la dibujante
        renderizarTabla(cursosFiltrados);
    });
}
function formatearFecha(fechaString) {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}





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
            fecha_inicio: document.getElementById('inputFecha').value,
            cantidad_horas: parseInt(document.getElementById('inputHoras').value)
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

//editar cursos, llenar el modal con los datos del curso seleccionado
function abrirModalEditar(id){
    //buscar el curso en la memoria cache para no hacer otra consulta al back 
    const curso = cursosCache.find(c => c.id_curso === id);
    if(!curso)return;
    //llenamos los campos del modal o formulario
    document.getElementById('editIdCurso').value = curso.id_curso;
    document.getElementById('editNombre').value = curso.nombre;
    document.getElementById('editEstado').value = curso.id_curso_estado;
    document.getElementById('editDescripcion').value = curso.descripcion || '';
    document.getElementById('editHoras').value = curso.cantidad_horas;
    document.getElementById('editCupo').value = curso.inscriptos_max;
    if(curso.fecha_inicio){
        const fechaFormateada = curso.fecha_inicio.split('T')[0];
        document.getElementById('editFechaInicio').value = fechaFormateada;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalEditarCurso'));
    document.getElementById('editFechaInicio').classList.remove('is-invalid');
    modal.show();
}

//Enviar el PUT al backend

const formEditarCurso = document.getElementById('formEditarCurso');

if(formEditarCurso){
    formEditarCurso.addEventListener('submit', async (e) => {
        e.preventDefault();//evitar que la pagina se recargue sola 
        if (!formEditarCurso.checkValidity()) {
            e.stopPropagation(); 
            formEditarCurso.classList.add('was-validated'); // Pinta los bordes de rojo y muestra los textos
            return; // Corta la ejecución para que no viaje a la base de datos
        }

        const inputFechaElement = document.getElementById('editFechaInicio');
        const inputFecha = inputFechaElement.value;

        const fechaElegida = new Date(inputFecha + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        if (fechaElegida < hoy) {
            inputFechaElement.classList.add('is-invalid');
            return;
        }else{
            inputFechaElement.classList.remove('is-invalid');
        }
        //recuperamos el id y los datos
        const idCurso = document.getElementById('editIdCurso').value;
        const datosEditados = {
            nombre: document.getElementById('editNombre').value,
            id_curso_estado: parseInt(document.getElementById('editEstado').value),
            descripcion: document.getElementById('editDescripcion').value,
            fecha_inicio: inputFecha,
            cantidad_horas: parseInt(document.getElementById('editHoras').value),
            inscriptos_max: parseInt(document.getElementById('editCupo').value)
        };

        try {
            //peticion PUT al backend
            const response = await fetch(`http://localhost:3000/api/cursos/${idCurso}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosEditados)
            });

            const data = await response.json();
            const modalElement = document.getElementById('modalEditarCurso');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            const toastElement = document.getElementById('toastNotificacion');
            const toastMensaje = document.getElementById('toastMensaje');
            const toast = new bootstrap.Toast(toastElement);

            modalInstance.hide();

            if(data.success){
                toastElement.classList.remove('text-bg-danger');
                toastElement.classList.add('text-bg-success');
                toastMensaje.textContent = '¡Curso actualizado con éxito!';
                cargarCursos();
            }else{
                toastElement.classList.remove('text-bg-success');
                toastElement.classList.add('text-bg-danger');
                toastMensaje.textContent = 'Error: ' + data.message;    
            }
            toast.show();
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Ocurrió un error al intentar actualizar el curso.');
        }
    });
}



document.addEventListener('DOMContentLoaded', cargarCursos);
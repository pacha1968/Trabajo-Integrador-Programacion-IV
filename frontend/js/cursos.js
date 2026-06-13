document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. SEGURIDAD: VIGILANTE Y NOMBRE DEL ADMIN
    // ==========================================
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Cargamos el nombre real del administrador en la barra superior
    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.querySelector('.text-white.text-end span');
    if (nombreAdmin && displayAdmin) {
        displayAdmin.textContent = nombreAdmin;
    }

    // Variables globales del módulo encapsuladas
    const tablaCursos = document.getElementById('tabla-cursos');
    const formNuevoCurso = document.getElementById('formNuevoCurso');
    const formEditarCurso = document.getElementById('formEditarCurso');
    const btnConfirmarBaja = document.getElementById('btnConfirmarBaja');
    const btnFiltrar = document.getElementById('btnFiltrar');

    let cursosCache = [];
    let paginaActual = 1;
    let idCursoSeleccionado = null;

    // Helper: Formatear fechas de manera prolija
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '-';
        const fecha = new Date(fechaString);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    // ==========================================
    // 2. LEER CURSOS (READ)
    // ==========================================
    const cargarCursos = async () => {
        try {
            const inputNombre = document.getElementById('filtroNombre')?.value.trim() || '';
            const inputEstado = document.getElementById('filtroEstado')?.value || '';
            const inputFecha = document.getElementById('filtroFecha')?.value || '';

            const url = `http://localhost:3000/api/cursos?page=${paginaActual}&limit=5&nombre=${encodeURIComponent(inputNombre)}&estado=${encodeURIComponent(inputEstado)}&fecha=${encodeURIComponent(inputFecha)}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Agregamos protección al listado
                }
            });
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const respuesta = await response.json();
            cursosCache = respuesta.data; 
            
            renderizarTabla(cursosCache); 
            renderizarBotonesPaginacion(respuesta.pagination);

        } catch (error) {
            console.error(error);
            tablaCursos.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Ocurrió un error al cargar el catálogo. Verificá la conexión al servidor.</td></tr>';
        }
    };

    const renderizarTabla = (arrayDeCursos) => {
        tablaCursos.innerHTML = '';
        const cursosActivos = arrayDeCursos.filter(curso => curso.id_curso_estado !== 4);
        
        if (cursosActivos.length === 0){
            tablaCursos.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron cursos con esos parámetros.</td></tr>';
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
                    badgeClass = 'bg-danger-subtle text-danger';
                    break;
                default:
                    estadoTexto = 'Desconocido';
                    badgeClass = 'bg-dark-subtle text-dark';
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="ps-4 text-muted small">#${curso.id_curso}</td>
                <td>
                    <span class="fw-bold">${curso.nombre}</span><br>
                    <small class="text-muted">${curso.descripcion || 'Sin descripción'}</small>
                </td>
                <td>${formatearFecha(curso.fecha_inicio)}</td>
                <td>${curso.inscriptos_max} alumnos</td>
                <td><span class="badge ${badgeClass} rounded-pill px-3">${estadoTexto}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary border-0 me-1 btn-editar" data-id="${curso.id_curso}" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0 btn-eliminar" data-id="${curso.id_curso}" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            `;
            tablaCursos.appendChild(fila);
        });
    };

    // Escuchador dinámico para clics en los botones de la tabla (Delegación de Eventos)
    tablaCursos.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnEditar) {
            const id = parseInt(btnEditar.getAttribute('data-id'));
            abrirModalEditar(id);
        }
        if (btnEliminar) {
            const id = parseInt(btnEliminar.getAttribute('data-id'));
            idCursoSeleccionado = id;
            const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
            modal.show();
        }
    });

    // ==========================================
    // 3. CREAR CURSO (POST)
    // ==========================================
    if (formNuevoCurso) {
        formNuevoCurso.addEventListener('submit', async (e) => {
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

            const nuevoCurso = {
                nombre: nombre.value,
                cupo: parseInt(cupo.value),
                descripcion: document.getElementById('inputDescripcion').value,
                fecha_inicio: fecha.value,
                cantidad_horas: parseInt(horas.value)
            };

            try {
                const response = await fetch('http://localhost:3000/api/cursos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevoCurso)
                });

                const data = await response.json();
                manejarRespuestaToast(data.success, '¡Curso creado con éxito!', data.message);

                if (data.success) {
                    formNuevoCurso.reset();
                    bootstrap.Modal.getInstance(document.getElementById('modalNuevoCurso')).hide();
                    cargarCursos(); 
                }
            } catch (error) {
                console.error('Error en la petición:', error);
            }
        });
    }

    // ==========================================
    // 4. ACTUALIZAR CURSO (PUT)
    // ==========================================
    const abrirModalEditar = (id) => {
        const curso = cursosCache.find(c => c.id_curso === id);
        if (!curso) return;

        document.getElementById('editIdCurso').value = curso.id_curso;
        document.getElementById('editNombre').value = curso.nombre;
        document.getElementById('editEstado').value = curso.id_curso_estado;
        document.getElementById('editDescripcion').value = curso.descripcion || '';
        document.getElementById('editHoras').value = curso.cantidad_horas;
        document.getElementById('editCupo').value = curso.inscriptos_max;
        
        if (curso.fecha_inicio) {
            document.getElementById('editFechaInicio').value = curso.fecha_inicio.split('T')[0];
        }

        document.getElementById('editFechaInicio').classList.remove('is-invalid');
        new bootstrap.Modal(document.getElementById('modalEditarCurso')).show();
    };

    if (formEditarCurso) {
        formEditarCurso.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!formEditarCurso.checkValidity()) {
                e.stopPropagation(); 
                formEditarCurso.classList.add('was-validated');
                return;
            }

            const inputFechaElement = document.getElementById('editFechaInicio');
            const fechaElegida = new Date(inputFechaElement.value + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0,0,0,0);

            if (fechaElegida < hoy) {
                inputFechaElement.classList.add('is-invalid');
                return;
            } else {
                inputFechaElement.classList.remove('is-invalid');
            }

            const idCurso = document.getElementById('editIdCurso').value;
            const datosEditados = {
                nombre: document.getElementById('editNombre').value,
                id_curso_estado: parseInt(document.getElementById('editEstado').value),
                descripcion: document.getElementById('editDescripcion').value,
                fecha_inicio: inputFechaElement.value,
                cantidad_horas: parseInt(document.getElementById('editHoras').value),
                cupo: parseInt(document.getElementById('editCupo').value),          
                inscriptos_max: parseInt(document.getElementById('editCupo').value) 
            };

            try {
                const response = await fetch(`http://localhost:3000/api/cursos/${idCurso}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datosEditados)
                });

                const data = await response.json();
                bootstrap.Modal.getInstance(document.getElementById('modalEditarCurso')).hide();
                manejarRespuestaToast(data.success, '¡Curso actualizado con éxito!', data.message);

                if (data.success) cargarCursos();
            } catch (error) {
                console.error('Error al actualizar:', error);
            }
        });
    }

    // ==========================================
    // 5. ELIMINAR CURSO (DELETE)
    // ==========================================
    if (btnConfirmarBaja) {
        btnConfirmarBaja.addEventListener('click', async () => {
            if (!idCursoSeleccionado) return;

            try {
                const response = await fetch(`http://localhost:3000/api/cursos/${idCursoSeleccionado}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
                manejarRespuestaToast(data.success, '¡Curso eliminado con éxito!', data.message);

                if (data.success) cargarCursos(); 
            } catch (error) {
                console.error('Error al eliminar:', error);
            }
        });
    }

    // ==========================================
    // 6. FILTROS Y PAGINACIÓN
    // ==========================================
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', (e) => {
            e.preventDefault(); 
            paginaActual = 1; 
            cargarCursos(); 
        });
    }

    const renderizarBotonesPaginacion = (pagination) => {
        let contenedor = document.getElementById('paginacion-container');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'paginacion-container';
            contenedor.className = 'd-flex justify-content-center mt-3';
            tablaCursos.closest('table').after(contenedor);
        }

        if (pagination.totalItems === 0) {
            contenedor.innerHTML = '';
            return;
        }

        contenedor.innerHTML = '';
        
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination shadow-sm';

        // Botón Anterior
        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `<button class="page-link"><i class="bi bi-chevron-left"></i> Anterior</button>`;
        if (pagination.currentPage > 1) {
            liAnterior.addEventListener('click', () => {
                paginaActual = pagination.currentPage - 1;
                cargarCursos();
            });
        }
        ul.appendChild(liAnterior);

        // Indicador de posición
        const liInfo = document.createElement('li');
        liInfo.className = 'page-item disabled';
        liInfo.innerHTML = `<span class="page-link text-dark fw-semibold">Página ${pagination.currentPage} de ${pagination.totalPages}</span>`;
        ul.appendChild(liInfo);

        // Botón Siguiente
        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `<button class="page-link">Siguiente <i class="bi bi-chevron-right"></i></button>`;
        if (pagination.currentPage < pagination.totalPages) {
            liSiguiente.addEventListener('click', () => {
                paginaActual = pagination.currentPage + 1;
                cargarCursos();
            });
        }
        ul.appendChild(liSiguiente);

        nav.appendChild(ul);
        contenedor.appendChild(nav);
    };

    // Función auxiliar común para Toasts de Bootstrap
    const manejarRespuestaToast = (esExitoso, mensajeExito, mensajeError) => {
        const toastElement = document.getElementById('toastNotificacion');
        const toastMensaje = document.getElementById('toastMensaje');
        const toast = new bootstrap.Toast(toastElement);

        if (esExitoso) {
            toastElement.classList.remove('text-bg-danger');
            toastElement.classList.add('text-bg-success');
            toastMensaje.textContent = mensajeExito;
        } else {
            toastElement.classList.remove('text-bg-success');
            toastElement.classList.add('text-bg-danger');
            toastMensaje.textContent = 'Error: ' + mensajeError;
        }
        toast.show();
    };

    // Ejecución inicial automática
    cargarCursos();
}); 
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // CONTROL DE ACCESO, NAVBAR INTERACTIVO Y LOGOUT
    // ==========================================
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.getElementById('nombreUsuarioNavbar');
    if (nombreAdmin && displayAdmin) {
        displayAdmin.textContent = nombreAdmin;
    }

    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            window.location.href = 'login.html'; 
        });
    }

    // ==========================================
    // VARIABLES GLOBALES
    // ==========================================
    const tablaCursos = document.getElementById('tabla-cursos');
    const formNuevoCurso = document.getElementById('formNuevoCurso');
    const formEditarCurso = document.getElementById('formEditarCurso');

    let cursosCache = [];
    let paginaActual = 1;

    const formatearFecha = (fechaString) => {
        if (!fechaString) return '-';
        const fecha = new Date(fechaString);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

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
                title: 'Ocurrió un problema',
                text: mensaje || 'Error de conexión con el servidor.',
                confirmButtonColor: '#0056b3' 
            });
        }
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
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const respuesta = await response.json();
            cursosCache = respuesta.data; 
            
            renderizarTabla(cursosCache); 
            renderizarBotonesPaginacion(respuesta.pagination);

        } catch (error) {
            console.error(error);
            tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Ocurrió un error al cargar el catálogo. Verificá la conexión al servidor.</td></tr>';
        }
    };

    const renderizarTabla = (arrayDeCursos) => {
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
                    <button onclick="generarReporteCurso(${curso.id_curso})" class="btn btn-sm btn-outline-dark border-0 me-1" title="Descargar Lista de Alumnos">
                        <i class="bi bi-file-earmark-bar-graph-fill text-primary"></i>
                    </button>

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

    tablaCursos.addEventListener('click', (e) => {
        const btnEditar = e.target.closest('.btn-editar');
        const btnEliminar = e.target.closest('.btn-eliminar');

        if (btnEditar) {
            const id = parseInt(btnEditar.getAttribute('data-id'));
            abrirModalEditar(id);
        }
        if (btnEliminar) {
            const id = parseInt(btnEliminar.getAttribute('data-id'));
            eliminarCurso(id); 
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
                
                if (data.success) {
                    formNuevoCurso.reset();
                    const modalEl = document.getElementById('modalNuevoCurso');
                    const modalInst = bootstrap.Modal.getInstance(modalEl);
                    if(modalInst) modalInst.hide();
                    
                    manejarAlerta(true, '¡Curso creado!', data.message);
                    cargarCursos(); 
                } else {
                    manejarAlerta(false, 'Error al crear', data.message);
                }
            } catch (error) {
                console.error('Error en la petición:', error);
                manejarAlerta(false, 'Error crítico', 'No se pudo conectar con el servidor.');
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
                
                const modalEl = document.getElementById('modalEditarCurso');
                const modalInst = bootstrap.Modal.getInstance(modalEl);
                if(modalInst) modalInst.hide();
                
                if (data.success) {
                    manejarAlerta(true, '¡Curso actualizado!', data.message);
                    cargarCursos();
                } else {
                    manejarAlerta(false, 'Error', data.message);
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                manejarAlerta(false, 'Error crítico', 'No se pudo conectar con el servidor.');
            }
        });
    }

    // ==========================================
    // 5. ELIMINAR CURSO (DELETE CON SWEETALERT)
    // ==========================================
    const eliminarCurso = async (id) => {
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Vas a dar de baja este curso. Pasará a estado eliminado.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (confirmacion.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3000/api/cursos/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();

                if (data.success) {
                    manejarAlerta(true, '¡Curso eliminado!', data.message);
                    cargarCursos(); 
                } else {
                    manejarAlerta(false, 'No se pudo eliminar', data.message);
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                manejarAlerta(false, 'Error crítico', 'No se pudo conectar con el servidor.');
            }
        }
    };

    // ==========================================
    // 6. FILTROS Y PAGINACIÓN (LIVE SEARCH)
    // ==========================================
    const debounce = (func, delay) => {
        let temporizador;
        return (...args) => {
            clearTimeout(temporizador);
            temporizador = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const aplicarFiltros = () => {
        paginaActual = 1; 
        cargarCursos(); 
    };

    const inputFiltroNombre = document.getElementById('filtroNombre');
    const selectFiltroEstado = document.getElementById('filtroEstado');
    const inputFiltroFecha = document.getElementById('filtroFecha');

    if (inputFiltroNombre) {
        inputFiltroNombre.addEventListener('keyup', debounce(aplicarFiltros, 300));
    }
    if (selectFiltroEstado) {
        selectFiltroEstado.addEventListener('change', aplicarFiltros);
    }
    if (inputFiltroFecha) {
        inputFiltroFecha.addEventListener('change', aplicarFiltros);
    }

    const renderizarBotonesPaginacion = (pagination) => {
        let contenedor = document.getElementById('paginacion-container');
        
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'paginacion-container';
            contenedor.className = 'card-footer bg-white py-3 border-top-0 d-flex justify-content-center';
            tablaCursos.closest('table').after(contenedor);
        }

        contenedor.innerHTML = ''; 

        if (pagination.totalItems === 0) return;
        
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination pagination-sm m-0 shadow-sm'; 

        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `<button class="page-link border-0"><i class="bi bi-chevron-left"></i> Anterior</button>`;
        if (pagination.currentPage > 1) {
            liAnterior.addEventListener('click', () => {
                paginaActual = pagination.currentPage - 1;
                cargarCursos();
            });
        }
        ul.appendChild(liAnterior);

        const liInfo = document.createElement('li');
        liInfo.className = 'page-item disabled';
        liInfo.innerHTML = `<span class="page-link border-0 text-dark fw-semibold mx-2">Página ${pagination.currentPage} de ${pagination.totalPages}</span>`;
        ul.appendChild(liInfo);

        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `<button class="page-link border-0 text-primary">Siguiente <i class="bi bi-chevron-right"></i></button>`;
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


    // ==========================================
    // 7. GENERACIÓN DE REPORTE PDF
    // ==========================================
    window.generarReporteCurso = async function(id) {
        try {
            Swal.fire({
                title: 'Generando reporte...',
                text: 'Buscando inscriptos y armando el documento.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const response = await fetch(`http://localhost:3000/api/cursos/${id}/reporte`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                throw new Error('Error en el servidor al generar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_Inscriptos_Curso_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.close();
            
            Swal.fire({
                icon: 'success',
                title: '¡Descargado!',
                text: 'El listado se descargó correctamente.',
                showConfirmButton: false,
                timer: 1500
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte del curso.'
            });
        }
    };

    cargarCursos();
});
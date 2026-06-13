document.addEventListener('DOMContentLoaded', () => {
    // Función auxiliar para capitalizar la primera letra de cada palabra
    const formatoTitulo = (texto) => {
        if (!texto) return '';
        return texto.toLowerCase().split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
    };

    // ==========================================
    // CONTROL DE ACCESO, NAVBAR INTERACTIVO Y LOGOUT
    // ==========================================
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; 
        return;
    }

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
    // ==========================================

    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    const formNuevoEstudiante = document.getElementById('formNuevoEstudiante');
    const inputBusqueda = document.getElementById('inputBusqueda');
    const contenedorPaginacion = document.getElementById('paginacion-container');
    
    // Variables globales para la paginación, filtrado y edición
    let paginaActual = 1;
    const limitePorPagina = 5;
    let busquedaActual = '';
    let estudianteEditandoId = null; // null = Modo Crear | ID = Modo Editar
    let estudiantesActuales = []; // Guardamos los datos en memoria para leerlos rápido al editar

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
    
    // Escuchamos el buscador (LIVE SEARCH)
    inputBusqueda.addEventListener('keyup', (e) => {
        busquedaActual = e.target.value;
        paginaActual = 1; 
        cargarEstudiantes();
    });

    // 2. LEER ESTUDIANTES (GET)
    const cargarEstudiantes = async () => {
        try {
            const url = `http://localhost:3000/api/estudiantes?page=${paginaActual}&limit=${limitePorPagina}&search=${encodeURIComponent(busquedaActual)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                tablaEstudiantes.innerHTML = ''; 
                estudiantesActuales = data.data; // Guardamos la lista en memoria
                
                if (data.data.length === 0) {
                    tablaEstudiantes.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron estudiantes</td></tr>`;
                } else {
                    data.data.forEach(est => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="ps-4 fw-bold">${est.documento}</td>
                            <td>${formatoTitulo(est.nombres)}</td>
                            <td>${formatoTitulo(est.apellido)}</td>
                            <td>${est.email.toLowerCase()}</td>
                            <td><span class="badge bg-success-subtle text-success rounded-pill">Activo</span></td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-secondary border-0 btn-editar" data-id="${est.id_estudiante}"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-sm btn-outline-danger border-0 btn-borrar" data-id="${est.id_estudiante}"><i class="bi bi-trash3"></i></button>
                            </td>
                        `;
                        tablaEstudiantes.appendChild(tr);
                    });
                }
                renderizarPaginacion(data.pagination);
            } else {
                manejarAlerta(false, 'Error al cargar', data.message);
            }
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
            manejarAlerta(false, 'Error crítico', 'No se pudo conectar con el servidor.');
        }
    };

    // Función unificada para dibujar la paginación
    const renderizarPaginacion = (pagination) => {
        contenedorPaginacion.innerHTML = ''; 

        // Adaptación clave: leemos 'page' en lugar de 'currentPage' según tu API de estudiantes
        const paginaActualBackend = pagination.page;
        const totalPaginasBackend = pagination.totalPages;

        if (totalPaginasBackend === 0) return;
        
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination pagination-sm m-0 shadow-sm'; 

        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${paginaActualBackend === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `<button class="page-link border-0"><i class="bi bi-chevron-left"></i> Anterior</button>`;
        if (paginaActualBackend > 1) {
            liAnterior.addEventListener('click', () => {
                paginaActual = paginaActualBackend - 1;
                cargarEstudiantes();
            });
        }
        ul.appendChild(liAnterior);

        const liInfo = document.createElement('li');
        liInfo.className = 'page-item disabled';
        liInfo.innerHTML = `<span class="page-link border-0 text-dark fw-semibold mx-2">Página ${paginaActualBackend} de ${totalPaginasBackend}</span>`;
        ul.appendChild(liInfo);

        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${paginaActualBackend === totalPaginasBackend ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `<button class="page-link border-0 text-primary">Siguiente <i class="bi bi-chevron-right"></i></button>`;
        if (paginaActualBackend < totalPaginasBackend) {
            liSiguiente.addEventListener('click', () => {
                paginaActual = paginaActualBackend + 1;
                cargarEstudiantes();
            });
        }
        ul.appendChild(liSiguiente);

        nav.appendChild(ul);
        contenedorPaginacion.appendChild(nav);
    };

    // 3. CREAR O ACTUALIZAR ESTUDIANTE (POST / PUT)
    formNuevoEstudiante.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const datosFormulario = {
            documento: document.getElementById('documento').value,
            nombres: document.getElementById('nombres').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            fecha_nacimiento: document.getElementById('fecha_nacimiento').value 
        };

        const metodo = estudianteEditandoId ? 'PUT' : 'POST';
        const urlEndpoint = estudianteEditandoId 
            ? `http://localhost:3000/api/estudiantes/${estudianteEditandoId}` 
            : 'http://localhost:3000/api/estudiantes';

        try { 
            const response = await fetch(urlEndpoint, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datosFormulario)
            });

            const data = await response.json();

            if (data.success) {
                bootstrap.Modal.getInstance(document.getElementById('modalNuevoEstudiante')).hide();
                cargarEstudiantes();
                
                // Usamos la función estandarizada
                const mensajeExito = estudianteEditandoId ? 'El estudiante fue actualizado correctamente.' : 'El estudiante fue registrado correctamente.';
                manejarAlerta(true, '¡Excelente!', mensajeExito);
            } else {
                if (data.errors) {
                    const mensajes = data.errors.map(err => err.msg).join('\n');
                    manejarAlerta(false, 'Datos incorrectos', mensajes);
                } else {
                    manejarAlerta(false, 'Error', data.message || 'Error al procesar la solicitud');
                }
            }
        } catch (error) {
            console.error(error);
            manejarAlerta(false, 'Error crítico', 'No se pudo contactar al servidor.');
        }
    });

    // 4. ESCUCHAR CLICS EN LA TABLA (ELIMINAR Y EDITAR)
    tablaEstudiantes.addEventListener('click', async (e) => {
        
        // --- LÓGICA DE ELIMINAR ---
        const btnBorrar = e.target.closest('.btn-borrar');
        if (btnBorrar) {
            const idEstudiante = btnBorrar.getAttribute('data-id');
            const confirmacion = await Swal.fire({
                title: '¿Dar de baja?', text: "El estudiante ya no aparecerá en la lista activa.",
                icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d', confirmButtonText: 'Sí, dar de baja', cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                try {
                    const response = await fetch(`http://localhost:3000/api/estudiantes/${idEstudiante}`, {
                        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                        manejarAlerta(true, '¡Eliminado!', 'Dado de baja exitosamente.');
                        cargarEstudiantes();
                    } else {
                        manejarAlerta(false, 'Error', data.message);
                    }
                } catch (error) {
                    console.error(error);
                    manejarAlerta(false, 'Error crítico', 'No se pudo contactar al servidor.');
                }
            }
        }

        // --- LÓGICA DE EDITAR ---
        const btnEditar = e.target.closest('.btn-editar');
        if (btnEditar) {
            const idEstudiante = parseInt(btnEditar.getAttribute('data-id'));
            
            const estudiante = estudiantesActuales.find(est => est.id_estudiante === idEstudiante);

            if (estudiante) {
                estudianteEditandoId = idEstudiante; 

                const inputDocumento = document.getElementById('documento');
                inputDocumento.value = estudiante.documento;
                inputDocumento.setAttribute('readonly', 'true'); 
                inputDocumento.classList.add('bg-light', 'text-muted');
                
                document.getElementById('nombres').value = estudiante.nombres;
                document.getElementById('apellido').value = estudiante.apellido;
                document.getElementById('email').value = estudiante.email;
                
                if (estudiante.fecha_nacimiento) {
                    document.getElementById('fecha_nacimiento').value = estudiante.fecha_nacimiento.substring(0, 10);
                }

                document.querySelector('#modalNuevoEstudiante .modal-title').innerText = 'Editar Alumno';
                document.querySelector('#formNuevoEstudiante button[type="submit"]').innerText = 'Actualizar Estudiante';

                const modalElement = document.getElementById('modalNuevoEstudiante');
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    });

    // 5. LIMPIEZA AUTOMÁTICA DEL MODAL
    document.getElementById('modalNuevoEstudiante').addEventListener('hidden.bs.modal', () => {
        formNuevoEstudiante.reset();
        estudianteEditandoId = null; 
        document.querySelector('#modalNuevoEstudiante .modal-title').innerText = 'Agregar Nuevo Alumno';
        document.querySelector('#formNuevoEstudiante button[type="submit"]').innerText = 'Guardar Estudiante';

        const inputDocumento = document.getElementById('documento');
        inputDocumento.removeAttribute('readonly');
        inputDocumento.classList.remove('bg-light', 'text-muted');
    });

    // Arrancamos
    cargarEstudiantes();
});
document.addEventListener('DOMContentLoaded', () => {
    // Función auxiliar para capitalizar la primera letra de cada palabra
    const formatoTitulo = (texto) => {
        if (!texto) return '';
        return texto.toLowerCase().split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
    };

    // 1. EL VIGILANTE FRONTEND: Verificamos si hay token
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Acceso Denegado',
            text: 'Sesión expirada o no válida. Por favor, inicie sesión.',
            confirmButtonColor: '#0d6efd'
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

    const tablaEstudiantes = document.getElementById('tabla-estudiantes');
    const formNuevoEstudiante = document.getElementById('formNuevoEstudiante');
    
    // Variables globales para la paginación, filtrado y edición
    let paginaActual = 1;
    const limitePorPagina = 5;
    let busquedaActual = '';
    let estudianteEditandoId = null; // null = Modo Crear | ID = Modo Editar
    let estudiantesActuales = []; // Guardamos los datos en memoria para leerlos rápido al editar

    const inputBusqueda = document.getElementById('inputBusqueda');
    const contenedorPaginacion = document.querySelector('.pagination');
    
    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.querySelector('.text-white.text-end span');
    if (nombreAdmin && displayAdmin) {
        displayAdmin.textContent = nombreAdmin;
    }
    
    // Escuchamos el buscador
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
                Swal.fire({ icon: 'error', title: 'Error al cargar', text: data.message });
            }
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
        }
    };

    // Función para dibujar la paginación
    const renderizarPaginacion = (pag) => {
        contenedorPaginacion.innerHTML = ''; 
        
        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${pag.page === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `<a class="page-link border-0" href="#" style="cursor: ${pag.page === 1 ? 'default' : 'pointer'}">Anterior</a>`;
        liAnterior.addEventListener('click', (e) => {
            e.preventDefault();
            if (pag.page > 1) { paginaActual--; cargarEstudiantes(); }
        });
        contenedorPaginacion.appendChild(liAnterior);

        for (let i = 1; i <= pag.totalPages; i++) {
            const liNum = document.createElement('li');
            liNum.className = `page-item ${pag.page === i ? 'active' : ''}`;
            liNum.innerHTML = `<a class="page-link border-0 ${pag.page === i ? 'rounded-circle mx-1' : 'text-primary'}" href="#">${i}</a>`;
            liNum.addEventListener('click', (e) => {
                e.preventDefault();
                paginaActual = i; cargarEstudiantes();
            });
            contenedorPaginacion.appendChild(liNum);
        }

        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${pag.page === pag.totalPages || pag.totalPages === 0 ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `<a class="page-link border-0 text-primary" href="#" style="cursor: ${pag.page === pag.totalPages ? 'default' : 'pointer'}">Siguiente</a>`;
        liSiguiente.addEventListener('click', (e) => {
            e.preventDefault();
            if (pag.page < pag.totalPages) { paginaActual++; cargarEstudiantes(); }
        });
        contenedorPaginacion.appendChild(liSiguiente);
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

        // Decidimos el método HTTP y la URL dependiendo si estamos editando o creando
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
                // Cerramos modal
                const modalElement = document.getElementById('modalNuevoEstudiante');
                bootstrap.Modal.getInstance(modalElement).hide();

                // Recargamos datos
                cargarEstudiantes();
                
                // Alerta de éxito dinámica
                Swal.fire({
                    icon: 'success',
                    title: '¡Excelente!',
                    text: estudianteEditandoId ? 'El estudiante fue actualizado correctamente.' : 'El estudiante fue registrado correctamente.',
                    confirmButtonColor: '#0d6efd'
                });
            } else {
                if (data.errors) {
                    const mensajes = data.errors.map(err => err.msg).join('\n');
                    Swal.fire({ icon: 'warning', title: 'Datos incorrectos', text: mensajes, confirmButtonColor: '#0d6efd' });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Error al procesar la solicitud', confirmButtonColor: '#0d6efd' });
                }
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo contactar al servidor.', confirmButtonColor: '#0d6efd' });
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
                        Swal.fire({ icon: 'success', title: '¡Eliminado!', text: 'Dado de baja exitosamente.', confirmButtonColor: '#0d6efd' });
                        cargarEstudiantes();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                    }
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo contactar al servidor.' });
                }
            }
        }

        // --- LÓGICA DE EDITAR ---
        const btnEditar = e.target.closest('.btn-editar');
        if (btnEditar) {
            const idEstudiante = parseInt(btnEditar.getAttribute('data-id'));
            
            // Buscamos los datos completos del estudiante en la memoria
            const estudiante = estudiantesActuales.find(est => est.id_estudiante === idEstudiante);

            if (estudiante) {
                // Rellenamos el formulario
                estudianteEditandoId = idEstudiante; // Activamos la bandera de edición

                const inputDocumento = document.getElementById('documento');
                inputDocumento.value = estudiante.documento;
                inputDocumento.setAttribute('readonly', 'true'); // Documento fijo, no se puede editar
                inputDocumento.classList.add('bg-light', 'text-muted');
                
                document.getElementById('nombres').value = estudiante.nombres;
                document.getElementById('apellido').value = estudiante.apellido;
                document.getElementById('email').value = estudiante.email;
                
                // Formateamos la fecha para que la acepte el input HTML (YYYY-MM-DD)
                if (estudiante.fecha_nacimiento) {
                    document.getElementById('fecha_nacimiento').value = estudiante.fecha_nacimiento.substring(0, 10);
                }

                // Transformamos visualmente el modal
                document.querySelector('#modalNuevoEstudiante .modal-title').innerText = 'Editar Alumno';
                document.querySelector('#formNuevoEstudiante button[type="submit"]').innerText = 'Actualizar Estudiante';

                // Mostramos el modal
                const modalElement = document.getElementById('modalNuevoEstudiante');
                const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    });

    // 5. LIMPIEZA AUTOMÁTICA DEL MODAL
    // Si el usuario cierra el modal, reseteamos todo a modo "Crear"
    document.getElementById('modalNuevoEstudiante').addEventListener('hidden.bs.modal', () => {
        formNuevoEstudiante.reset();
        estudianteEditandoId = null; // Desactivamos la bandera
        document.querySelector('#modalNuevoEstudiante .modal-title').innerText = 'Agregar Nuevo Alumno';
        document.querySelector('#formNuevoEstudiante button[type="submit"]').innerText = 'Guardar Estudiante';

        // Dejamos el campo documento editable para el próximo registro (para cuando es un nuevo registro)
        const inputDocumento = document.getElementById('documento');
        inputDocumento.removeAttribute('readonly');
        inputDocumento.classList.remove('bg-light', 'text-muted');
    });

    // Arrancamos
    cargarEstudiantes();
});
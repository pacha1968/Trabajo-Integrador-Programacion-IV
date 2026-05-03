const tablaCursos = document.getElementById('tabla-cursos');

async function cargarCursos(){
    try {
        // 1. PRIMERO hacemos el pedido al backend
        const response = await fetch('http://localhost:3000/api/cursos');
        
        // 2. DESPUÉS verificamos si hubo un error en la respuesta
        if (!response.ok){
            throw new Error('Error en la respuesta del servidor');
        }

        // 3. Transformamos a JSON
        const cursos = await response.json();
        
        tablaCursos.innerHTML = '';
        
        if (cursos.length === 0){
            tablaCursos.innerHTML = '<tr><td colspan="6" class="text-center">No hay cursos disponibles</td></tr>';
            return;
        }
        
        cursos.forEach(curso => {
            const badgeClass = curso.id_curso_estado ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
            const estadoTexto = curso.id_curso_estado ? 'Habilitado' : 'Inactivo';

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
                        <button class="btn btn-sm btn-outline-primary border-0 me-1" title="Editar"><i class="bi bi-pencil-square"></i></button>
                        <button class="btn btn-sm btn-outline-danger border-0" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
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

// 4. Disparamos la función automáticamente cuando el HTML termine de cargar
document.addEventListener('DOMContentLoaded', cargarCursos);
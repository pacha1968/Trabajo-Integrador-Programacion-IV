document.addEventListener('DOMContentLoaded', () => {
    
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

    const mostrarFecha = () => {
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        const fecha = new Date().toLocaleDateString('es-ES', opciones);
        const elementoFecha = document.getElementById('fechaActual');
        if (elementoFecha) elementoFecha.textContent = fecha;
    };
    mostrarFecha();

    const cargarDashboard = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('totalEstudiantes').textContent = data.data.totalEstudiantes;
                document.getElementById('totalCursos').textContent = data.data.totalCursos;
                document.getElementById('totalInscripciones').textContent = data.data.totalInscripciones;

                const tablaCursos = document.getElementById('tablaCursosRapidos');
                if (tablaCursos) {
                    tablaCursos.innerHTML = ''; 
                    if (data.data.cursosRapidos && data.data.cursosRapidos.length > 0) {
                        data.data.cursosRapidos.forEach(curso => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td class="fw-bold text-primary">${curso.nombre}</td>
                                <td class="text-end">
                                    <a href="cursos.html" class="btn btn-sm btn-outline-primary rounded-pill px-3">Ir a Cursos</a>
                                </td>
                            `;
                            tablaCursos.appendChild(tr);
                        });
                    } else {
                        tablaCursos.innerHTML = '<tr><td colspan="2" class="text-center text-muted">No hay cursos activos recientes.</td></tr>';
                    }
                }
            } else {
                console.error("Error del servidor:", data.message);
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    };

    cargarDashboard();
});
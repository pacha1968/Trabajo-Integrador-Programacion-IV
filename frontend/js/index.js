document.addEventListener('DOMContentLoaded', () => {
    
    // 1. EL VIGILANTE FRONTEND
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // ¡RESCATAMOS TU LÓGICA! Mostrar el nombre del usuario logueado en la esquina
    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.querySelector('.text-white.text-end span');
    if (nombreAdmin && displayAdmin) {
        displayAdmin.textContent = nombreAdmin;
    }

    // 2. CONFIGURAR LA FECHA ACTUAL
    const mostrarFecha = () => {
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        const fecha = new Date().toLocaleDateString('es-ES', opciones);
        document.getElementById('fechaActual').textContent = fecha;
    };
    mostrarFecha();

    // 3. OBTENER LAS ESTADÍSTICAS DEL BACKEND
    const cargarDashboard = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/stats', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Sumamos el token para que nos dejen pasar
                }
            });

            const data = await response.json();

            if (data.success) {
                // Rellenamos las tarjetas usando los IDs seguros
                document.getElementById('totalEstudiantes').textContent = data.data.totalEstudiantes;
                document.getElementById('totalCursos').textContent = data.data.totalCursos;
                document.getElementById('totalInscripciones').textContent = data.data.totalInscripciones;

                // Rellenamos la tabla de cursos rápidos
                const tablaCursos = document.getElementById('tablaCursosRapidos');
                tablaCursos.innerHTML = ''; // Limpiamos los datos de prueba

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
            } else {
                console.error("Error del servidor:", data.message);
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    };

    cargarDashboard();
});
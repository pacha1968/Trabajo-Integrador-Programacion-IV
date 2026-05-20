document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const nombreAdmin = localStorage.getItem('userName');
    const displayAdmin = document.querySelector('.text-white.text-end span');
    if (nombreAdmin && displayAdmin) displayAdmin.textContent = nombreAdmin;

    try {
        const response = await fetch('http://localhost:3000/api/stats');
        const stats = await response.json();
        
        const tarjetas = document.querySelectorAll('h3.fw-bold.mb-0');
        if (tarjetas.length >= 2) {
            tarjetas[0].textContent = stats.totalEstudiantes; // Estudiantes Activos
            tarjetas[1].textContent = stats.totalCursos;      // Cursos Disponibles
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
});
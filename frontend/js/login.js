document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
            
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtenemos los valores de los IDs de tu HTML
        const username = document.getElementById('usuario').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardamos el token y el nombre para usarlos en todo el sitio
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', `${data.user.nombre} ${data.user.apellido}`);
                
                // Alerta estética de éxito con temporizador de redirección
                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido, ${data.user.nombre}!`,
                    text: 'Ingresando al sistema de gestión...',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'index.html';
                });

            } else {
                // Si el backend rechaza las credenciales, mostramos alerta de advertencia
                Swal.fire({
                    icon: 'warning',
                    title: 'Acceso Denegado',
                    text: data.message || data.error || 'Credenciales incorrectas.',
                    confirmButtonColor: '#002147' // Color azul oscuro a tono con el diseño
                });
            }   
        } catch (error) {
            console.error(error);
            // Alerta roja de error crítico de conexión con el servidor
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor. Asegurate de que el backend esté corriendo.',
                confirmButtonColor: '#002147'
            });
        }
    });
});
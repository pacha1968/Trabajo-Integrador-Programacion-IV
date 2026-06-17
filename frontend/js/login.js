document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const inputPassword = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (btnTogglePassword) {
        btnTogglePassword.addEventListener('click', () => {
            const tipoActual = inputPassword.getAttribute('type');
            const nuevoTipo = tipoActual === 'password' ? 'text' : 'password';
            inputPassword.setAttribute('type', nuevoTipo);
            
            toggleIcon.classList.toggle('bi-eye');
            toggleIcon.classList.toggle('bi-eye-slash');
        });
    }
            
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('usuario').value;
        const password = inputPassword.value; 

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userName', `${data.user.nombre} ${data.user.apellido}`);
                
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
                Swal.fire({
                    icon: 'warning',
                    title: 'Acceso Denegado',
                    text: data.message || data.error || 'Credenciales incorrectas.',
                    confirmButtonColor: '#002147' 
                });
            }   
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor. Asegurate de que el backend esté corriendo.',
                confirmButtonColor: '#002147'
            });
        }
    });
});
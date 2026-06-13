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
    
    // Poner el nombre en la barrita de arriba
    const displayNavbar = document.getElementById('nombreUsuarioNavbar');
    if (nombreAdmin && displayNavbar) {
        displayNavbar.textContent = nombreAdmin;
    }

    // Poner el nombre en la tarjeta gigante del centro y actualizar la foto
    const displayPrincipal = document.getElementById('perfilNombrePrincipal');
    const imgPerfilCentro = document.getElementById('imgPerfilCentro');

    if (nombreAdmin) {
        if (displayPrincipal) {
            displayPrincipal.textContent = nombreAdmin;
        }
        // Genera una imagen con las iniciales del usuario logueado en color azul
        if (imgPerfilCentro) {
            imgPerfilCentro.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreAdmin)}&background=0d6efd&color=fff&size=128&font-size=0.4`;
        }
    }

    // Funcionalidad de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            window.location.href = 'login.html'; 
        });
    }

    // Botón de mentira para rellenar
    const btnProximamente = document.getElementById('btnProximamente');
    if (btnProximamente) {
        btnProximamente.addEventListener('click', () => {
            Swal.fire({
                icon: 'info',
                title: 'Próximamente',
                text: 'La edición de perfil estará disponible en la próxima versión.',
                confirmButtonColor: '#0056b3'
            });
        });
    }
});
const form = document.querySelector('form');
        
        form.addEventListener('submit', async (e) => {
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
                    
                    alert(`¡Bienvenido, ${data.user.nombre}!`);
                    window.location.href = 'index.html';
                } else {
                // Si existe el mensaje lo muestra, sino muestra el error del catch
                    alert(data.message || data.error);
                }   
            } catch (error) {
                console.error(error);
                alert("Error al conectar con el servidor. Asegurate de que node index.js esté corriendo.");
            }
        });
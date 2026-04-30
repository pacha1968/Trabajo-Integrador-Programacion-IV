const form = document.querySelector('form'); // Asegurate que sea la etiqueta de tu form
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Capturamos los datos de los inputs (fijate que el ID coincida)
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
            alert("¡Bienvenido!");
            window.location.href = 'index.html'; // Te manda al inicio si sale bien
            } else {
            alert("Error: " + data.message);
            }
        });
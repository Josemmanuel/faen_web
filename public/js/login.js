document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    const loginButton = document.getElementById('login-button');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Reset visual
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
        loginButton.disabled = true;
        loginButton.textContent = 'Cargando...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                const data = await response.json();

                // ESTAS SON LAS LÍNEAS CLAVE:
                localStorage.setItem('faen_auth_token', data.access_token);
                localStorage.setItem('faen_auth_user', JSON.stringify(data.user));

                window.location.href = 'admin.html';
            } else {
                errorEl.textContent = data.message || 'Credenciales incorrectas';
                errorEl.style.display = 'block';
                loginButton.disabled = false;
                loginButton.textContent = 'Iniciar Sesión';
            }
        } catch (error) {
            errorEl.textContent = 'Error de conexión con el servidor';
            errorEl.style.display = 'block';
            loginButton.disabled = false;
            loginButton.textContent = 'Iniciar Sesión';
        }
    });
});
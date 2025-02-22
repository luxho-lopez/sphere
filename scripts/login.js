// /sphere/scripts/login.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir recarga del formulario
            const formData = new FormData(form);

            try {
                const response = await fetch('/sphere/api/login.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = 'index.html';
                } else {
                    alert('Login failed: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred during login.');
            }
        });
    }
});
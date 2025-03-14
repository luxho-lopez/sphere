document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            // Extract fields
            const contact = formData.get('contact'); // Could be email or phone
            const password = formData.get('password');

            // Basic validation
            if (!contact || !password) {
                alert('Please fill in all required fields.');
                return;
            }

            try {
                const response = await fetch('/main/api/login.php', {
                    method: 'POST',
                    body: formData
                });

                // Log raw response for debugging (optional)
                const responseText = await response.text();
                console.log('Raw server response:', responseText);

                const data = JSON.parse(responseText);
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

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.name = isPassword ? 'eye-off-outline' : 'eye-outline';
        });
    }
});
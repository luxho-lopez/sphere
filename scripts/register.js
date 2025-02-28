document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInputConfirm = document.getElementById('password_confirm');
    const toggleConfirm = document.getElementById('toggle_confirm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            // Extract fields
            const contact = formData.get('contact');
            const firstName = formData.get('first_name');
            const lastName = formData.get('last_name');
            const password = formData.get('password');
            const passwordConfirm = formData.get('password_confirm');

            // Basic validation
            if (!contact || !firstName || !lastName || !password || !passwordConfirm) {
                alert('Please fill in all required fields.');
                return;
            }

            // Check if passwords match
            if (password !== passwordConfirm) {
                alert('Passwords do not match.');
                return;
            }

            try {
                const response = await fetch('/sphere/api/register.php', {
                    method: 'POST',
                    body: formData
                });

                // Log raw response for debugging
                const responseText = await response.text();
                console.log('Raw server response:', responseText);

                // Parse as JSON
                const data = JSON.parse(responseText);

                if (data.success) {
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error registering:', error);
                alert('An error occurred during registration.');
            }
        });
    }

    if (passwordInput && togglePassword) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePassword.name = isPassword ? 'eye-off-outline' : 'eye-outline';
        });
    }

    if (passwordInputConfirm && toggleConfirm) {
        toggleConfirm.addEventListener('click', () => {
            const isPasswordConfirm = passwordInputConfirm.type === 'password';
            passwordInputConfirm.type = isPasswordConfirm ? 'text' : 'password';
            toggleConfirm.name = isPasswordConfirm ? 'eye-off-outline' : 'eye-outline';
        });
    }
});
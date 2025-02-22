// /sphere/scripts/change_password.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('change-password-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch('/sphere/api/change_password.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    alert('Password changed successfully');
                    window.location.href = 'profile.html';
                } else {
                    alert('Error: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error changing password:', error);
                alert('An error occurred while changing the password.');
            }
        });
    }
});
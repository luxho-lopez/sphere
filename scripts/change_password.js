document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('change-password-form');
    const currentPasswordInput = document.getElementById('current_password');
    const toggleCurrent = document.getElementById('toggle_current');
    const newPasswordInput = document.getElementById('new_password');
    const toggleNew = document.getElementById('toggle_new');
    const confirmPasswordInput = document.getElementById('new_password_confirm');
    const toggleConfirm = document.getElementById('toggle_confirm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            // Extract fields
            const currentPassword = formData.get('current_password');
            const newPassword = formData.get('new_password');
            const newPasswordConfirm = formData.get('new_password_confirm');

            // Basic validation
            if (!currentPassword || !newPassword || !newPasswordConfirm) {
                alert('Please fill in all required fields.');
                return;
            }

            // Check if new passwords match
            if (newPassword !== newPasswordConfirm) {
                alert('New passwords do not match.');
                return;
            }

            try {
                const response = await fetch('/sphere/api/change_password.php', {
                    method: 'POST',
                    body: formData
                });

                // Log raw response for debugging (optional)
                const responseText = await response.text();
                console.log('Raw server response:', responseText);

                const data = JSON.parse(responseText);
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

    if (toggleCurrent && currentPasswordInput) {
        toggleCurrent.addEventListener('click', () => {
            const isCurrentPassword = currentPasswordInput.type === 'password';
            currentPasswordInput.type = isCurrentPassword ? 'text' : 'password';
            toggleCurrent.name = isCurrentPassword ? 'eye-off-outline' : 'eye-outline';
        });
    }

    if (toggleNew && newPasswordInput) {
        toggleNew.addEventListener('click', () => {
            const isNewPassword = newPasswordInput.type === 'password';
            newPasswordInput.type = isNewPassword ? 'text' : 'password';
            toggleNew.name = isNewPassword ? 'eye-off-outline' : 'eye-outline';
        });
    }

    if (toggleConfirm && confirmPasswordInput) {
        toggleConfirm.addEventListener('click', () => {
            const isConfirmPassword = confirmPasswordInput.type === 'password';
            confirmPasswordInput.type = isConfirmPassword ? 'text' : 'password';
            toggleConfirm.name = isConfirmPassword ? 'eye-off-outline' : 'eye-outline';
        });
    }
});
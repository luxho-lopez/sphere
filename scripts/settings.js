document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/main/api/get_user_settings.php', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.success) {
            alert('Error: ' + data.message);
            window.location.href = 'login.html';
            return;
        }

        // Populate fields
        document.getElementById('email').textContent = data.data.email || 'Not set';
        document.getElementById('phone').textContent = data.data.phone || 'Not set';
        document.getElementById('username').textContent = data.data.username;
        document.getElementById('first_name').textContent = data.data.first_name;
        document.getElementById('last_name').textContent = data.data.last_name;
        document.getElementById('profile_picture').src = data.data.profile_picture || '/main/images/profile/default-avatar.png';
        document.getElementById('cover_photo').src = data.data.cover_photo || '/main/images/covers/default-cover-photo.png';
        document.getElementById('description').textContent = data.data.description || 'No description set';
    } catch (error) {
        console.error('Error fetching settings:', error);
        alert('An error occurred while loading settings.');
        window.location.href = 'login.html';
    }

    const modal = document.getElementById('edit-modal');
    const modalField = document.getElementById('modal-field');
    const modalValue = document.getElementById('modal-value');
    const modalFile = document.getElementById('modal-file');
    const modalPreview = document.getElementById('modal-preview');
    const passwordConfirm = document.getElementById('password-confirm');
    const currentPassword = document.getElementById('current_password');
    const togglePassword = document.getElementById('toggle-password');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const sensitiveFields = ['email', 'phone', 'password', 'username'];

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.field;
            modalField.textContent = field.replace(/_/g, ' ').toUpperCase();

            if (field === 'profile_picture' || field === 'cover_photo') {
                modalValue.style.display = 'none';
                modalFile.style.display = 'block';
                modalPreview.style.display = 'block';
                modalPreview.src = document.getElementById(field).src;
            } else {
                modalValue.style.display = 'block';
                modalFile.style.display = 'none';
                modalPreview.style.display = 'none';
                modalValue.value = document.getElementById(field).textContent === 'Not set' ? '' : document.getElementById(field).textContent;
            }

            passwordConfirm.style.display = sensitiveFields.includes(field) ? 'block' : 'none';
            modal.classList.remove('hidden');
            currentPassword.value = '';

            modalFile.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => modalPreview.src = reader.result;
                    reader.readAsDataURL(file);
                }
            };

            let isPasswordVisible = false;
            togglePassword.onclick = () => {
                isPasswordVisible = !isPasswordVisible;
                currentPassword.type = isPasswordVisible ? 'text' : 'password';
                togglePassword.innerHTML = isPasswordVisible ? 
                    '<i class="fa-regular fa-eye text-xl"></i>' : 
                    '<i class="fa-solid fa-eye-slash text-xl"></i>';
            };

            saveBtn.onclick = async () => {
                const formData = new FormData();
                formData.append('field', field);

                if (field === 'profile_picture' || field === 'cover_photo') {
                    const file = modalFile.files[0];
                    if (!file) {
                        alert('Please select an image.');
                        return;
                    }
                    formData.append('value', file);
                } else {
                    const value = modalValue.value.trim();
                    if (!value) {
                        alert('Value cannot be empty.');
                        return;
                    }
                    formData.append('value', value);
                }

                if (sensitiveFields.includes(field)) {
                    const password = currentPassword.value;
                    if (!password) {
                        alert('Please enter your current password.');
                        return;
                    }
                    formData.append('current_password', password);
                }

                try {
                    const response = await fetch('/main/api/update_setting.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });
                    const data = await response.json();

                    if (data.success) {
                        if (field === 'profile_picture' || field === 'cover_photo') {
                            const file = modalFile.files[0];
                            document.getElementById(field).src = URL.createObjectURL(file);
                        } else {
                            document.getElementById(field).textContent = modalValue.value;
                        }
                        modal.classList.add('hidden');
                    } else {
                        alert('Error: ' + (data.message || 'Unknown error')); // Mostrar mensaje específico del servidor
                    }
                } catch (error) {
                    console.error('Error updating setting:', error);
                    alert('An error occurred.');
                }
            };
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modalFile.value = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            modalFile.value = '';
        }
    });
});
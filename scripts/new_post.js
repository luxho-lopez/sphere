document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch('/sphere/api/new_post.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    alert('Post created successfully.');
                    window.location.href = 'index.html';
                } else {
                    alert('Error creating post: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('An error occurred while creating the post.');
            }
        });
    }
});
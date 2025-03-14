document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('new-post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                const response = await fetch('/main/api/new_post.php', {
                    method: 'POST',
                    body: formData
                });

                // Check if response is OK before parsing JSON
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Server error: ${response.status} - ${text}`);
                }

                const data = await response.json();
                
                if (data.success) {
                    alert('Post created successfully.');
                    window.location.href = 'index.html';
                } else {
                    alert('Error creating post: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('An error occurred while creating the post: ' + error.message);
            }
        });
    }
});
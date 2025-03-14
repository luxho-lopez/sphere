document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post_id');

    if (!postId) {
        alert('No post ID provided');
        window.location.href = '/main/index.html';
        return;
    }

    await loadPostData(postId);

    const form = document.getElementById('edit-post-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePostChanges(postId);
    });
});

async function loadPostData(postId) {
    try {
        const response = await fetch('/main/api/posts.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        const posts = await response.json();
        const post = posts.find(p => p.id == postId);

        if (!post) {
            alert('Post not found');
            window.location.href = '/main/index.html';
            return;
        }

        document.getElementById('title').value = post.title;
        document.getElementById('content').value = post.content;
    } catch (error) {
        console.error('Error loading post data:', error);
        alert('Error loading post');
        window.location.href = '/main/index.html';
    }
}

async function savePostChanges(postId) {
    const form = document.getElementById('edit-post-form');
    const formData = new FormData(form);
    const postData = {
        post_id: postId,
        title: formData.get('title'),
        content: formData.get('content')
    };

    try {
        const response = await fetch('/main/api/edit_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            alert('Post updated successfully');
            window.location.href = '/main/index.html';
        } else {
            console.error('Edit post failed:', data.message);
            alert('Failed to update post: ' + data.message);
        }
    } catch (error) {
        console.error('Error saving post changes:', error);
        alert('Error saving changes');
    }
}
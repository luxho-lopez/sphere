document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, starting profile load');
    try {
        const user = await fetchUserProfile();
        if (user) {
            await fetchUserPosts(user.id);
        }
        console.log('Profile load completed');
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/login.html';
    }
});

async function fetchUserProfile() {
    const profileSection = document.getElementById('profile');
    if (!profileSection) {
        console.error('Profile section not found');
        throw new Error('Profile section not found in DOM');
    }

    try {
        console.log('Fetching user from /sphere/api/get_user.php');
        const response = await fetch('/sphere/api/get_user.php');
        console.log('User response received, status:', response.status);
        const data = await response.json();
        console.log('User data:', data);

        if (!data.success || !data.usuario?.length) {
            throw new Error(data.message || 'No user data');
        }

        const user = data.usuario[0];
        profileSection.innerHTML = `
            <div class="user-profile">
                <img src="${user.foto_perfil || '/sphere/images/profile/default-avatar.png'}" alt="${user.nombre}" class="profile-avatar">
                <h2>${user.nombre} ${user.apellido}</h2>
                <p>${user.correo}</p>
                <p>Joined: ${new Date(user.fecha_registro).toLocaleDateString()}</p>
            </div>
            <h3>Your Posts</h3>
            <div id="user-posts"></div>
        `;
        console.log('User profile rendered');
        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

async function fetchUserPosts(userId) {
    const postsContainer = document.getElementById('user-posts');
    if (!postsContainer) {
        console.error('User posts container not found');
        return;
    }

    try {
        console.log('Fetching user posts from /sphere/api/posts.php');
        const response = await fetch('/sphere/api/posts.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        console.log('Posts response received, status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
        console.log('Posts data:', posts);
        const userPosts = posts.filter(post => post.usuario_id == userId);

        postsContainer.innerHTML = '';
        for (const [index, post] of userPosts.entries()) {
            const postElement = await createPostElement(post, index);
            postsContainer.appendChild(postElement);
            if (Array.isArray(post.images) && post.images.length >= 2) {
                new Swiper(`#swiper-container-${index}`, {
                    loop: true,
                    pagination: {
                        el: `#swiper-container-${index} .swiper-pagination`,
                        clickable: true
                    },
                    navigation: {
                        nextEl: `#swiper-container-${index} .swiper-button-next`,
                        prevEl: `#swiper-container-${index} .swiper-button-prev`
                    },
                    slidesPerView: 1,
                    slidesPerGroup: 1
                });
            }
        }
        console.log('User posts rendered');
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
}

async function createPostElement(post, index) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    const truncatedContent = truncateContent(post.contenido, 50);
    const images = createImageCarousel(post.images, post.titulo, index);
    const commentsList = post.comments || [];
    const visibleComments = commentsList.slice(0, 2);
    const hasMoreComments = commentsList.length > 2;
    const currentUserId = await getCurrentUserId();
    const postUserId = parseInt(post.usuario_id);
    const commentsHTML = visibleComments.map(comment => createCommentHTML(comment, currentUserId)).join('');

    console.log('Post data:', JSON.stringify(post, null, 2));
    console.log('Current User ID:', currentUserId);
    console.log('Post User ID:', postUserId);
    console.log('Submenu condition:', postUserId === currentUserId);
    console.log('Types:', typeof postUserId, typeof currentUserId);

    postElement.innerHTML = `
        <div class="post-card-header">
            <div class="post-meta">
                <div class="post-meta-data">
                    <a href="#">
                        <img src="${post.author.foto_perfil || '/sphere/images/profile/default-avatar.png'}" class="user-profile-avatar">
                        <span>${post.author.name} ${post.author.lastname}</span>
                        <span style="margin-left: 10px; font-size: 0.7rem; color:gray;">${new Date(post.fecha_publicacion).toLocaleDateString()}</span>
                    </a>
                </div>
                <div class="post-actions">
                    <ion-icon name="ellipsis-vertical-outline" class="submenu-toggle"></ion-icon>
                    <div class="submenu" style="display: none;">
                        ${postUserId === currentUserId ? `
                            <button class="edit-post-btn">Edit Post</button>
                            <button class="delete-post-btn">Delete Post</button>
                        ` : '<span>No actions available</span>'}
                    </div>
                </div>
            </div>
        </div>
        <div class="post-card-body">
            ${images}
            <div class="post-card-content">
                <h3>${post.titulo}</h3>
                <p class="post-content">${truncatedContent}</p>
                <button class="read-more-btn">Read More</button>
            </div>
            <div class="comments-section" data-post-id="${post.id}">
                <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                <button class="submit-comment-btn">Post</button>
            </div>
        </div>
        <div class="post-card-footer">
            <div class="reactions">
                <button class="reaction-btn" data-post-id="${post.id}">
                    <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="reaction-icon" style="color: ${post.user_liked ? 'green' : 'white'};"></ion-icon>
                    <span class="like-count">${post.like_count}</span>
                </button>
                <button class="comment-btn">
                    <ion-icon name="chatbubbles-outline" style="color: ${commentsList.length >= 1 ? 'green' : 'white'};"></ion-icon>
                    <span class="comment-count">${commentsList.length}</span>
                </button>
            </div>
            <div>
                <div class="comments-list">${commentsHTML}</div>
                ${hasMoreComments ? `<button class="view-more-comments-btn">View More Comments (${commentsList.length - 2})</button>` : ''}
            </div>
        </div>
    `;

    postElement.querySelector('.reaction-btn').addEventListener('click', () => handleLike(post, postElement));
    postElement.querySelector('.read-more-btn').addEventListener('click', () => {
        postElement.querySelector('.post-content').textContent = post.contenido;
        postElement.querySelector('.read-more-btn').style.display = 'none';
    });
    postElement.querySelector('.submit-comment-btn').addEventListener('click', () => handleComment(post.id, postElement));
    
    const submenuToggle = postElement.querySelector('.submenu-toggle');
    const submenu = postElement.querySelector('.submenu');
    if (submenuToggle && submenu) {
        submenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
            console.log('Submenu toggled:', submenu.style.display);
        });
    }
    
    const editBtn = postElement.querySelector('.edit-post-btn');
    const deleteBtn = postElement.querySelector('.delete-post-btn');
    if (editBtn) editBtn.addEventListener('click', () => editPost(post));
    if (deleteBtn) deleteBtn.addEventListener('click', () => deletePost(post.id, postElement));
    
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => expandComments(post, postElement, currentUserId));
    }
    
    postElement.querySelectorAll('.edit-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => editComment(btn.dataset.commentId, postElement));
    });
    
    return postElement;
}

document.addEventListener('click', (event) => {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        const submenuToggle = submenu.previousElementSibling;
        if (submenu && !submenu.contains(event.target) && !submenuToggle.contains(event.target)) {
            submenu.style.display = 'none';
        }
    });
});

function createCommentHTML(comment, currentUserId) {
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <p>${comment.contenido} <small>- ${comment.user_name} (${new Date(comment.fecha_creacion).toLocaleString()})</small>
                ${comment.user_id === currentUserId ? `
                    <button class="edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
                ` : ''}
            </p>
        </div>
    `;
}

function createImageCarousel(images, title, index) {
    if (!images?.length) return '';
    return images.length > 1 ? `
        <div id="swiper-container-${index}" class="swiper-container">
            <div class="swiper-wrapper">
                ${images.map(img => `<div class="swiper-slide"><img src="${img}" alt="${title}" class="post-image"></div>`).join('')}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>` : `<img src="${images[0]}" alt="${title}" class="post-image">`;
}

async function handleLike(post, postElement) {
    const url = post.user_liked ? '/sphere/api/delete_like.php' : '/sphere/api/save_like.php';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: post.id })
        });
        const data = await response.json();
        if (data.success) {
            post.user_liked = !post.user_liked;
            post.like_count += post.user_liked ? 1 : -1;
            const btn = postElement.querySelector('.reaction-btn');
            btn.querySelector('ion-icon').name = post.user_liked ? 'heart' : 'heart-outline';
            btn.querySelector('ion-icon').style.color = post.user_liked ? 'green' : 'white';
            postElement.querySelector('.like-count').textContent = `${post.like_count}`;
        } else {
            console.error('Like action failed:', data.message);
        }
    } catch (error) {
        console.error('Error handling like:', error);
    }
}

async function handleComment(postId, postElement) {
    const commentInput = postElement.querySelector('.comment-input');
    const content = commentInput.value.trim();
    if (!content) return;
    try {
        const response = await fetch('/sphere/api/save_comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, content })
        });
        const data = await response.json();
        if (data.success) {
            const userName = await getCurrentUserName();
            const currentUserId = await getCurrentUserId();
            postElement.querySelector('.comments-list').innerHTML += createCommentHTML({
                id: data.comment_id || Date.now(),
                contenido: content,
                user_name: userName,
                fecha_creacion: new Date(),
                user_id: currentUserId
            }, currentUserId);
            commentInput.value = '';

            // Actualizar el conteo de comentarios y el color del ícono
            const commentCount = postElement.querySelector('.comment-count');
            const currentCount = parseInt(commentCount.textContent) || 0;
            commentCount.textContent = currentCount + 1;
            const commentIcon = postElement.querySelector('.comment-btn ion-icon');
            commentIcon.style.color = (currentCount + 1) >= 1 ? 'green' : 'white';

            updateViewMoreButton(postElement, postId);
        } else {
            console.error('Comment failed:', data.message);
        }
    } catch (error) {
        console.error('Error posting comment:', error);
    }
}

function expandComments(post, postElement, currentUserId) {
    const commentsList = postElement.querySelector('.comments-list');
    const totalComments = post.comments.length;
    commentsList.innerHTML = post.comments.map(comment => createCommentHTML(comment, currentUserId)).join('');
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn && totalComments <= commentsList.querySelectorAll('.comment').length) {
        viewMoreBtn.style.display = 'none';
    }

    postElement.querySelectorAll('.edit-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => editComment(btn.dataset.commentId, postElement));
    });
}

async function editComment(commentId, postElement) {
    const commentDiv = postElement.querySelector(`.comment[data-comment-id="${commentId}"]`);
    const commentText = commentDiv.querySelector('p').childNodes[0].textContent.trim();
    const newContent = prompt('Edit your comment:', commentText);
    if (newContent && newContent !== commentText) {
        try {
            const response = await fetch('/sphere/api/edit_comment.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment_id: commentId, content: newContent })
            });
            const data = await response.json();
            if (data.success) {
                commentDiv.querySelector('p').innerHTML = `${newContent} <small>- ${commentDiv.querySelector('small').textContent}</small>
                    <button class="edit-comment-btn" data-comment-id="${commentId}">Edit</button>`;
                commentDiv.querySelector('.edit-comment-btn').addEventListener('click', () => editComment(commentId, postElement));
            } else {
                console.error('Edit comment failed:', data.message);
            }
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    }
}

function updateViewMoreButton(postElement, postId) {
    fetch('/sphere/api/posts.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(posts => {
        const post = posts.find(p => p.id === postId);
        if (post) {
            const commentsList = postElement.querySelector('.comments-list');
            const visibleComments = commentsList.querySelectorAll('.comment').length;
            const totalComments = post.comments.length;

            if (totalComments > 2) {
                let viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
                if (!viewMoreBtn) {
                    viewMoreBtn = document.createElement('button');
                    viewMoreBtn.className = 'view-more-comments-btn';
                    postElement.querySelector('.comments-section').appendChild(viewMoreBtn);
                }
                viewMoreBtn.textContent = `View More Comments (${totalComments - visibleComments})`;
                viewMoreBtn.style.display = 'block';
                viewMoreBtn.addEventListener('click', () => expandComments(post, postElement, currentUserId));
            }
        }
    })
    .catch(error => console.error('Error fetching updated comments:', error));
}

async function getCurrentUserId() {
    try {
        const response = await fetch('/sphere/api/get_user.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.usuario?.length) {
            const userId = parseInt(data.usuario[0].id);
            localStorage.setItem('userId', userId);
            return userId;
        }
        console.log('No user session found');
        return 0;
    } catch (error) {
        console.error('Error getting current user ID:', error);
        return 0;
    }
}

async function getCurrentUserName() {
    const response = await fetch('/sphere/api/get_user.php');
    const data = await response.json();
    return data.success && data.usuario?.length ? data.usuario[0].nombre : 'Unknown';
}

function truncateContent(content, wordLimit) {
    const words = content.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}

async function editPost(post) {
    const currentUserId = await getCurrentUserId();
    const postUserId = parseInt(post.usuario_id);
    console.log('Edit Post - Current User ID:', currentUserId);
    console.log('Edit Post - Post User ID:', postUserId);
    console.log('Edit Post - Condition:', postUserId === currentUserId);
    console.log('Edit Post - Types:', typeof postUserId, typeof currentUserId);

    if (postUserId !== currentUserId) {
        alert('You do not have permission to edit this post.');
        return;
    }
    window.location.href = `/sphere/edit_post.html?post_id=${post.id}`;
}

async function deletePost(postId, postElement) {
    const currentUserId = await getCurrentUserId();
    const confirmDelete = confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
        try {
            const response = await fetch('/sphere/api/delete_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId })
            });
            const data = await response.json();
            if (data.success) {
                postElement.remove();
                console.log('Post deleted successfully');
            } else {
                console.error('Delete post failed:', data.message);
                alert('Failed to delete post: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        }
    }
}
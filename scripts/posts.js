document.addEventListener('DOMContentLoaded', async () => {
    fetchPosts();
});

async function fetchPosts() {
    const postsContainer = document.getElementById('posts');
    if (!postsContainer) {
        console.error('Posts container not found');
        return;
    }

    try {
        const response = await fetch('/sphere/api/posts.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();

        postsContainer.innerHTML = '';
        posts.forEach((post, index) => {
            const postElement = createPostElement(post, index);
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
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function createPostElement(post, index) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    const truncatedContent = truncateContent(post.contenido, 50);
    const images = createImageCarousel(post.images, post.titulo, index);

    // Generar comentarios iniciales (hasta 2) y botón "Ver más" si hay más
    const commentsList = post.comments || [];
    const visibleComments = commentsList.slice(0, 2); // Mostrar solo 2 comentarios por defecto
    const hasMoreComments = commentsList.length > 2;

    const commentsHTML = visibleComments.map(comment => `
        <div class="comment" data-comment-id="${comment.id}">
            <p>${comment.contenido} <small>- ${comment.user_name} (${new Date(comment.fecha_creacion).toLocaleString()})</small>
                ${comment.user_id === getCurrentUserId() ? `
                    <button class="edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
                ` : ''}
            </p>
        </div>
    `).join('');

    postElement.innerHTML = `
        <div class="post-card-header">
            <h3>${post.titulo}</h3>
            <div class="post-meta">
                <span>By ${post.author.name} ${post.author.lastname}</span>
                <span>${new Date(post.fecha_publicacion).toLocaleDateString()}</span>
            </div>
        </div>
        <div class="post-card-body">
            ${images}
            <div class="post-card-content">
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
                <button class="comment-btn"><ion-icon name="chatbubbles-outline"></ion-icon></button>
            </div>
            <div >
                    <div class="comments-list">${commentsHTML}</div>
                    ${hasMoreComments ? `<button class="view-more-comments-btn">View More Comments (${commentsList.length - 2})</button>` : ''}
            </div>
        </div>
    `;

    // Listeners para botones
    postElement.querySelector('.reaction-btn').addEventListener('click', () => handleLike(post, postElement));
    postElement.querySelector('.read-more-btn').addEventListener('click', () => {
        postElement.querySelector('.post-content').textContent = post.contenido;
        postElement.querySelector('.read-more-btn').style.display = 'none';
    });
    postElement.querySelector('.submit-comment-btn').addEventListener('click', () => handleComment(post.id, postElement));

    // Listener para "Ver más comentarios"
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => expandComments(post, postElement));
    }

    // Listeners para edición de comentarios
    postElement.querySelectorAll('.edit-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => editComment(btn.dataset.commentId, postElement));
    });

    return postElement;
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
            const userName = await getCurrentUserName(); // Obtener el nombre del usuario actual
            postElement.querySelector('.comments-list').innerHTML += `
                <div class="comment" data-comment-id="${data.comment_id || Date.now()}">
                    <p>${content} <small>- ${userName} (${new Date().toLocaleString()})</small>
                        <button class="edit-comment-btn" data-comment-id="${data.comment_id || Date.now()}">Edit</button>
                    </p>
                </div>
            `;
            commentInput.value = '';
            updateViewMoreButton(postElement, post.comments || []);
        } else {
            console.error('Comment failed:', data.message);
        }
    } catch (error) {
        console.error('Error posting comment:', error);
    }
}

function expandComments(post, postElement) {
    const commentsList = postElement.querySelector('.comments-list');
    commentsList.innerHTML = post.comments.map(comment => `
        <div class="comment" data-comment-id="${comment.id}">
            <p>${comment.contenido} <small>- ${comment.user_name} (${new Date(comment.fecha_creacion).toLocaleString()})</small>
                ${comment.user_id === getCurrentUserId() ? `
                    <button class="edit-comment-btn" data-comment-id="${comment.id}">Edit</button>
                ` : ''}
            </p>
        </div>
    `).join('');
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn) viewMoreBtn.style.display = 'none';

    // Reasignar listeners para edición
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
                // Reasignar listener después de editar
                commentDiv.querySelector('.edit-comment-btn').addEventListener('click', () => editComment(commentId, postElement));
            } else {
                console.error('Edit comment failed:', data.message);
            }
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    }
}

function updateViewMoreButton(postElement, comments) {
    const commentsList = postElement.querySelector('.comments-list');
    const visibleComments = commentsList.querySelectorAll('.comment').length;
    const totalComments = comments.length + visibleComments;
    if (totalComments > 2) {
        let viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
        if (!viewMoreBtn) {
            viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'view-more-comments-btn';
            postElement.querySelector('.comments-section').appendChild(viewMoreBtn);
        }
        viewMoreBtn.textContent = `View More Comments (${totalComments - visibleComments})`;
        viewMoreBtn.style.display = 'block';
        viewMoreBtn.addEventListener('click', () => expandComments({ comments }, postElement));
    }
}

// Funciones auxiliares (simuladas, ajusta según tu backend)
function getCurrentUserId() {
    // Esto debería obtener el ID del usuario actual desde la sesión o una variable global
    return parseInt(localStorage.getItem('userId')) || 0; // Ejemplo, ajusta según tu implementación
}

async function getCurrentUserName() {
    // Esto debería obtener el nombre del usuario actual desde una API o sesión
    const response = await fetch('/sphere/api/get_user.php');
    const data = await response.json();
    return data.success && data.usuario?.length ? data.usuario[0].nombre : 'Unknown';
}

function truncateContent(content, wordLimit) {
    const words = content.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}
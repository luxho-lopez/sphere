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
    const profileHeader = document.getElementById('user-profile');
    const profileLink = document.querySelector('.profile-link');
    const notifyLink = document.querySelector('.notify-link');
    const newPostLink = document.querySelector('.new_post-link');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const logoContainer = document.querySelector('.logo');

    if (!profileSection) {
        console.error('Profile section not found');
        throw new Error('Profile section not found in DOM');
    }

    try {
        const response = await fetch('/sphere/api/get_user.php');
        const data = await response.json();

        if (!data.success || !data.usuario?.length) {
            throw new Error(data.message || 'No user data');
        }

        const user = data.usuario[0];

        // Agregar botón de menú después del logo
        if (logoContainer) {
            logoContainer.innerHTML = `
                <a href="/sphere/index.html"><h1 class="text-2xl font-bold text-gray-800">Sphere</h1></a>
                <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                    <ion-icon name="menu-outline" class="text-2xl"></ion-icon>
                </button>
            `;
            setupMenuToggle(); // Configurar el toggle después de agregar el botón
        }

        // Actualizar header según autenticación
        if (profileHeader) {
            profileHeader.innerHTML = `
                <a href="/sphere/profile.html" class="user-profile-link flex items-center space-x-2">
                    <img src="${user.foto_perfil || '/sphere/images/profile/default-avatar.png'}" alt="${user.nombre}" class="w-8 h-8 rounded-full object-cover">
                </a>
                <ul class="sub-menu absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-50 hidden">
                    <li><a href="/sphere/profile.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">${user.nombre} - Ver perfil</a></li>
                    <li><a href="/sphere/change_password.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">Cambiar contraseña</a></li>
                    <li><a href="/sphere/api/logout.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">Cerrar sesión</a></li>
                </ul>
            `;
            if (profileLink) profileLink.classList.remove('hidden');
            if (notifyLink) notifyLink.classList.remove('hidden');
            if (newPostLink) newPostLink.classList.remove('hidden');
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');
        }

        profileSection.innerHTML = `
        <div class="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
            <div class="relative h-48">
                <img src="https://res.cloudinary.com/djv4xa6wu/image/upload/v1735722161/AbhirajK/Abhirajk2.webp" alt="Cover" class="w-full h-full object-cover">
                <div class="absolute -bottom-12 left-6">
                <img src="${user.foto_perfil || '/sphere/images/profile/default-avatar.png'}" alt="${user.nombre}" class="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-lg">
                </div>
            </div>

            <div class="pt-16 px-6 pb-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${user.nombre} ${user.apellido}K</h1>
                    <p class="text-purple-600 dark:text-purple-400">Node.js Developer & Frontend Expert</p>
                </div>
                <a 
                    href="https://abhirajk.vercel.app/" 
                    target="_blank"
                    class="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    View Portfolio
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
                </div>

                <p class="mt-6 text-gray-600 dark:text-gray-300">
                Hi, I'm a passionate developer with expertise in Node.js, React, and Tailwind CSS. I love building efficient and scalable web applications.
                </p>

                <div class="mt-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium">Node.js</span>
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium">React</span>
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium">Tailwind CSS</span>
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg text-sm font-medium">MySQL</span>
                </div>
                </div>

                <div class="mt-6">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact</h2>
                <a 
                    href="mailto:abhirajk@example.com" 
                    class="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline"
                >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    ${user.correo}
                </a>
                </div>
            </div>
            </div>
        `;

        const profileLinkElement = profileHeader.querySelector('.user-profile-link');
        const subMenu = profileHeader.querySelector('.sub-menu');
        if (profileLinkElement && subMenu) {
            profileLinkElement.addEventListener('click', (e) => {
                e.preventDefault();
                subMenu.classList.toggle('hidden');
            });
        }

        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error);

        // Caso de error: mostrar solo "Log In" en el header
        if (profileHeader) {
            profileHeader.innerHTML = '<a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Iniciar sesión</a>';
            if (profileLink) profileLink.classList.add('hidden');
            if (notifyLink) notifyLink.classList.add('hidden');
            if (newPostLink) newPostLink.classList.add('hidden');
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
        }

        if (logoContainer) {
            logoContainer.innerHTML = `
                <a href="/sphere/index.html"><h1 class="text-2xl font-bold text-gray-800">Sphere</h1></a>
                <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                    <ion-icon name="menu-outline" class="text-2xl"></ion-icon>
                </button>
            `;
            setupMenuToggle();
        }

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
        const response = await fetch('/sphere/api/posts.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
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
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
}

async function createPostElement(post, index) {
    const postElement = document.createElement('div');
    postElement.className = 'bg-white shadow-md rounded-lg p-6 mb-6 relative';
    const truncatedContent = truncateContent(post.contenido, 50);
    const images = createImageCarousel(post.images, post.titulo, index);
    const commentsList = post.comments || [];
    const visibleComments = commentsList.slice(0, 2);
    const hasMoreComments = commentsList.length > 2;
    const currentUserId = await getCurrentUserId();
    const postUserId = parseInt(post.usuario_id);
    const commentsHTML = visibleComments.map(comment => createCommentHTML(comment, currentUserId)).join('');

    postElement.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-3">
                <a href="#" class="flex items-center space-x-2">
                    <img src="${post.author.foto_perfil || '/sphere/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover">
                    <span class="text-gray-800 font-medium">${post.author.name} ${post.author.lastname}</span>
                    <span class="text-gray-500 text-xs">${new Date(post.fecha_publicacion).toLocaleDateString()}</span>
                </a>
            </div>
            <div class="relative z-10">
                <ion-icon name="ellipsis-vertical-outline" class="text-gray-600 cursor-pointer submenu-toggle"></ion-icon>
                <div class="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg submenu z-20 hidden">
                    ${postUserId === currentUserId ? `
                        <button class="edit-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Edit Post</button>
                        <button class="delete-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Delete Post</button>
                    ` : '<span class="block px-4 py-2 text-gray-700">No actions available</span>'}
                </div>
            </div>
        </div>
        <div class="mb-4">
            ${images}
            <div class="mt-3">
                <h3 class="text-lg font-semibold text-gray-800">${post.titulo}</h3>
                <p class="post-content text-gray-600 text-sm mt-1">${truncatedContent}</p>
                <button class="read-more-btn text-blue-500 hover:underline text-sm mt-2">Read More</button>
            </div>
        </div>
        <div class="comments-section border-t pt-4" data-post-id="${post.id}">
            <textarea class="comment-input w-full p-2 border rounded resize-none text-sm" placeholder="Add a comment..."></textarea>
            <button class="submit-comment-btn mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">Post</button>
        </div>
        <div class="flex flex-col mt-4">
            <div class="flex justify-around mb-2 space-x-4">
                <button class="reaction-btn flex items-center space-x-1" data-post-id="${post.id}">
                    <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="text-base" style="color: ${post.user_liked ? 'green' : 'gray'};"></ion-icon>
                    <span class="like-count text-gray-600 text-sm">${post.like_count}</span>
                </button>
                <button class="comment-btn flex items-center space-x-1">
                    <ion-icon name="chatbubbles-outline" class="text-base" style="color: ${commentsList.length >= 1 ? 'green' : 'gray'};"></ion-icon>
                    <span class="comment-count text-gray-600 text-sm">${commentsList.length}</span>
                </button>
            </div>
            <div>
                <div class="comments-list space-y-2">${commentsHTML}</div>
                ${hasMoreComments ? `<button class="view-more-comments-btn text-blue-500 hover:underline text-sm mt-2">View More Comments (${commentsList.length - 2})</button>` : ''}
            </div>
        </div>
    `;

    const reactionBtn = postElement.querySelector('.reaction-btn');
    if (reactionBtn) reactionBtn.addEventListener('click', () => handleLike(post, postElement));

    const readMoreBtn = postElement.querySelector('.read-more-btn');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', () => {
            const content = postElement.querySelector('.post-content');
            if (content) content.textContent = post.contenido;
            readMoreBtn.style.display = 'none';
        });
    }

    const submitCommentBtn = postElement.querySelector('.submit-comment-btn');
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', () => handleComment(post.id, postElement));

    const submenuToggle = postElement.querySelector('.submenu-toggle');
    const submenu = postElement.querySelector('.submenu');
    if (submenuToggle && submenu) {
        submenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            submenu.classList.toggle('hidden');
        });
    }

    const editBtn = postElement.querySelector('.edit-post-btn');
    const deleteBtn = postElement.querySelector('.delete-post-btn');
    if (editBtn) editBtn.addEventListener('click', () => editPost(post));
    if (deleteBtn) deleteBtn.addEventListener('click', () => deletePost(post.id, postElement));

    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn) viewMoreBtn.addEventListener('click', () => expandComments(post, postElement, currentUserId));

    const editCommentBtns = postElement.querySelectorAll('.edit-comment-btn');
    editCommentBtns.forEach(btn => {
        btn.addEventListener('click', () => editComment(btn.dataset.commentId, postElement));
    });

    return postElement;
}

document.addEventListener('click', (event) => {
    const submenus = document.querySelectorAll('.submenu');
    submenus.forEach(submenu => {
        const submenuToggle = submenu.previousElementSibling;
        if (submenu && !submenu.contains(event.target) && !submenuToggle.contains(event.target)) {
            submenu.classList.add('hidden');
        }
    });
});

function createCommentHTML(comment, currentUserId) {
    return `
        <div class="comment flex items-start space-x-2" data-comment-id="${comment.id}">
            <p class="text-gray-600 text-sm">${comment.contenido} <span class="text-gray-500 text-xs">- ${comment.user_name} (${new Date(comment.fecha_creacion).toLocaleString()})</span>
                ${comment.user_id === currentUserId ? `
                    <button class="edit-comment-btn text-blue-500 hover:underline text-xs ml-2" data-comment-id="${comment.id}">Edit</button>
                ` : ''}
            </p>
        </div>
    `;
}

function createImageCarousel(images, title, index) {
    if (!images?.length) return '';
    return images.length > 1 ? `
        <div id="swiper-container-${index}" class="swiper-container mb-4 max-w-full">
            <div class="swiper-wrapper">
                ${images.map(img => `<div class="swiper-slide"><img src="${img}" alt="${title}" class="w-full h-48 object-cover rounded-lg"></div>`).join('')}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>` : `<img src="${images[0]}" alt="${title}" class="w-full h-48 object-cover rounded-lg mb-4">`;
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
            if (btn) {
                const icon = btn.querySelector('ion-icon');
                if (icon) {
                    icon.name = post.user_liked ? 'heart' : 'heart-outline';
                    icon.style.color = post.user_liked ? 'green' : 'gray';
                }
                const count = btn.querySelector('.like-count');
                if (count) count.textContent = `${post.like_count}`;
            }
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
            const commentsList = postElement.querySelector('.comments-list');
            if (commentsList) {
                const newCommentHTML = createCommentHTML({
                    id: data.comment_id || Date.now(),
                    contenido: content,
                    user_name: userName,
                    fecha_creacion: new Date(),
                    user_id: currentUserId
                }, currentUserId);
                commentsList.insertAdjacentHTML('beforeend', newCommentHTML);

                const newEditBtn = commentsList.querySelector(`.edit-comment-btn[data-comment-id="${data.comment_id || Date.now()}"]`);
                if (newEditBtn) {
                    newEditBtn.addEventListener('click', () => editComment(newEditBtn.dataset.commentId, postElement));
                }
            }
            commentInput.value = '';

            const commentCount = postElement.querySelector('.comment-count');
            if (commentCount) {
                const currentCount = parseInt(commentCount.textContent) || 0;
                commentCount.textContent = currentCount + 1;
                const commentIcon = postElement.querySelector('.comment-btn ion-icon');
                if (commentIcon) commentIcon.style.color = (currentCount + 1) >= 1 ? 'green' : 'gray';
            }

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
    if (commentsList) {
        commentsList.innerHTML = post.comments.map(comment => createCommentHTML(comment, currentUserId)).join('');
    }
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn && totalComments <= commentsList.querySelectorAll('.comment').length) {
        viewMoreBtn.style.display = 'none';
    }

    const editCommentBtns = postElement.querySelectorAll('.edit-comment-btn');
    editCommentBtns.forEach(btn => {
        btn.addEventListener('click', () => editComment(btn.dataset.commentId, postElement));
    });
}

async function editComment(commentId, postElement) {
    const commentDiv = postElement.querySelector(`.comment[data-comment-id="${commentId}"]`);
    if (!commentDiv) return;
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
                commentDiv.querySelector('p').innerHTML = `${newContent} <span class="text-gray-500 text-xs">- ${commentDiv.querySelector('span').textContent}</span>
                    <button class="edit-comment-btn text-blue-500 hover:underline text-xs ml-2" data-comment-id="${commentId}">Edit</button>`;
                const editBtn = commentDiv.querySelector('.edit-comment-btn');
                if (editBtn) editBtn.addEventListener('click', () => editComment(commentId, postElement));
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
                const visibleComments = commentsList ? commentsList.querySelectorAll('.comment').length : 0;
                const totalComments = post.comments.length;

                if (totalComments > 2) {
                    let viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
                    if (!viewMoreBtn) {
                        viewMoreBtn = document.createElement('button');
                        viewMoreBtn.className = 'view-more-comments-btn text-blue-500 hover:underline text-sm mt-2';
                        const commentsSection = postElement.querySelector('.comments-section');
                        if (commentsSection) commentsSection.appendChild(viewMoreBtn);
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

function setupMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const aside = document.querySelector('aside');
    if (menuToggle && aside) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            aside.classList.toggle('hidden');
            console.log('Menu toggled:', !aside.classList.contains('hidden'));
        });

        document.addEventListener('click', (event) => {
            if (!aside.contains(event.target) && !menuToggle.contains(event.target)) {
                aside.classList.add('hidden');
                console.log('Menu closed by clicking outside');
            }
        });
    } else {
        console.error('Menu toggle or aside not found:', { menuToggle, aside });
    }
}
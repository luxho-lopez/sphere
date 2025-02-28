document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in profile.js, starting profile load');
    (async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const urlParams = new URLSearchParams(window.location.search);
            const userParam = urlParams.get('user');
            const currentUserId = await getCurrentUserId();
            let userId;

            if (userParam) {
                const [idPart] = userParam.split('-');
                userId = idPart;
                console.log('Extracted userId from URL:', userId);
            }

            if (!userId && !currentUserId) {
                console.warn('No user provided and no active session, redirecting to index.html');
                window.location.href = '/sphere/index.html';
                return;
            }

            if (!userId && currentUserId) {
                console.log('No user provided in URL, using current user ID:', currentUserId);
                userId = currentUserId;
            }

            const user = await fetchProfileById(userId);
            if (user) {
                await fetchUserPosts(user.id);
            }
            console.log('Profile load completed');
        } catch (error) {
            console.error('Error loading profile:', error);
            const profileSection = document.getElementById('profile');
            if (profileSection) {
                profileSection.innerHTML = '<p class="text-center text-gray-500">Error loading profile or user not found.</p>';
            }
        }
    })();
});

async function fetchProfileById(userId) {
    const profileSection = document.getElementById('profile');
    if (!profileSection) {
        console.error('Profile section not found');
        throw new Error('Profile section not found in DOM');
    }

    try {
        const response = await fetch(`/sphere/api/get_user_by_id.php?userId=${userId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            throw new Error(data.message || 'No user data');
        }

        const user = data.user;

        profileSection.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
                <div class="relative h-48">
                    <img src="https://res.cloudinary.com/djv4xa6wu/image/upload/v1735722161/AbhirajK/Abhirajk2.webp" alt="Cover" class="w-full h-full object-cover">
                    <div class="absolute -bottom-12 left-6">
                        <img src="${user.profile_picture || '/sphere/images/profile/default-avatar.png'}" alt="${user.first_name}" class="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-lg">
                    </div>
                </div>
                <div class="pt-16 px-6 pb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">${user.first_name} ${user.last_name || ''}</h1>
                            <p class="text-blue-600 dark:text-blue-400">@${user.username}</p>
                        </div>
                        <div>
                            <a href="#" class="inline-flex items-center mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
                                Setting
                                <ion-icon class="ml-2" name="build-outline"></ion-icon>
                            </a>
                            <a href="#" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium">
                                Message
                                <ion-icon class="ml-2" name="paper-plane-outline"></ion-icon>
                            </a>
                        </div>
                    </div>
                    <p class="mt-6 text-gray-600 dark:text-gray-300">
                        Hi, I'm a member of the Sphere community. Check out my posts below!
                    </p>
                    <div class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact</h2>
                        <a href="mailto:${user.email}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            ${user.email}
                        </a>
                    </div>
                </div>
            </div>
        `;

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
        const response = await fetch('/sphere/api/posts.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
        const userPosts = posts.filter(post => parseInt(post.user_id) === parseInt(userId));

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
        postsContainer.innerHTML = '<p class="text-center text-gray-500">No posts found or error loading posts.</p>';
    }
}

async function createPostElement(post, index) {
    const postElement = document.createElement('div');
    postElement.className = 'bg-white shadow-md rounded-lg p-6 mb-6 relative';
    const truncatedContent = truncateContent(post.content, 15);
    const images = createImageCarousel(post.images, post.title, index);
    const commentsList = post.comments || [];
    const visibleComments = commentsList.slice(0, 2);
    const hasMoreComments = commentsList.length > 2;
    const currentUserId = await getCurrentUserId();
    const postUserId = parseInt(post.user_id);
    const commentsHTML = visibleComments.map(comment => createCommentHTML(comment, currentUserId)).join('');

    postElement.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center space-x-3">
                <a href="/sphere/profile.html?user=${postUserId}@${post.author.username}" class="flex items-center space-x-2">
                    <img src="${post.author.profile_picture || '/sphere/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover">
                    <span class="text-gray-800 font-medium">@${post.author.username}</span>
                    <span class="text-gray-500 text-xs">- ${new Date(post.posted_at).toLocaleDateString()}</span>
                </a>
            </div>
            <div class="relative z-10">
                <ion-icon name="ellipsis-vertical-outline" class="text-gray-600 cursor-pointer submenu-toggle"></ion-icon>
                <div class="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg submenu z-20 hidden">
                    ${postUserId === currentUserId && currentUserId !== 0 ? `
                        <button class="edit-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Edit Post</button>
                        <button class="delete-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Delete Post</button>
                    ` : '<span class="block px-4 py-2 text-gray-700">No actions available</span>'}
                </div>
            </div>
        </div>
        <div class="mb-4">
            ${images}
            <div class="mt-3">
                <h3 class="text-lg font-semibold text-gray-800 cursor-pointer">${post.title}</h3>
                <p class="post-content text-gray-600 text-sm mt-1 cursor-pointer">${truncatedContent}</p>
                <button class="read-more-btn text-blue-500 hover:underline text-sm mt-2">Read More</button>
            </div>
        </div>
        <div class="comments-section border-t pt-4 pb-4 hidden" data-post-id="${post.id}">
            <textarea class="comment-input w-full p-2 border rounded resize-none text-sm" placeholder="Add a comment..."></textarea>
            <button class="submit-comment-btn mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">Post</button>
        </div>
        <div class="flex flex-col pt-4 border-t">
            <div class="flex justify-around mb-2 space-x-4">
                <button class="reaction-btn flex items-center space-x-1" data-post-id="${post.id}">
                    <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="text-base" style="color: ${post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'gray'};"></ion-icon>
                    <span class="like-count text-gray-600 text-sm">${post.like_count}</span>
                </button>
                <button class="comment-btn flex items-center space-x-1">
                    <ion-icon name="chatbubbles-outline" class="text-base" style="color: ${commentsList.length >= 1 ? 'oklch(0.623 0.214 259.815)' : 'gray'};"></ion-icon>
                    <span class="comment-count text-gray-600 text-sm">${commentsList.length}</span>
                </button>
            </div>
            <div>
                <div class="comments-list space-y-2">${commentsHTML}</div>
                ${hasMoreComments ? `<button class="view-more-comments-btn text-blue-500 hover:underline text-sm mt-2">View More Comments (${commentsList.length - 2})</button>` : ''}
            </div>
        </div>
    `;

    const title = postElement.querySelector('h3');
    const content = postElement.querySelector('.post-content');
    [title, content].forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            showPostModal(post);
        });
    });

    const reactionBtn = postElement.querySelector('.reaction-btn');
    if (reactionBtn) reactionBtn.addEventListener('click', () => handleLike(post, postElement));

    const readMoreBtn = postElement.querySelector('.read-more-btn');
    // Ocultar el botón "Read More" si el contenido truncado es menor o igual a 50 caracteres
    if (truncatedContent.length <= 50) {
        readMoreBtn.style.display = 'none';
    }
    
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', () => {
            const content = postElement.querySelector('.post-content');
            if (content) content.textContent = post.content;
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

    // Nueva función para mostrar/ocultar la caja de nuevo comentario
    const commentBtn = postElement.querySelector('.comment-btn');
    const commentsSection = postElement.querySelector('.comments-section');
    if (commentBtn && commentsSection) {
        commentBtn.addEventListener('click', () => toggleCommentsSection(commentsSection));
    }

    return postElement;
}

function showPostModal(post) {
    let modal = document.getElementById('post-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'post-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl h-full max-h-[90vh] overflow-y-auto relative">
            <button id="close-modal-btn" class="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
                <ion-icon name="close-outline" class="text-2xl"></ion-icon>
            </button>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">${post.title}</h2>
            ${createImageCarousel(post.images, post.title, 'modal')}
            <p class="text-gray-600 mt-4">${post.content}</p>
            <div class="flex items-center justify-between text-sm text-gray-500 mt-4">
                <span>By ${post.author.first_name} ${post.author.last_name}</span>
                <span>${new Date(post.posted_at).toLocaleDateString()}</span>
            </div>
            <div class="mt-4 flex items-center space-x-4">
                <button class="reaction-btn flex items-center space-x-1 text-gray-600 hover:text-blue-500" data-post-id="${post.id}">
                    <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="text-xl" style="color: ${post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'gray'};"></ion-icon>
                    <span class="like-count">${post.like_count}</span>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    if (post.images && post.images.length >= 2) {
        new Swiper('#swiper-container-modal', {
            loop: true,
            pagination: { el: '#swiper-container-modal .swiper-pagination', clickable: true },
            navigation: {
                nextEl: '#swiper-container-modal .swiper-button-next',
                prevEl: '#swiper-container-modal .swiper-button-prev'
            },
            slidesPerView: 1,
            slidesPerGroup: 1
        });
    }

    const closeBtn = modal.querySelector('#close-modal-btn');
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    const modalReactionBtn = modal.querySelector('.reaction-btn');
    if (modalReactionBtn) {
        modalReactionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleLike(post, modal);
        });
    }
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
        <div class="comment flex items-start space-x-2 border-b" data-comment-id="${comment.id}">
            <p class="text-gray-600 text-sm">${comment.content} <span class="text-gray-500 text-xs">- @${comment.username} (${new Date(comment.created_at).toLocaleString()})</span>
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
                    icon.style.color = post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'gray';
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


// Funcion que oculta y muestra la caja de nuevo comentario
function toggleCommentsSection(commentsSection) {
    commentsSection.classList.toggle('hidden');
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
                    content: content,
                    user_name: userName,
                    created_at: new Date(),
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
                if (commentIcon) commentIcon.style.color = (currentCount + 1) >= 1 ? 'oklch(0.623 0.214 259.815)' : 'gray';
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
                viewMoreBtn.addEventListener('click', () => expandComments(post, postElement, getCurrentUserId()));
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
        if (data.success && data.user?.length) {
            const userId = parseInt(data.user[0].id);
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
    try {
        const response = await fetch('/sphere/api/get_user.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        return data.success && data.user?.length ? data.user[0].first_name : 'Unknown';
    } catch (error) {
        console.error('Error getting current user name:', error);
        return 'Unknown';
    }
}

function truncateContent(content, wordLimit) {
    const words = content.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : content;
}

async function editPost(post) {
    const currentUserId = await getCurrentUserId();
    const postUserId = parseInt(post.user_id);
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
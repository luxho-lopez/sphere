document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post_id');

    if (!postId) {
        console.error('No post_id provided in URL');
        document.getElementById('post').innerHTML = '<p class="text-center text-gray-500">No post specified.</p>';
        return;
    }

    await fetchSinglePost(postId);
});

async function fetchSinglePost(postId) {
    const postContainer = document.getElementById('post');
    if (!postContainer) {
        console.error('Post container not found');
        return;
    }

    try {
        const response = await fetch(`/sphere/api/get_post.php?post_id=${encodeURIComponent(postId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.post) {
            throw new Error(data.message || 'Post not found');
        }

        const post = data.post;
        const postElement = await createPostElement(post, 0);
        postContainer.appendChild(postElement);

        if (Array.isArray(post.images) && post.images.length >= 2) {
            new Swiper('#swiper-container-0', {
                loop: true,
                pagination: {
                    el: '#swiper-container-0 .swiper-pagination',
                    clickable: true
                },
                navigation: {
                    nextEl: '#swiper-container-0 .swiper-button-next',
                    prevEl: '#swiper-container-0 .swiper-button-prev'
                },
                slidesPerView: 1,
                slidesPerGroup: 1
            });
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        postContainer.innerHTML = `<p class="text-center text-gray-500">Error loading post: ${error.message}</p>`;
    }
}

async function createPostElement(post, index) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl';
    const isTruncated = post.content.split(' ').length > 15;
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
                <a href="/sphere/profile.html?user=@${post.author.username}" class="flex items-center space-x-3 group">
                    <img src="${post.author.profile_picture || '/sphere/images/profile/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 transition-transform group-hover:scale-105">
                    <div>
                        <span class="text-gray-800 font-semibold text-sm group-hover:text-blue-600 transition-colors">@${post.author.username}</span>
                        <span class="text-gray-500 text-xs block">${new Date(post.posted_at).toLocaleDateString()}</span>
                    </div>
                </a>
            </div>
            <div class="relative z-10">
                <ion-icon name="ellipsis-vertical-outline" class="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors submenu-toggle"></ion-icon>
                <div class="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg submenu hidden border border-gray-100">
                    ${postUserId === currentUserId && currentUserId !== 0 ? `
                        <button class="edit-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">Edit Post</button>
                        <button class="delete-post-btn block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">Delete Post</button>
                    ` : '<span class="block px-4 py-2 text-gray-500 text-sm">No actions available</span>'}
                </div>
            </div>
        </div>
        <div class="mb-4">
            ${images}
            <div class="mt-4">
                <h3 class="post-title text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">${post.title}</h3>
                <p class="post-content text-gray-600 text-sm mt-2 cursor-pointer transition-all duration-300" data-full="${post.content}">${truncatedContent}</p>
                ${isTruncated ? '<button class="toggle-content-btn text-blue-500 hover:text-blue-600 text-sm mt-2 font-medium transition-colors">Read More</button>' : ''}
            </div>
        </div>
        <div class="comments-section border-t border-gray-100 pt-4 pb-4 hidden" data-post-id="${post.id}">
            <textarea class="comment-input w-full p-3 border border-gray-200 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Add a comment..."></textarea>
            <button class="submit-comment-btn mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">Post</button>
        </div>
        <div class="flex flex-col pt-4 border-t border-gray-100">
            <div class="flex justify-around mb-3">
                <button class="reaction-btn flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors" data-post-id="${post.id}">
                    <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="text-lg" style="color: ${post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'inherit'};"></ion-icon>
                    <span class="like-count text-sm font-medium">${post.like_count}</span>
                </button>
                <button class="comment-btn flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                    <ion-icon name="chatbubbles-outline" class="text-lg" style="color: ${commentsList.length >= 1 ? 'oklch(0.623 0.214 259.815)' : 'inherit'};"></ion-icon>
                    <span class="comment-count text-sm font-medium">${commentsList.length}</span>
                </button>
            </div>
            <div class="comments-list space-y-3">${commentsHTML}</div>
            ${hasMoreComments ? `<button class="view-more-comments-btn text-blue-500 hover:text-blue-600 text-sm mt-3 font-medium transition-colors">View More Comments (${commentsList.length - 2})</button>` : ''}
        </div>
    `;

    const title = postElement.querySelector('.post-title');
    const content = postElement.querySelector('.post-content');
    const toggleBtn = postElement.querySelector('.toggle-content-btn');
    const toggleContent = () => {
        if (content.textContent === truncatedContent) {
            content.textContent = post.content;
            if (toggleBtn) toggleBtn.textContent = 'Show Less';
        } else {
            content.textContent = truncatedContent;
            if (toggleBtn) toggleBtn.textContent = 'Read More';
        }
    };

    [title, content].forEach(element => {
        element.addEventListener('click', toggleContent);
    });
    if (toggleBtn) toggleBtn.addEventListener('click', toggleContent);

    const imageElements = postElement.querySelectorAll('.swiper-container, img');
    imageElements.forEach(element => {
        element.classList.add('cursor-pointer');
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            showPostModal(post);
        });
    });

    const reactionBtn = postElement.querySelector('.reaction-btn');
    if (reactionBtn) reactionBtn.addEventListener('click', () => handleLike(post, postElement));

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

    const commentBtn = postElement.querySelector('.comment-btn');
    const commentsSection = postElement.querySelector('.comments-section');
    if (commentBtn && commentsSection) {
        commentBtn.addEventListener('click', () => toggleCommentsSection(commentsSection));
    }

    attachCommentEventListeners(postElement, post.id);

    return postElement;
}

function showPostModal(post) {
    let modal = document.getElementById('post-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'post-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 overflow-y-auto transition-opacity duration-300';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 transform transition-all duration-300 scale-95">
            <div class="relative p-6">
                <button id="close-modal-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100 z-10">
                    <ion-icon name="close-outline" class="text-2xl"></ion-icon>
                </button>
                <div class="flex items-center space-x-3 mb-6">
                    <img src="${post.author.profile_picture || '/sphere/images/profile/default-avatar.png'}" class="w-12 h-12 rounded-full object-cover border-2 border-gray-200">
                    <div>
                        <span class="text-gray-800 font-semibold text-lg">@${post.author.username}</span>
                        <span class="text-gray-500 text-sm block">${new Date(post.posted_at).toLocaleDateString()}</span>
                    </div>
                </div>
                ${createImageCarousel(post.images, post.title, 'modal')}
                <h2 class="text-2xl font-bold text-gray-900 mt-6 mb-4 leading-tight">${post.title}</h2>
                <p class="text-gray-700 text-base leading-relaxed mb-6 whitespace-pre-wrap">${post.content}</p>
                <div class="flex items-center space-x-4 border-t border-gray-100 pt-4">
                    <button class="reaction-btn flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors" data-post-id="${post.id}">
                        <ion-icon name="${post.user_liked ? 'heart' : 'heart-outline'}" class="text-xl" style="color: ${post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'inherit'};"></ion-icon>
                        <span class="like-count font-medium">${post.like_count}</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => modal.querySelector('.modal-content').classList.remove('scale-95'), 10);

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
    closeBtn.addEventListener('click', () => {
        modal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.querySelector('.modal-content').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
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
            <p class="text-gray-600 text-sm">${comment.content} <span class="text-gray-500 text-xs">- @${comment.user_name || comment.username} (${new Date(comment.created_at).toLocaleString()})</span>
                ${comment.user_id === currentUserId ? `
                    <button class="edit-comment-btn text-blue-500 hover:underline text-xs ml-2" data-comment-id="${comment.id}">Edit</button>
                    <button class="delete-comment-btn text-red-500 hover:underline text-xs ml-2" data-comment-id="${comment.id}">Delete</button>
                ` : ''}
            </p>
        </div>
    `;
}

function createImageCarousel(images, title, index) {
    if (!images?.length) return '';
    const imageClasses = 'w-full h-48 object-cover rounded-lg';
    return images.length > 1 ? `
        <div id="swiper-container-${index}" class="swiper-container mb-4 max-w-full">
            <div class="swiper-wrapper">
                ${images.map(img => `<div class="swiper-slide"><img src="${img}" alt="${title}" class="${imageClasses}"></div>`).join('')}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>` : `
        <img src="${images[0]}" alt="${title}" class="${imageClasses} mb-4">
    `;
}

async function handleLike(post, element) {
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
            const btn = element.querySelector('.reaction-btn');
            if (btn) {
                const icon = btn.querySelector('ion-icon');
                if (icon) {
                    icon.name = post.user_liked ? 'heart' : 'heart-outline';
                    icon.style.color = post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'gray';
                }
                const count = btn.querySelector('.like-count');
                if (count) count.textContent = `${post.like_count}`;
            }
            const postElement = document.querySelector(`[data-post-id="${post.id}"]`);
            if (postElement) {
                const mainBtn = postElement.querySelector('.reaction-btn');
                if (mainBtn) {
                    const mainIcon = mainBtn.querySelector('ion-icon');
                    if (mainIcon) {
                        mainIcon.name = post.user_liked ? 'heart' : 'heart-outline';
                        mainIcon.style.color = post.user_liked ? 'oklch(0.623 0.214 259.815)' : 'gray';
                    }
                    const mainCount = mainBtn.querySelector('.like-count');
                    if (mainCount) mainCount.textContent = `${post.like_count}`;
                }
            }
        } else {
            console.error('Like action failed:', data.message);
        }
    } catch (error) {
        console.error('Error handling like:', error);
    }
}

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
                attachCommentEventListeners(postElement, postId);
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
        attachCommentEventListeners(postElement, post.id);
    }
    const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
    if (viewMoreBtn && totalComments <= commentsList.querySelectorAll('.comment').length) {
        viewMoreBtn.style.display = 'none';
    }
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
                const currentUserId = await getCurrentUserId();
                const username = commentDiv.querySelector('span').textContent.match(/@(\w+)/)[1];
                const timestamp = commentDiv.querySelector('span').textContent.match(/\((.*)\)/)[1];
                commentDiv.innerHTML = createCommentHTML({
                    id: commentId,
                    content: newContent,
                    user_name: username,
                    created_at: new Date(timestamp),
                    user_id: currentUserId
                }, currentUserId);
                attachCommentEventListeners(postElement, postElement.dataset.postId);
            } else {
                console.error('Edit comment failed:', data.message);
            }
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    }
}

async function deleteComment(commentId, postElement, postId) {
    const confirmDelete = confirm('Are you sure you want to delete this comment?');
    if (!confirmDelete) return;

    try {
        const response = await fetch('/sphere/api/delete_comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId })
        });
        const data = await response.json();
        if (data.success) {
            const commentDiv = postElement.querySelector(`.comment[data-comment-id="${commentId}"]`);
            if (commentDiv) commentDiv.remove();
            
            const commentCount = postElement.querySelector('.comment-count');
            if (commentCount) {
                const currentCount = parseInt(commentCount.textContent) || 0;
                commentCount.textContent = currentCount - 1;
                const commentIcon = postElement.querySelector('.comment-btn ion-icon');
                if (commentIcon) commentIcon.style.color = (currentCount - 1) >= 1 ? 'oklch(0.623 0.214 259.815)' : 'gray';
            }

            updateViewMoreButton(postElement, postId);
        } else {
            console.error('Delete comment failed:', data.message);
            alert('Failed to delete comment: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting comment:', error.message || error);
        alert('Error deleting comment: ' + (error.message || 'Unknown error'));
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
                    viewMoreBtn.className = 'view-more-comments-btn text-blue-500 hover:text-blue-600 text-sm mt-3 font-medium transition-colors';
                    const commentsSection = postElement.querySelector('.comments-section');
                    if (commentsSection) commentsSection.insertAdjacentElement('afterend', viewMoreBtn);
                }
                viewMoreBtn.textContent = `View More Comments (${totalComments - visibleComments})`;
                viewMoreBtn.style.display = 'block';
                viewMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    expandComments(post, postElement, getCurrentUserId());
                });
            } else {
                const viewMoreBtn = postElement.querySelector('.view-more-comments-btn');
                if (viewMoreBtn) viewMoreBtn.style.display = 'none';
            }
        }
    })
    .catch(error => console.error('Error fetching updated comments:', error));
}

function attachCommentEventListeners(postElement, postId) {
    const editCommentBtns = postElement.querySelectorAll('.edit-comment-btn');
    editCommentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editComment(btn.dataset.commentId, postElement);
        });
    });

    const deleteCommentBtns = postElement.querySelectorAll('.delete-comment-btn');
    deleteCommentBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteComment(btn.dataset.commentId, postElement, postId);
        });
    });
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
                window.location.href = '/sphere/index.html';
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
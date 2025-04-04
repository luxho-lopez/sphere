// nav.js
// Definir el HTML del header, aside, section y el nuevo menú flotante como templates
const headerTemplate = `
    <header class="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center transition-transform duration-300 z-50">
        <div class="logo flex items-center space-x-2 flex-shrink-0">
            <a href="/main/index.html">
                <h1 class="text-2xl font-bold text-gray-800 md:text-2xl text-lg">
                    <span class="md:inline hidden">Nimbus</span>
                </h1>
            </a>
        </div>
        <div class="search-div w-full max-w-md mx-4 relative flex-grow">
            <div class="relative">
                <input id="search-input" class="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-full pl-10 pr-4 py-2.5 transition duration-300 ease focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-sm hover:shadow-md placeholder-gray-400" placeholder="Search users or posts..." autocomplete="off" />
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"></i>
                <div id="search-results" class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto hidden z-50 border border-gray-100"></div>
            </div>
        </div>
        <nav class="flex-shrink-0 hidden md:block">
            <ul id="nav-menu" class="flex items-center space-x-4 sm:space-x-6">
                <li class="login-link"><a href="/main/login.html" class="text-gray-600 hover:text-gray-800">Log In</a></li>
                <li class="register-link"><a href="/main/register.html" class="text-gray-600 hover:text-gray-800">Register</a></li>
                <li class="new_post-link hidden">
                    <a href="/main/new_post.html" class="text-gray-600 hover:text-gray-800">
                        <span class="inline-flex shrink-0 rounded-full border border-blue-300 bg-blue-100 p-2 dark:border-blue-300/10 dark:bg-blue-400/10">
                            <i class="fa-solid fa-plus"></i>
                        </span>
                    </a>
                </li>
                <li class="notify-link relative hidden">
                    <div id="user-notify" class="text-gray-600 hover:text-gray-800 cursor-pointer relative">
                        <i class="fa-regular fa-bell text-2xl"></i>
                        <span id="unread-count" class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center animate-pulse hidden">0</span>
                    </div>
                    <ul class="notify-sub-menu absolute right-0 mt-3 w-72 bg-white shadow-lg rounded-xl border border-gray-100 z-50 hidden transition-all duration-200 ease-in-out">
                        <li class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200 bg-gray-50 rounded-t-xl">Notifications</li>
                        <li id="notifications-list" class="max-h-64 overflow-y-auto"></li>
                        <li class="px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 rounded-b-xl transition-colors duration-150">
                            <a href="/main/notify.html" class="block w-full">See all notifications</a>
                        </li>
                    </ul>
                </li>
                <li class="profile-link relative block min-w-[32px] hidden">
                    <div id="user-profile" class="text-gray-600 hover:text-gray-800 cursor-pointer"></div>
                    <ul class="sub-menu absolute right-0 mt-3 w-60 bg-white shadow-lg rounded-xl border border-gray-100 z-50 hidden transition-all duration-200 ease-in-out">
                        <!-- Dynamic content populated by script.js -->
                    </ul>
                </li>
            </ul>
        </nav>
        <div class="flex items-center space-x-2 flex-shrink-0 md:hidden">
            <a href="/main/settings.html" class="text-gray-600 text-lg font-semibold hover:text-gray-800 cursor-pointer relative">
                <i class="fa-solid fa-gear"></i>
            </a>
        </div>
    </header>
`;

const asideTemplate = `
    <aside class="fixed top-0 left-0 w-64 h-full bg-white shadow-lg rounded-r-xl border-r border-gray-100 p-6 hidden md:block transition-all duration-300 ease-in-out">
        <nav>
            <ul id="sidebar-menu" class="space-y-3 mt-20">
                <li>
                    <a href="/main/index.html" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                        <i class="fa-solid fa-house mr-4 text-xl text-gray-500"></i>
                        <span class="text-sm font-medium">Home</span>
                    </a>
                </li>
                <li>
                    <a href="/main/trending.html" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                        <i class="fa-solid fa-arrow-trend-up mr-4 text-xl text-gray-500"></i>
                        <span class="text-sm font-medium">Trending</span>
                    </a>
                </li>
                <li>
                    <a href="/main/explorer.html" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                        <i class="fa-solid fa-globe mr-4 text-xl text-gray-500"></i>
                        <span class="text-sm font-medium">Explorer</span>
                    </a>
                </li>
            </ul>
        </nav>
    </aside>
`;

const sectionTemplate = `
    <div id="floating-section" class="fixed bottom-4 right-4 w-64 max-h-96 bg-white shadow-lg rounded-xl border border-gray-100 p-4 hidden md:block z-50 overflow-y-auto transition-all duration-300 ease-in-out">
        <nav>
            <ul id="section-friends" class="space-y-2">
                <li class="flex items-center px-3 py-2">
                    <i class="fa-solid fa-users mr-3 text-lg text-gray-500"></i>    
                    <span class="text-sm font-medium">Friends</span>
                </li>
                <!-- Los amigos se cargarán dinámicamente aquí -->
            </ul>
            <hr class="my-2">
            <ul id="section-chats" class="space-y-2">
                <li class="flex items-center px-3 py-2">
                    <i class="fa-regular fa-comments mr-3 text-lg text-gray-500"></i> 
                    <span class="text-sm font-medium">Chats</span>
                </li>
                <!-- Los chats se cargarán dinámicamente aquí -->
            </ul>
        </nav>
    </div>
`;

const chatWindowTemplate = `
    <div id="chat-window" class="fixed bottom-4 right-72 w-80 max-h-96 bg-white shadow-lg rounded-xl border border-gray-100 hidden z-50 overflow-hidden transition-all duration-300 ease-in-out">
        <div class="flex justify-between items-center p-3 bg-gray-100 border-b">
            <h3 id="chat-title" class="text-sm font-semibold text-gray-700"></h3>
            <div class="flex space-x-2">
                <button id="minimize-chat" class="text-gray-500 hover:text-gray-700">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <button id="close-chat" class="text-gray-500 hover:text-gray-700">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        </div>
        <div id="chat-messages-container" class="p-3 max-h-64 overflow-y-auto relative">
            <div id="chat-messages"></div>
        </div>
        <form id="chat-form" class="p-3 border-t">
            <input id="chat-input" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Type a message..." />
        </form>
    </div>
`;

const mobileMenuTemplate = `
    <nav id="mobile-menu" class="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-100 p-2 flex justify-around items-center md:hidden z-50">
        <a href="/main/index.html" class="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2">
            <i class="fa-solid fa-house text-xl"></i>
            <span class="text-xs">Home</span>
        </a>
        <a href="/main/messages.html" class="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2">
            <i class="fa-solid fa-envelope text-xl"></i>
            <span class="text-xs">Messages</span>
        </a>
        <a href="/main/new_post.html" class="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2">
            <i class="fa-solid fa-plus text-xl"></i>
            <span class="text-xs">New Post</span>
        </a>
        <a href="/main/notify.html" class="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2 relative">
            <i class="fa-regular fa-bell text-xl"></i>
            <span class="text-xs">Notifications</span>
            <span id="mobile-unread-count" class="absolute top-0 right-0 bg-blue-500 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center hidden">0</span>
        </a>
        <a href="/main/profile.html" class="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2">
            <i class="fa-solid fa-user text-xl"></i>
            <span class="text-xs">Profile</span>
        </a>
    </nav>
`;

// Template para notificaciones flotantes
const notificationTemplate = (messageId, senderName, content, friendId) => `
    <div class="notification fixed bottom-16 right-4 bg-white shadow-lg rounded-lg border border-gray-100 p-4 w-80 z-50 flex items-start space-x-3 cursor-pointer" data-message-id="${messageId}" data-friend-id="${friendId}">
        <i class="fa-solid fa-envelope text-blue-500 text-xl"></i>
        <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">${senderName}</p>
            <p class="text-xs text-gray-600 truncate">${content}</p>
        </div>
        <button class="close-notification text-gray-500 hover:text-gray-700">
            <i class="fa-solid fa-times"></i>
        </button>
    </div>
`;

// Template para el modal de mensajes
const messagesModalTemplate = `
    <div id="messages-modal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button id="close-messages-modal" class="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
                <i class="fa-solid fa-times text-xl"></i>
            </button>
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
            <section id="modal-messages" class="space-y-3"></section>
        </div>
    </div>
`;

// Template para el modal de notificaciones
const notificationsModalTemplate = `
    <div id="notifications-modal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-4 relative">
            <button id="close-notifications-modal" class="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
                <i class="fa-solid fa-times text-xl"></i>
            </button>
            <h3 class="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-200 bg-gray-50 rounded-t-xl">Notifications</h3>
            <div id="modal-notifications-list" class="max-h-64 overflow-y-auto"></div>
            <div class="px-4 py-3 text-sm text-blue-600 hover:bg-gray-100 rounded-b-xl transition-colors duration-150">
                <a href="/main/notify.html" class="block w-full">See all notifications</a>
            </div>
        </div>
    </div>
`;

async function fetchSessionUserId() {
    try {
        const response = await fetch('/main/api/user.php', { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            window.sessionUserId = data.user_id;
        }
    } catch (error) {
        console.error('Error fetching session user ID:', error);
    }
}

function injectNavigation() {
    return fetchSessionUserId().then(() => {
        const headerElement = document.querySelector('header');
        const asideElement = document.querySelector('aside');
        const sectionElement = document.querySelector('#floating-section');
        const mobileMenuElement = document.querySelector('#mobile-menu');
        const chatWindowElement = document.querySelector('#chat-window');
        const messagesModalElement = document.querySelector('#messages-modal');
        const notificationsModalElement = document.querySelector('#notifications-modal');

        if (headerElement) headerElement.outerHTML = headerTemplate;
        else document.body.insertAdjacentHTML('afterbegin', headerTemplate);

        if (asideElement) asideElement.outerHTML = asideTemplate;
        else document.body.insertAdjacentHTML('afterbegin', asideTemplate);

        if (sectionElement) sectionElement.outerHTML = sectionTemplate;
        else document.body.insertAdjacentHTML('beforeend', sectionTemplate);

        if (mobileMenuElement) mobileMenuElement.outerHTML = mobileMenuTemplate;
        else document.body.insertAdjacentHTML('beforeend', mobileMenuTemplate);

        if (!chatWindowElement) document.body.insertAdjacentHTML('beforeend', chatWindowTemplate);
        if (!messagesModalElement) document.body.insertAdjacentHTML('beforeend', messagesModalTemplate);
        if (!notificationsModalElement) document.body.insertAdjacentHTML('beforeend', notificationsModalTemplate);

        setupSearch();
        setupFriendsAndChat();
        setupMobileMenu();

        document.dispatchEvent(new Event('navigationReady'));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    injectNavigation();
});


function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) {
        console.error('Search input or results container not found');
        return;
    }

    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/main/api/search.php?query=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();

            if (data.success && (data.users.length || data.posts.length)) {
                searchResults.innerHTML = `
                    <div class="users-section">
                        <h3 class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border-b">Users</h3>
                        ${data.users.length ? data.users.map(user => `
                            <a href="/main/profile.html?user=@${user.username}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <img src="${user.profile_picture || '/main/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover">
                                <div>
                                    <span class="font-medium">@${user.username}</span>
                                    <span class="block text-xs text-gray-500">${user.first_name} ${user.last_name || ''}</span>
                                </div>
                            </a>
                        `).join('') : '<p class="px-4 py-2 text-sm text-gray-500">No users found</p>'}
                    </div>
                    <div class="posts-section">
                        <h3 class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border-b">Posts</h3>
                        ${data.posts.length ? data.posts.map(post => `
                            <a href="/main/post.html?post_id=${post.id}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <span class="font-medium">${post.title}</span>
                                <span class="block text-xs text-gray-500 truncate">${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}</span>
                            </a>
                        `).join('') : '<p class="px-4 py-2 text-sm text-gray-500">No posts found</p>'}
                    </div>
                `;
                searchResults.classList.remove('hidden');
            } else {
                searchResults.innerHTML = '<p class="px-4 py-2 text-sm text-gray-500">No results found</p>';
                searchResults.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error during search:', error);
            searchResults.innerHTML = '<p class="px-4 py-2 text-sm text-gray-500">Error loading results</p>';
            searchResults.classList.remove('hidden');
        }
    }, 300));

    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.add('hidden');
        }
    });
}


function setupMobileMenu() {
    const messagesLink = document.querySelector('#mobile-menu a[href="/main/messages.html"]');
    const notifyLink = document.querySelector('#mobile-menu a[href="/main/notify.html"]');

    if (window.innerWidth < 768) {
        messagesLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessagesModal();
        });

        notifyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotificationsModal();
        });
    }
}

async function showMessagesModal() {
    const modal = document.getElementById('messages-modal');
    const messagesSection = document.getElementById('modal-messages');
    const closeButton = document.getElementById('close-messages-modal');

    modal.classList.remove('hidden');
    await loadChatsInModal(messagesSection);

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    }, { once: true });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    }, { once: true });
}

async function loadChatsInModal(messagesSection) {
    try {
        const response = await fetch('/main/api/get_chats.php', { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            messagesSection.innerHTML = chatsTemplate(data.chats);
            setupModalChatListeners(messagesSection);
        } else {
            messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading chats</p>';
        }
    } catch (error) {
        console.error('Error loading chats in modal:', error);
        messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading chats</p>';
    }
}

function chatsTemplate(chats) {
    return `
        <ul class="space-y-3">
            ${chats.length ? chats.map(chat => `
                <li class="chat-item flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200" data-friend-id="${chat.friend_id}" data-username="${chat.username}">
                    <img src="${chat.profile_picture || '/main/images/profile/default-avatar.png'}" class="w-10 h-10 rounded-full object-cover mr-3">
                    <div class="flex-1">
                        <span class="font-medium text-gray-800">${chat.username}</span>
                        <p class="text-sm text-gray-600 truncate ${chat.is_read ? '' : 'font-semibold'}">${chat.last_message}</p>
                    </div>
                    <span class="text-xs text-gray-500">${new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ${chat.is_read ? '' : '<span class="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>'}
                </li>
            `).join('') : '<p class="text-sm text-gray-500">No messages yet</p>'}
        </ul>
    `;
}

function setupModalChatListeners(messagesSection) {
    messagesSection.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const friendId = item.dataset.friendId;
            const username = item.dataset.username;
            loadConversationInModal(messagesSection, friendId, username);
        });
    });
}

async function loadConversationInModal(messagesSection, friendId, username) {
    try {
        const response = await fetch(`/main/api/get_messages.php?friend_id=${friendId}`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            messagesSection.innerHTML = conversationTemplate(friendId, username, data.messages);
            setupModalConversationListeners(messagesSection, friendId, username, data.messages);

            await fetch('/main/api/mark_chat_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `friend_id=${friendId}`,
                credentials: 'include'
            });
        } else {
            messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading conversation</p>';
        }
    } catch (error) {
        console.error('Error loading conversation in modal:', error);
        messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading conversation</p>';
    }
}

function conversationTemplate(friendId, username, messages) {
    return `
        <div class="w-full">
            <div class="flex items-center mb-4">
                <button id="back-to-chats" class="text-gray-600 hover:text-gray-800 mr-3">
                    <i class="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <h2 class="text-xl font-semibold text-gray-800">${username}</h2>
            </div>
            <div id="conversation-messages" class="max-h-64 overflow-y-auto mb-4">
                ${messages.map(msg => `
                    <div class="${msg.sender_id == window.sessionUserId ? 'text-right' : 'text-left'} mb-2">
                        <span class="inline-block ${msg.sender_id == window.sessionUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} p-2 rounded-lg text-sm">${msg.content}</span>
                        <p class="text-xs text-gray-500">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                `).join('')}
            </div>
            <form id="message-form" class="flex items-center">
                <input id="message-input" class="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="Type a message..." />
                <button type="submit" class="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        </div>
    `;
}

function setupModalConversationListeners(messagesSection, friendId, username, initialMessages) {
    const backButton = messagesSection.querySelector('#back-to-chats');
    const messageForm = messagesSection.querySelector('#message-form');
    const messageInput = messagesSection.querySelector('#message-input');
    const messagesContainer = messagesSection.querySelector('#conversation-messages');

    backButton.addEventListener('click', () => {
        loadChatsInModal(messagesSection);
    });

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (content) {
            try {
                const response = await fetch('/main/api/send_message.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `receiver_id=${friendId}&content=${encodeURIComponent(content)}`,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    messagesContainer.innerHTML += `
                        <div class="text-right mb-2">
                            <span class="inline-block bg-blue-500 text-white p-2 rounded-lg text-sm">${data.message.content}</span>
                            <p class="text-xs text-gray-500">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    `;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    messageInput.value = '';
                }
            } catch (error) {
                console.error('Error sending message in modal:', error);
            }
        }
    });

    let lastMessageId = initialMessages.length ? Math.max(...initialMessages.map(msg => msg.id)) : 0;
    const pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`/main/api/get_messages.php?friend_id=${friendId}`, { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                const newMessages = data.messages.filter(msg => msg.id > lastMessageId);
                newMessages.forEach(msg => {
                    messagesContainer.innerHTML += `
                        <div class="${msg.sender_id == window.sessionUserId ? 'text-right' : 'text-left'} mb-2">
                            <span class="inline-block ${msg.sender_id == window.sessionUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} p-2 rounded-lg text-sm">${msg.content}</span>
                            <p class="text-xs text-gray-500">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    `;
                    lastMessageId = msg.id;
                });
                if (newMessages.length) messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error polling messages in modal:', error);
        }
    }, 5000);

    backButton.addEventListener('click', () => clearInterval(pollingInterval), { once: true });
}

async function showNotificationsModal() {
    const modal = document.getElementById('notifications-modal');
    const notificationsList = document.getElementById('modal-notifications-list');
    const closeButton = document.getElementById('close-notifications-modal');

    modal.classList.remove('hidden');
    await loadNotificationsInModal(notificationsList);

    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    }, { once: true });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    }, { once: true });
}

async function loadNotificationsInModal(notificationsList) {
    try {
        const response = await fetch('/main/api/get_notifications.php', { credentials: 'include' });
        const data = await response.json();
        if (data.success && data.notifications?.length) {
            notificationsList.innerHTML = data.notifications.map(notif => {
                const redirectUrl = notif.type === 'follow'
                    ? `/main/profile.html?user=@${notif.reference}`
                    : `/main/post.html?post_id=${notif.reference || ''}`;
                return `
                    <div class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors duration-150 ${
                        notif.is_read ? '' : 'font-semibold bg-gray-50'
                    }" data-notification-id="${notif.id}">
                        <a href="${redirectUrl}" class="flex justify-between items-center">
                            <div>
                                <span>${notif.message}</span>
                                <span class="text-xs text-gray-500 block">${new Date(notif.created_at).toLocaleString()}</span>
                            </div>
                        </a>
                        <button class="toggle-read-btn text-xs ${
                            notif.is_read ? 'text-blue-500' : 'text-gray-500'
                        }" title="${notif.is_read ? 'Mark as unread' : 'Mark as read'}">
                            <i class="fa-regular ${notif.is_read ? 'fa-eye' : 'fa-eye-slash'} ml-2" size="small"></i>
                        </button>
                    </div>
                `;
            }).join('');
            setupModalNotificationListeners(notificationsList);
        } else {
            notificationsList.innerHTML = '<div class="px-4 py-3 text-sm text-gray-500">No new notifications</div>';
        }
    } catch (error) {
        console.error('Error loading notifications in modal:', error);
        notificationsList.innerHTML = '<div class="px-4 py-3 text-sm text-gray-500">Unable to load notifications</div>';
    }
}

async function toggleNotificationRead(notificationId, isRead) {
    try {
        const response = await fetch('/main/api/mark_notification_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                notification_id: notificationId,
                is_read: isRead ? 1 : 0 
            }),
            credentials: 'include'
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error toggling notification read status:', error);
        return false;
    }
}

function setupModalNotificationListeners(notificationsList) {
    notificationsList.querySelectorAll('.toggle-read-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            e.preventDefault();
            const notificationDiv = this.closest('[data-notification-id]');
            const notificationId = notificationDiv.dataset.notificationId;
            const currentState = !notificationDiv.classList.contains('font-semibold');
            const newState = !currentState;

            this.disabled = true;
            this.innerHTML = '<i class="fa-solid fa-arrow-rotate-right animate-spin"></i>';

            const success = await toggleNotificationRead(notificationId, newState);

            if (success) {
                notificationDiv.classList.toggle('font-semibold', !newState);
                notificationDiv.classList.toggle('bg-gray-50', !newState);
                this.classList.toggle('text-blue-500', newState);
                this.classList.toggle('text-gray-500', !newState);
                this.querySelector('i').setAttribute('class', 
                    newState ? 'fa-eye' : 'fa-eye-slash');
                this.setAttribute('title', 
                    newState ? 'Mark as unread' : 'Mark as read');
                await updateNotificationCount();
            }

            this.disabled = false;
            this.innerHTML = `<i class="fa-regular ${newState ? 'fa-eye' : 'fa-eye-slash'} ml-2" size="small"></i>`;
        });
    });
}


function setupFriendsAndChat() {
    const sectionFriends = document.getElementById('section-friends');
    const sectionChats = document.getElementById('section-chats');
    const chatWindow = document.getElementById('chat-window');
    const chatTitle = document.getElementById('chat-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const minimizeChat = document.getElementById('minimize-chat');
    const closeChat = document.getElementById('close-chat');
    let currentFriendId = null;
    let lastMessageId = 0;
    let pollingInterval = null;
    let lastCheckedMessageId = 0;

    // Cargar amigos dinámicamente (solo con seguimiento mutuo)
    async function loadFriends() {
        try {
            const response = await fetch('/main/api/get_mutual_friends.php', { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                sectionFriends.innerHTML = `
                    <li class="flex items-center px-3 py-2">
                        <i class="fa-solid fa-users mr-3 text-lg text-gray-500"></i>    
                        <span class="text-sm font-medium">Friends</span>
                    </li>
                    ${data.friends.length ? data.friends.map(friend => `
                        <li>
                            <button class="friend-btn flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200 w-full" data-friend-id="${friend.id}">
                                <img src="${friend.profile_picture || '/main/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover mr-2">
                                <div class="text-left">
                                    <span class="font-sm">${friend.first_name} ${friend.last_name || ''}</span>
                                    <span class="block text-xs text-gray-500">@${friend.username}</span>
                                </div>
                            </button>
                        </li>
                    `).join('') : '<li class="px-3 py-2 text-sm text-gray-500">No mutual friends found</li>'}
                `;
                setupFriendButtons();
            } else {
                sectionFriends.innerHTML += '<li class="px-3 py-2 text-sm text-gray-500">No mutual friends found</li>';
            }
        } catch (error) {
            console.error('Error loading friends:', error);
            sectionFriends.innerHTML += '<li class="px-3 py-2 text-sm text-gray-500">Error loading friends</li>';
        }
    }

    // Cargar chats dinámicamente
    async function loadChats() {
        try {
            const response = await fetch('/main/api/get_chats.php', { credentials: 'include' });
            const data = await response.json();
            if (data.success && data.chats.length) {
                sectionChats.innerHTML = `
                    <li class="flex items-center px-3 py-2">
                        <i class="fa-regular fa-comments mr-3 text-lg text-gray-500"></i> 
                        <span class="text-sm font-medium">Chats</span>
                    </li>
                    ${data.chats.map(chat => `
                        <li>
                            <button class="chat-btn flex items-center px-3 py-2 text-blue-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors duration-200 w-full ${chat.sender_id !== window.sessionUserId && !chat.is_read ? 'bg-gray-100 font-semibold' : ''}" data-friend-id="${chat.friend_id}">
                                <img src="${chat.profile_picture || '/main/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover mr-2">
                                <div class="flex-1 text-left">
                                    <span class="font-sm">${chat.username}</span>
                                    <span class="block text-xs text-gray-500 truncate">${chat.last_message}</span>
                                </div>
                                <i class="fa-solid ${chat.is_read ? 'fa-eye-slash' : 'fa-eye'} text-gray-500 ml-2 cursor-pointer mark-read" data-message-id="${chat.message_id}" data-is-read="${chat.is_read ? 'true' : 'false'}"></i>
                            </button>
                        </li>
                    `).join('')}
                `;
                setupChatButtons();
            } else {
                sectionChats.innerHTML = `
                    <li class="flex items-center px-3 py-2">
                        <i class="fa-regular fa-comments mr-3 text-lg text-gray-500"></i> 
                        <span class="text-sm font-medium">Chats</span>
                    </li>
                `;
            }
        } catch (error) {
            console.error('Error loading chats:', error);
            sectionChats.innerHTML += '<li class="px-3 py-2 text-sm text-gray-500">Error loading chats</li>';
        }
    }

    // Configurar botones de amigos
    function setupFriendButtons() {
        document.querySelectorAll('.friend-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFriendId = btn.dataset.friendId;
                chatTitle.textContent = btn.querySelector('span').textContent;
                chatWindow.classList.remove('hidden');
                loadChatHistory(currentFriendId);
                markChatAsRead(currentFriendId);
                startPolling(currentFriendId);
            });
        });
    }

    // Configurar botones de chats
    function setupChatButtons() {
        document.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentFriendId = btn.dataset.friendId;
                chatTitle.textContent = btn.querySelector('span').textContent;
                chatWindow.classList.remove('hidden');
                loadChatHistory(currentFriendId);
                markChatAsRead(currentFriendId);
                startPolling(currentFriendId);
            });
        });

        document.querySelectorAll('.mark-read').forEach(icon => {
            icon.addEventListener('click', async (e) => {
                e.stopPropagation();
                const messageId = icon.dataset.messageId;
                const currentIsRead = icon.dataset.isRead === 'true';
                const newIsRead = !currentIsRead;

                icon.classList.remove('fa-eye', 'fa-eye-slash');
                icon.classList.add('fa-spinner', 'fa-spin');

                const success = await toggleMessageReadStatus(messageId, newIsRead);

                if (success) {
                    icon.classList.remove('fa-spinner', 'fa-spin');
                    icon.classList.add(newIsRead ? 'fa-eye-slash' : 'fa-eye');
                    icon.dataset.isRead = newIsRead;
                    const chatBtn = icon.closest('.chat-btn');
                    chatBtn.classList.toggle('bg-gray-100', !newIsRead && chatBtn.dataset.friendId !== window.sessionUserId);
                    chatBtn.classList.toggle('font-semibold', !newIsRead && chatBtn.dataset.friendId !== window.sessionUserId);
                } else {
                    icon.classList.remove('fa-spinner', 'fa-spin');
                    icon.classList.add(currentIsRead ? 'fa-eye-slash' : 'fa-eye');
                }
            });
        });
    }

    // Cargar historial de chat
    async function loadChatHistory(friendId) {
        try {
            const response = await fetch(`/main/api/get_messages.php?friend_id=${friendId}`, { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                const messages = data.messages;
                chatMessages.innerHTML = messages.map(msg => `
                    <div class="${msg.sender_id == window.sessionUserId ? 'text-right' : 'text-left'} mb-2">
                        <span class="inline-block ${msg.sender_id == window.sessionUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} p-2 rounded-lg text-sm">${msg.content}</span>
                    </div>
                `).join('');
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                lastMessageId = messages.length ? messages[messages.length - 1].id : 0;
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            chatMessages.innerHTML = '<p class="text-sm text-gray-500">Error loading messages</p>';
        }
    }

    // Alternar estado de lectura de un mensaje
    async function toggleMessageReadStatus(messageId, isRead) {
        try {
            const response = await fetch('/main/api/mark_message_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `message_id=${messageId}&is_read=${isRead ? 1 : 0}`,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                return true;
            } else {
                console.error('Failed to toggle message read status:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error toggling message read status:', error);
            return false;
        }
    }

    // Marcar chat como leído al abrirlo
    async function markChatAsRead(friendId) {
        try {
            const response = await fetch('/main/api/mark_chat_read.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `friend_id=${friendId}`,
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                loadChats();
                updateNotificationCount();
            }
        } catch (error) {
            console.error('Error marking chat as read:', error);
        }
    }

    // Verificar seguimiento mutuo
    async function checkMutualFollow(followingId) {
        try {
            const response = await fetch(`/main/api/check_mutual_follow.php?following_id=${followingId}`, { credentials: 'include' });
            const data = await response.json();
            return data.success && data.is_mutual;
        } catch (error) {
            console.error('Error checking mutual follow:', error);
            return false;
        }
    }

    // Enviar mensaje (solo si hay seguimiento mutuo)
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = chatInput.value.trim();
        if (content && currentFriendId) {
            const isMutual = await checkMutualFollow(currentFriendId);
            if (!isMutual) {
                alert('You can only message users who follow you back.');
                return;
            }
            try {
                const response = await fetch('/main/api/send_message.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `receiver_id=${currentFriendId}&content=${encodeURIComponent(content)}`,
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    chatMessages.innerHTML += `
                        <div class="text-right mb-2">
                            <span class="inline-block bg-blue-500 text-white p-2 rounded-lg text-sm">${data.message.content}</span>
                        </div>
                    `;
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                    lastMessageId = data.message.id;
                    chatInput.value = '';
                    loadChats();
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    });

    // Polling para nuevos mensajes y notificaciones
    function startPolling(friendId) {
        clearInterval(pollingInterval);
        pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`/main/api/get_messages.php?friend_id=${friendId}`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    const newMessages = data.messages.filter(msg => msg.id > lastMessageId);
                    newMessages.forEach(msg => {
                        chatMessages.innerHTML += `
                            <div class="${msg.sender_id == window.sessionUserId ? 'text-right' : 'text-left'} mb-2">
                                <span class="inline-block ${msg.sender_id == window.sessionUserId ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} p-2 rounded-lg text-sm">${msg.content}</span>
                            </div>
                        `;
                        lastMessageId = msg.id;
                    });
                    if (newMessages.length) {
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                        loadChats();
                    }
                }

                await checkForNewMessages();
            } catch (error) {
                console.error('Error polling messages:', error);
            }
        }, 5000);
    }

    // Verificar nuevos mensajes de cualquier amigo y mostrar notificaciones
    async function checkForNewMessages() {
        try {
            const response = await fetch('/main/api/get_all_unread_messages.php', { credentials: 'include' });
            const data = await response.json();
            if (data.success && data.messages.length) {
                const newMessages = data.messages.filter(msg => msg.id > lastCheckedMessageId);
                newMessages.forEach(msg => {
                    if (msg.sender_id !== window.sessionUserId && !msg.is_read) {
                        showNotification(msg.id, msg.sender_name, msg.content, msg.sender_id);
                        lastCheckedMessageId = msg.id;
                    }
                });
                updateNotificationCount();
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    }

    // Mostrar notificación flotante
    function showNotification(messageId, senderName, content, friendId) {
        const notification = document.createElement('div');
        notification.innerHTML = notificationTemplate(messageId, senderName, content, friendId);
        document.body.appendChild(notification);

        notification.addEventListener('click', async () => {
            currentFriendId = friendId;
            chatTitle.textContent = senderName;
            chatWindow.classList.remove('hidden');
            await toggleMessageReadStatus(messageId, true);
            await markChatAsRead(friendId);
            loadChatHistory(friendId);
            startPolling(friendId);
            notification.remove();
        });

        notification.querySelector('.close-notification').addEventListener('click', (e) => {
            e.stopPropagation();
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 10000);
    }

    // Actualizar conteo de notificaciones no leídas
    async function updateNotificationCount() {
        try {
            const response = await fetch('/main/api/get_all_unread_messages.php', { credentials: 'include' });
            const data = await response.json();
            const unreadCountBadge = document.getElementById('unread-count');
            const mobileUnreadCountBadge = document.getElementById('mobile-unread-count');
            if (data.success) {
                const unreadCount = data.messages.filter(msg => !msg.is_read).length;
                if (unreadCount > 0) {
                    unreadCountBadge.textContent = unreadCount;
                    unreadCountBadge.classList.remove('hidden');
                    mobileUnreadCountBadge.textContent = unreadCount;
                    mobileUnreadCountBadge.classList.remove('hidden');
                } else {
                    unreadCountBadge.classList.add('hidden');
                    mobileUnreadCountBadge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error updating notification count:', error);
        }
    }

    // Minimizar/Maximizar chat
    let isMinimized = false;
    minimizeChat.addEventListener('click', () => {
        isMinimized = !isMinimized;
        if (isMinimized) {
            chatWindow.style.height = '40px';
            chatMessagesContainer.classList.add('hidden');
            chatForm.classList.add('hidden');
        } else {
            chatWindow.style.height = '';
            chatMessagesContainer.classList.remove('hidden');
            chatForm.classList.remove('hidden');
        }
    });

    // Cerrar chat
    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        currentFriendId = null;
        clearInterval(pollingInterval);
    });

    // Iniciar carga de amigos, chats y polling global
    loadFriends();
    loadChats();
    setInterval(checkForNewMessages, 5000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
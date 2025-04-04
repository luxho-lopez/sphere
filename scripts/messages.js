// /main/scripts/messages.js

// Template para la lista de chats
function chatsTemplate(chats) {
    return `
        <div class="bg-white shadow-lg rounded-xl p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
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
        </div>
    `;
}

// Template para el historial de conversación
function conversationTemplate(friendId, username, messages) {
    return `
        <div class="bg-white shadow-lg rounded-xl p-6 w-full">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <button id="back-to-chats" class="text-gray-600 hover:text-gray-800 mr-3">
                        <i class="fa-solid fa-arrow-left text-xl"></i>
                    </button>
                    <h2 class="text-xl font-semibold text-gray-800">${username}</h2>
                </div>
            </div>
            <div id="conversation-messages" class="max-h-96 overflow-y-auto mb-4">
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

async function loadChats() {
    const messagesSection = document.getElementById('messages');
    try {
        const response = await fetch('/main/api/get_chats.php', { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            messagesSection.innerHTML = chatsTemplate(data.chats);
            setupChatListeners();
        } else {
            messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading chats</p>';
        }
    } catch (error) {
        console.error('Error loading chats:', error);
        messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading chats</p>';
    }
}

function setupChatListeners() {
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const friendId = item.dataset.friendId;
            const username = item.dataset.username;
            loadConversation(friendId, username);
        });
    });
}

async function loadConversation(friendId, username) {
    const messagesSection = document.getElementById('messages');
    try {
        const response = await fetch(`/main/api/get_messages.php?friend_id=${friendId}`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
            messagesSection.innerHTML = conversationTemplate(friendId, username, data.messages);
            setupConversationListeners(friendId, username, data.messages);

            // Marcar mensajes como leídos
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
        console.error('Error loading conversation:', error);
        messagesSection.innerHTML = '<p class="text-sm text-gray-500">Error loading conversation</p>';
    }
}

function setupConversationListeners(friendId, username, messages) {
    const backButton = document.getElementById('back-to-chats');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('conversation-messages');

    backButton.addEventListener('click', () => {
        loadChats();
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
                console.error('Error sending message:', error);
            }
        }
    });

    // Polling para nuevos mensajes en la conversación
    let lastMessageId = messages.length ? Math.max(...messages.map(msg => msg.id)) : 0;
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
            console.error('Error polling messages:', error);
        }
    }, 5000);

    // Limpiar intervalo al salir de la conversación
    backButton.addEventListener('click', () => clearInterval(pollingInterval), { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    loadChats();
});
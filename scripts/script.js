// script.js
document.addEventListener('navigationReady', async () => {
    try {
        const user = await fetchUserProfile();
        if (user) {
            await fetchNotifications();
        }
        highlightSelectedMenuItem();
        setupMenuClickHandlers();
        restrictUnauthorizedURLs();
        setupHeaderScroll();
    } catch (error) {
        console.error('Error during navigation ready:', error);
    }
});

async function fetchNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    const unreadCountBadge = document.getElementById('unread-count');
    if (!notificationsList) {
        console.log('Notifications list not found on this page');
        return;
    }
    try {
        const response = await fetch('/main/api/get_notifications.php', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        
        if (data.success && data.notifications?.length) {
            const unreadCount = data.notifications.filter(notif => !notif.is_read).length;
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

            if (unreadCount > 0) {
                unreadCountBadge.textContent = unreadCount;
                unreadCountBadge.classList.remove('hidden');
            } else {
                unreadCountBadge.classList.add('hidden');
            }
            
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
                        const updatedResponse = await fetch('/main/api/get_notifications.php', { credentials: 'include' });
                        const updatedData = await updatedResponse.json();
                        const newUnreadCount = updatedData.notifications.filter(n => !n.is_read).length;
                        unreadCountBadge.textContent = newUnreadCount;
                        unreadCountBadge.classList.toggle('hidden', newUnreadCount === 0);
                    }
                    
                    this.disabled = false;
                    this.innerHTML = `<i class="fa-regular ${newState ? 'fa-eye' : 'fa-eye-slash'} ml-2" size="small"></i>`;
                });
            });
        } else {
            notificationsList.innerHTML = `
                <div class="px-4 py-3 text-sm text-gray-500">
                    No new notifications
                </div>
            `;
            unreadCountBadge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        notificationsList.innerHTML = `
            <div class="px-4 py-3 text-sm text-gray-500">
                Unable to load notifications
            </div>
        `;
        unreadCountBadge.classList.add('hidden');
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
            })
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }
        return true;
    } catch (error) {
        console.error('Error toggling notification read status:', error);
        return false;
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch('/main/api/get_user.php', {
            credentials: 'include'
        });
        const profileHeader = document.getElementById('user-profile');
        const profileLink = document.querySelector('.profile-link');
        const notifyLink = document.querySelector('.notify-link');
        const notifyHeader = document.getElementById('user-notify');
        const newPostLink = document.querySelector('.new_post-link');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');
        const logoContainer = document.querySelector('.logo');

        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        const user = data.success && data.user?.length ? data.user[0] : null;

        if (logoContainer) {
            const logoLink = logoContainer.querySelector('a');
            if (!logoLink.nextElementSibling?.classList.contains('menu-toggle')) {
                logoLink.insertAdjacentHTML('afterend', `
                    <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                `);
                setupMenuToggle();
            }
        }

        if (user && profileHeader) {
            profileHeader.innerHTML = `
                <a href="/main/profile.html?user=@${user.username}" class="user-profile-link flex items-center space-x-2">
                    <img src="${user.profile_picture || '/main/images/profile/default-avatar.png'}" alt="${user.first_name}" class="w-8 h-8 rounded-full object-cover">
                </a>
                <ul class="sub-menu absolute right-0 mt-3 w-60 bg-white shadow-lg rounded-xl border border-gray-100 z-50 hidden transition-all duration-200 ease-in-out">
                    <li>
                        <a href="/main/profile.html?user=@${user.username}" class="flex items-center block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm transition-colors duration-150">
                            <i class="fa-regular fa-user mx-2 text-lg"></i>
                            ${user.first_name}
                        </a>
                    </li>
                    <li>
                        <a href="/main/messages.html" class="flex items-center block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm transition-colors duration-150">
                            <i class="fa-regular fa-comments mx-2 text-lg"></i> Messages
                        </a>
                    </li>
                    <li>
                        <a href="/main/settings.html" class="flex items-center block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm transition-colors duration-150">
                            <i class="fa-solid fa-gear mx-2 text-lg"></i> Settings
                        </a>
                    </li>
                    <li>
                        <a href="/main/api/logout.php" class="flex items-center block px-4 py-3 text-gray-700 hover:bg-gray-50 text-sm transition-colors duration-150 rounded-b-xl">
                            <i class="fa-solid fa-power-off mx-2 text-lg"></i> Log out
                        </a>
                    </li>
                </ul>
            `;
            if (profileLink) profileLink.classList.remove('hidden');
            if (notifyLink) notifyLink.classList.remove('hidden');
            if (newPostLink) newPostLink.classList.remove('hidden');
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');

            const notifySubMenu = notifyLink.querySelector('.notify-sub-menu');
            if (notifyHeader && notifySubMenu) {
                notifyHeader.addEventListener('click', (e) => {
                    e.preventDefault();
                    notifySubMenu.classList.toggle('hidden');
                });
            }
        } else if (profileHeader) {
            profileHeader.innerHTML = '<a href="/main/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Log in</a>';
            if (profileLink) profileLink.classList.add('hidden');
            if (notifyLink) notifyLink.classList.add('hidden');
            if (newPostLink) newPostLink.classList.add('hidden');
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
        }

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
        console.error('Error fetching user profile in script.js:', error);
        const profileHeader = document.getElementById('user-profile');
        if (profileHeader) {
            profileHeader.innerHTML = '<a href="/main/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Log in</a>';
            const profileLink = document.querySelector('.profile-link');
            const notifyLink = document.querySelector('.notify-link');
            const newPostLink = document.querySelector('.new_post-link');
            const loginLink = document.querySelector('.login-link');
            const registerLink = document.querySelector('.register-link');
            if (profileLink) profileLink.classList.add('hidden');
            if (notifyLink) notifyLink.classList.add('hidden');
            if (newPostLink) newPostLink.classList.add('hidden');
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
        }
        return null;
    }
}

function highlightSelectedMenuItem() {
    const selected = localStorage.getItem('selectedMenuItem');
    if (selected) {
        document.querySelectorAll('#sidebar-menu a').forEach(link => {
            const isSelected = link.href.endsWith(selected);
            link.classList.toggle('text-blue-500', isSelected);
            link.classList.toggle('font-semibold', isSelected);
            link.classList.toggle('text-gray-600', !isSelected);
        });
    }
}

function setupMenuClickHandlers() {
    document.querySelectorAll('#sidebar-menu a').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.setItem('selectedMenuItem', link.pathname);
            document.querySelectorAll('#sidebar-menu a').forEach(l => {
                l.classList.remove('text-blue-500', 'font-semibold');
                l.classList.add('text-gray-600');
            });
            link.classList.add('text-blue-500', 'font-semibold');
            link.classList.remove('text-gray-600');
            if (window.innerWidth < 768) {
                const aside = document.querySelector('aside');
                if (aside) aside.classList.add('hidden');
            }
        });
    });
}

function restrictUnauthorizedURLs() {
    const validPaths = [
        '/main/index.html', '/main/profile.html', '/main/new_post.html',
        '/main/settings.html', '/main/trending.html', '/main/explorer.html',
        '/main/post.html', '/main/login.html', '/main/register.html',
        '/main/edit_post.html', '/main/forgot_password.html', '/main/messages.html'
    ];
    const currentPath = window.location.pathname;
    if (!validPaths.includes(currentPath)) {
        console.log('Invalid path, redirecting to /main/index.html');
        window.location.replace('/main/index.html');
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

function setupHeaderScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll < lastScroll) {
                header.classList.remove('-translate-y-full');
                header.classList.add('translate-y-0');
            } else if (currentScroll > lastScroll) {
                header.classList.remove('translate-y-0');
                header.classList.add('-translate-y-full');
            }

            lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        });
    }
}

document.addEventListener('click', (event) => {
    const subMenus = document.querySelectorAll('.sub-menu');
    const notifySubMenus = document.querySelectorAll('.notify-sub-menu');
    
    subMenus.forEach(subMenu => {
        const profileLink = subMenu.previousElementSibling;
        if (!subMenu.contains(event.target) && !profileLink.contains(event.target)) {
            subMenu.classList.add('hidden');
        }
    });
    
    notifySubMenus.forEach(notifySubMenu => {
        const notifyLink = notifySubMenu.previousElementSibling;
        if (!notifySubMenu.contains(event.target) && !notifyLink.contains(event.target)) {
            notifySubMenu.classList.add('hidden');
        }
    });
});
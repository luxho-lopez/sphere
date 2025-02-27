document.addEventListener('DOMContentLoaded', async () => {
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
        console.error('Error during DOM load:', error);
    }
});

async function fetchNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    if (!notificationsList) {
        console.log('Notifications list not found on this page');
        return;
    }
    try {
        const response = await fetch('/sphere/api/get_notifications.php', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
        const data = await response.json();
        
        if (data.success && data.notifications?.length) {
            notificationsList.innerHTML = data.notifications.map(notif => `
                <div class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b ${
                    notif.is_read ? '' : 'font-bold bg-gray-50'
                }" data-notification-id="${notif.id}">
                    <div class="flex justify-between items-center">
                        <div>
                            <span>${notif.message}</span>
                            <span class="text-xs text-gray-500 block">${new Date(notif.timestamp).toLocaleString()}</span>
                        </div>
                        <button class="toggle-read-btn text-xs ${
                            notif.is_read ? 'text-blue-500' : 'text-gray-500'
                        }" title="${notif.is_read ? 'Mark as unread' : 'Mark as read'}">
                            <ion-icon name="${notif.is_read ? 'eye-off-outline' : 'eye-outline'}" class="ml-2" size="small"></ion-icon>
                        </button>
                    </div>
                </div>
            `).join('');
            
            notificationsList.querySelectorAll('.toggle-read-btn').forEach(btn => {
                btn.addEventListener('click', async function(e) {
                    e.stopPropagation();
                    const notificationDiv = this.closest('[data-notification-id]');
                    const notificationId = notificationDiv.dataset.notificationId;
                    const currentState = !notificationDiv.classList.contains('font-bold');
                    const newState = !currentState;
                
                    this.disabled = true;
                    this.innerHTML = '<ion-icon name="refresh-outline" class="animate-spin"></ion-icon>';
                
                    const success = await toggleNotificationRead(notificationId, newState);
                    
                    if (success) {
                        notificationDiv.classList.toggle('font-bold', !newState);
                        notificationDiv.classList.toggle('bg-gray-50', !newState);
                        this.classList.toggle('text-blue-500', newState);
                        this.classList.toggle('text-gray-500', !newState);
                        this.querySelector('ion-icon').setAttribute('name', 
                            newState ? 'eye-off-outline' : 'eye-outline');
                        this.setAttribute('title', 
                            newState ? 'Mark as unread' : 'Mark as read');
                    }
                    
                    this.disabled = false;
                    this.innerHTML = `<ion-icon name="${newState ? 'eye-off-outline' : 'eye-outline'}" class="ml-2" size="small"></ion-icon>`;
                });
            });
        } else {
            notificationsList.innerHTML = `
                <div class="px-4 py-2 text-sm text-gray-500">
                    No new notifications
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching notifications:', error);
        notificationsList.innerHTML = `
            <div class="px-4 py-2 text-sm text-gray-500">
                Unable to load notifications
            </div>
        `;
    }
}

async function toggleNotificationRead(notificationId, isRead) {
    try {
        const response = await fetch('/sphere/api/mark_notification_read.php', {
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
        const response = await fetch('/sphere/api/get_user.php', {
            credentials: 'include'
        });
        const profileHeader = document.getElementById('user-profile');
        const profileLink = document.querySelector('.profile-link');
        const notifyLink = document.querySelector('.notify-link');
        const notifyHeader = document.getElementById('user-notify');
        const newPostLink = document.querySelector('.new_post-link');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');
        const logoutLink = document.querySelector('.logout-link');
        const logoContainer = document.querySelector('.logo');

        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        const user = data.success && data.user?.length ? data.user[0] : null;

        if (logoContainer) {
            logoContainer.innerHTML = `
                <a href="/sphere/index.html"><h1 class="text-2xl font-bold text-gray-800">Sphere</h1></a>
                <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                    <ion-icon name="menu-outline" class="text-2xl"></ion-icon>
                </button>
            `;
            setupMenuToggle();
        }

        if (user && profileHeader) {
            const userNameSlug = (user.first_name + '-' + (user.last_name || '')).toLowerCase().replace(/\s+/g, '-');
            profileHeader.innerHTML = `
                <a href="/sphere/profile.html?user=${user.id}-${userNameSlug}" class="user-profile-link flex items-center space-x-2">
                    <img src="${user.profile_picture || '/sphere/images/profile/default-avatar.png'}" alt="${user.first_name}" class="w-8 h-8 rounded-full object-cover">
                </a>
                <ul class="sub-menu absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-40 hidden">
                    <li><a href="/sphere/profile.html?user=${user.id}-${userNameSlug}" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">${user.first_name} - View profile</a></li>
                    <li><a href="/sphere/change_password.html" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">Change password</a></li>
                    <li><a href="/sphere/api/logout.php" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm">Log out</a></li>
                </ul>
            `;
            if (profileLink) profileLink.classList.remove('hidden');
            if (notifyLink) notifyLink.classList.remove('hidden');
            if (newPostLink) newPostLink.classList.remove('hidden');
            if (loginLink) loginLink.classList.add('hidden');
            if (registerLink) registerLink.classList.add('hidden');
            if (logoutLink) logoutLink.classList.add('hidden');

            const notifySubMenu = notifyLink.querySelector('.notify-sub-menu');
            if (notifyHeader && notifySubMenu) {
                notifyHeader.addEventListener('click', (e) => {
                    e.preventDefault();
                    notifySubMenu.classList.toggle('hidden');
                });
            }
        } else if (profileHeader) {
            profileHeader.innerHTML = '<a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Log in</a>';
            if (profileLink) profileLink.classList.add('hidden');
            if (notifyLink) notifyLink.classList.add('hidden');
            if (newPostLink) newPostLink.classList.add('hidden');
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
            if (logoutLink) logoutLink.classList.add('hidden');
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
            profileHeader.innerHTML = '<a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Log in</a>';
            const profileLink = document.querySelector('.profile-link');
            const notifyLink = document.querySelector('.notify-link');
            const newPostLink = document.querySelector('.new_post-link');
            const loginLink = document.querySelector('.login-link');
            const registerLink = document.querySelector('.register-link');
            const logoutLink = document.querySelector('.logout-link');
            if (profileLink) profileLink.classList.add('hidden');
            if (notifyLink) notifyLink.classList.add('hidden');
            if (newPostLink) newPostLink.classList.add('hidden');
            if (loginLink) loginLink.classList.remove('hidden');
            if (registerLink) registerLink.classList.remove('hidden');
            if (logoutLink) logoutLink.classList.add('hidden');
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
        '/sphere/index.html', '/sphere/profile.html', '/sphere/new_post.html',
        '/sphere/notify.html', '/sphere/trending.html', '/sphere/explorer.html',
        '/sphere/all_posts.html', '/sphere/post.html', '/sphere/login.html', '/sphere/register.html',
        '/sphere/change_password.html', '/sphere/edit_post.html'
    ];
    const currentPath = window.location.pathname;
    if (!validPaths.includes(currentPath)) {
        console.log('Invalid path, redirecting to /sphere/index.html');
        window.location.replace('/sphere/index.html');
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
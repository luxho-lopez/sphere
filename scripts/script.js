document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile(); // Solo llamamos a fetchUserProfile, que manejará setupMenuToggle
    highlightSelectedMenuItem();
    setupMenuClickHandlers();
    restrictUnauthorizedURLs();
    setupHeaderScroll(); // Nueva función para manejar el scroll del header
    setupMobileIcons(); // Nueva función para manejar íconos y submenús móviles
});

async function fetchUserProfile() {
    try {
        const response = await fetch('/sphere/api/get_user.php');
        const profileHeader = document.getElementById('user-profile');
        const profileLink = document.querySelector('.profile-link');
        const notifyLink = document.querySelector('.notify-link');
        const newPostLink = document.querySelector('.new_post-link');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');
        const logoutLink = document.querySelector('.logout-link');
        const logoContainer = document.querySelector('.logo');

        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        const user = data.success && data.usuario?.length ? data.usuario[0] : null;

        // Agregar botón de menú después del logo
        if (logoContainer) {
            logoContainer.innerHTML = `
                <a href="/sphere/index.html"><h1 class="text-2xl font-bold text-gray-800">Sphere</h1></a>
                <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                    <ion-icon name="menu-outline" class="text-2xl"></ion-icon>
                </button>
            `;
            setupMenuToggle(); // Llamar después de agregar el botón
        }

        if (user) {
            profileHeader.innerHTML = `
                <a href="/sphere/profile.html" class="user-profile-link flex items-center space-x-2">
                    <img src="${user.foto_perfil || '/sphere/images/profile/default-avatar.png'}" alt="${user.nombre}" class="w-8 h-8 rounded-full object-cover">
                </a>
                <ul class="sub-menu absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg z-40 hidden">
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
            if (logoutLink) logoutLink.classList.add('hidden');
        } else {
            profileHeader.innerHTML = '<a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Iniciar sesión</a>';
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
    } catch (error) {
        console.error('Error fetching user profile:', error);
        const profileHeader = document.getElementById('user-profile');
        const profileLink = document.querySelector('.profile-link');
        const notifyLink = document.querySelector('.notify-link');
        const newPostLink = document.querySelector('.new_post-link');
        const loginLink = document.querySelector('.login-link');
        const registerLink = document.querySelector('.register-link');
        const logoutLink = document.querySelector('.logout-link');
        const logoContainer = document.querySelector('.logo');

        if (logoContainer) {
            logoContainer.innerHTML = `
                <a href="/sphere/index.html"><h1 class="text-2xl font-bold text-gray-800">Sphere</h1></a>
                <button class="menu-toggle md:hidden text-gray-600 hover:text-gray-800 focus:outline-none flex items-end">
                    <ion-icon name="menu-outline" class="text-2xl"></ion-icon>
                </button>
            `;
            setupMenuToggle(); // Llamar después de agregar el botón
        }

        profileHeader.innerHTML = '<a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800 text-sm">Iniciar sesión</a>';
        if (profileLink) profileLink.classList.add('hidden');
        if (notifyLink) notifyLink.classList.add('hidden');
        if (newPostLink) newPostLink.classList.add('hidden');
        if (loginLink) loginLink.classList.remove('hidden');
        if (registerLink) registerLink.classList.remove('hidden');
        if (logoutLink) logoutLink.classList.add('hidden');
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
        '/sphere/all_posts.html', '/sphere/login.html', '/sphere/register.html',
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

// Nueva función para manejar el scroll del header
function setupHeaderScroll() {
    const header = document.querySelector('header');
    let lastScroll = 0;

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll < lastScroll) {
                // Scroll hacia arriba: mostrar el header
                header.classList.remove('-translate-y-full');
                header.classList.add('translate-y-0');
            } else if (currentScroll > lastScroll) {
                // Scroll hacia abajo: ocultar el header
                header.classList.remove('translate-y-0');
                header.classList.add('-translate-y-full');
            }

            lastScroll = currentScroll <= 0 ? 0 : currentScroll; // Evitar valores negativos
        });
    }
}

// Nueva función para manejar íconos y submenús móviles
function setupMobileIcons() {
    const searchIcon = document.querySelector('.search-icon');
    const newPostIcon = document.querySelector('.new-post-icon');
    const notifyIcon = document.querySelector('.notify-icon');
    const searchSubmenu = document.querySelector('.search-submenu');
    const notifySubmenu = document.querySelector('.notify-submenu');

    if (window.innerWidth < 768) {
        // Mostrar íconos y ocultar elementos de texto en pantallas pequeñas
        document.querySelector('.search-div').classList.add('hidden');
        document.querySelector('.new_post-link a').classList.add('hidden');
        document.querySelector('.notify-link a').classList.add('hidden');
        searchIcon.classList.remove('hidden');
        newPostIcon.classList.remove('hidden');
        notifyIcon.classList.remove('hidden');

        // Manejar clic en el ícono de búsqueda
        if (searchIcon && searchSubmenu) {
            searchIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                searchSubmenu.classList.toggle('active');
                if (notifySubmenu) notifySubmenu.classList.remove('active'); // Cerrar notify si está abierto
            });
        }

        // Manejar clic en el ícono de "New Post"
        if (newPostIcon) {
            newPostIcon.addEventListener('click', () => {
                window.location.href = '/sphere/new_post.html';
            });
        }

        // Manejar clic en el ícono de notificaciones
        if (notifyIcon && notifySubmenu) {
            notifyIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                notifySubmenu.classList.toggle('active');
                if (searchSubmenu) searchSubmenu.classList.remove('active'); // Cerrar search si está abierto
            });
        }

        // Cerrar submenús al hacer clic fuera
        document.addEventListener('click', (event) => {
            if (!searchSubmenu.contains(event.target) && !searchIcon.contains(event.target)) {
                searchSubmenu.classList.remove('active');
            }
            if (!notifySubmenu.contains(event.target) && !notifyIcon.contains(event.target)) {
                notifySubmenu.classList.remove('active');
            }
        });

        // Manejar búsqueda en el submenú
        const searchInput = searchSubmenu.querySelector('.search-input');
        const searchButton = searchSubmenu.querySelector('button');
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    alert(`Searching for: ${query}`); // Simulación, puedes reemplazar con una API real
                    searchSubmenu.classList.remove('active'); // Cerrar después de buscar
                }
            });
        }
    }
}

document.addEventListener('click', (event) => {
    const subMenus = document.querySelectorAll('.sub-menu');
    subMenus.forEach(subMenu => {
        const profileLink = subMenu.previousElementSibling;
        if (!subMenu.contains(event.target) && !profileLink.contains(event.target)) {
            subMenu.classList.add('hidden');
        }
    });
});
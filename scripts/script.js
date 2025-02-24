document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    highlightSelectedMenuItem();
    setupMenuClickHandlers();
    restrictUnauthorizedURLs();
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

        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        const user = data.success && data.usuario?.length ? data.usuario[0] : null;

        if (user) {
            // Sesión activa: mostrar perfil y submenú
            profileHeader.innerHTML = `
                <a href="/sphere/profile.html" class="user-profile-link">
                    <img src="${user.foto_perfil || '/images/profile/default-avatar.png'}" alt="${user.nombre}" class="user-profile-avatar">
                </a>
                <ul class="sub-menu">
                    <li><a href="/sphere/profile.html">${user.nombre} - Ver perfil</a></li>
                    <li><a href="/sphere/change_password.html">Cambiar contraseña</a></li>
                    <li><a href="/sphere/api/logout.php">Cerrar sesión</a></li>
                </ul>
            `;
            if (profileLink) profileLink.style.display = 'block';
            if (notifyLink) notifyLink.style.display = 'block';
            if (newPostLink) newPostLink.style.display = 'block';
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none'; // Ocultar enlace suelto de logout si existe
        } else {
            // Sin sesión: mostrar solo "Iniciar sesión" y ocultar enlaces
            profileHeader.innerHTML = '<a href="/sphere/login.html">Iniciar sesión</a>';
            if (profileLink) profileLink.style.display = 'none';
            if (notifyLink) notifyLink.style.display = 'none';
            if (newPostLink) newPostLink.style.display = 'none';
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'none';
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

        // Error (no autenticado): ocultar enlaces y submenú
        profileHeader.innerHTML = '<a href="/sphere/login.html">Iniciar sesión</a>';
        if (profileLink) profileLink.style.display = 'none';
        if (notifyLink) notifyLink.style.display = 'none';
        if (newPostLink) newPostLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

function highlightSelectedMenuItem() {
    const selected = localStorage.getItem('selectedMenuItem');
    if (selected) {
        document.querySelectorAll('#sidebar-menu a').forEach(link => {
            link.classList.toggle('active', link.href.endsWith(selected));
        });
    }
}

function setupMenuClickHandlers() {
    document.querySelectorAll('#sidebar-menu a').forEach(link => {
        link.addEventListener('click', () => {
            localStorage.setItem('selectedMenuItem', link.pathname);
            document.querySelectorAll('#sidebar-menu a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
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
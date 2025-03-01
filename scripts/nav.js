// Definir el HTML del header y aside como templates
const headerTemplate = `
    <header class="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center transition-transform duration-300 z-50">
        <div class="logo flex items-center space-x-2">
            <a href="/sphere/index.html">
                <h1 class="text-2xl font-bold text-gray-800">Sphere</h1>
            </a>
        </div>
        <div class="search-div w-full max-w-md mx-4 relative">
            <div class="relative">
                <input id="search-input" class="w-full bg-gray-50 text-gray-800 text-sm border border-gray-200 rounded-full pl-10 pr-4 py-2.5 transition duration-300 ease focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 shadow-sm hover:shadow-md placeholder-gray-400" placeholder="Search users or posts..." autocomplete="off" />
                <ion-icon name="search-outline" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg"></ion-icon>
                <div id="search-results" class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto hidden z-50 border border-gray-100"></div>
            </div>
        </div>
        <button class="search-icon md:hidden text-gray-600 hover:text-gray-800 focus:outline-none">
            <ion-icon name="search-outline" class="text-2xl"></ion-icon>
        </button>
        <nav>
            <ul id="nav-menu" class="flex items-center space-x-6">
                <li class="login-link"><a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800">Log In</a></li>
                <li class="register-link"><a href="/sphere/register.html" class="text-gray-600 hover:text-gray-800">Register</a></li>
                <li class="new_post-link">
                    <a href="/sphere/new_post.html" class="text-gray-600 hover:text-gray-800">
                        <span class="inline-flex shrink-0 rounded-full border border-blue-300 bg-blue-100 p-2 dark:border-blue-300/10 dark:bg-blue-400/10">
                            <ion-icon name="add-outline"></ion-icon>
                        </span>
                    </a>
                </li>
                <li class="notify-link relative hidden">
                    <div id="user-notify" class="text-gray-600 hover:text-gray-800 cursor-pointer">
                        <ion-icon name="notifications-outline" class="text-2xl"></ion-icon>
                    </div>
                    <ul class="notify-sub-menu absolute right-0 mt-2 w-64 bg-white shadow-md rounded-lg z-40 hidden">
                        <li class="px-4 py-2 text-sm text-gray-700 border-b">Notifications</li>
                        <li id="notifications-list" class="max-h-64 overflow-y-auto">
                            <!-- Notifications will be populated here -->
                        </li>
                        <li class="px-4 py-2 text-sm text-blue-500 hover:bg-gray-100">
                            <a href="/sphere/notify.html">See all notifications</a>
                        </li>
                    </ul>
                </li>
                <li class="profile-link relative hidden">
                    <div id="user-profile" class="text-gray-600 hover:text-gray-800 cursor-pointer"></div>
                </li>
            </ul>
        </nav>
    </header>
`;

const asideTemplate = `
    <aside class="fixed top-0 left-0 w-64 h-full bg-white shadow-md p-4 hidden md:block">
        <nav>
            <ul id="sidebar-menu" class="space-y-4 mt-24">
                <li><a href="/sphere/index.html" class="px-10 py-2 flex items-center text-gray-600 hover:text-gray-800"><ion-icon name="home-outline" class="mr-4"></ion-icon> Home</a></li>
                <li><a href="/sphere/trending.html" class="px-10 py-2 flex items-center text-gray-600 hover:text-gray-800"><ion-icon name="trending-up-outline" class="mr-4"></ion-icon> Trending</a></li>
                <li><a href="/sphere/explorer.html" class="px-10 py-2 flex items-center text-gray-600 hover:text-gray-800"><ion-icon name="planet-outline" class="mr-4"></ion-icon> Explore</a></li>
                <li><a href="/sphere/all_posts.html" class="px-10 py-2 flex items-center text-gray-600 hover:text-gray-800"><ion-icon name="podium-outline" class="mr-4"></ion-icon> All Posts</a></li>
            </ul>
        </nav>
    </aside>
`;

// Función para inyectar el header y aside
function injectNavigation() {
    const headerElement = document.querySelector('header');
    const asideElement = document.querySelector('aside');

    if (headerElement) {
        headerElement.outerHTML = headerTemplate;
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerTemplate);
    }

    if (asideElement) {
        asideElement.outerHTML = asideTemplate;
    } else {
        document.body.insertAdjacentHTML('afterbegin', asideTemplate);
    }

    setupSearch(); // Initialize search functionality after injecting the header
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    injectNavigation();
});

// Real-time search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) {
        console.error('Search input or results container not found');
        return;
    }

    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) { // Minimum query length to reduce unnecessary requests
            searchResults.classList.add('hidden');
            searchResults.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`/sphere/api/search.php?query=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();

            if (data.success && (data.users.length || data.posts.length)) {
                searchResults.innerHTML = `
                    <div class="users-section">
                        <h3 class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border-b">Users</h3>
                        ${data.users.length ? data.users.map(user => `
                            <a href="/sphere/profile.html?user=@${user.username}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                                <img src="${user.profile_picture || '/sphere/images/profile/default-avatar.png'}" class="w-8 h-8 rounded-full object-cover">
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
                            <a href="/sphere/post.html?post_id=${post.id}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
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

// Debounce function to limit the rate of search requests
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
// Definir el HTML del header y aside como templates
const headerTemplate = `
    <header class="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center">
        <div class="logo flex items-center space-x-2">
            <a href="/sphere/index.html">
                <h1 class="text-2xl font-bold text-gray-800">Sphere</h1>
            </a>
        </div>
        <div class="search-div w-full max-w-sm min-w-[200px] md:block hidden">
            <div class="relative">
                <input class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Posts..." />
                <button class="bg-blue-500 absolute top-1 right-1 flex items-center rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" type="button">
                    <ion-icon name="search-outline"></ion-icon>
                    Search
                </button>
            </div>
        </div>
        <button class="search-icon md:hidden text-gray-600 hover:text-gray-800 focus:outline-none">
            <ion-icon name="search-outline" class="text-2xl"></ion-icon>
        </button>
        <nav>
            <ul id="nav-menu" class="flex items-center space-x-6">
                <li class="login-link"><a href="/sphere/login.html" class="text-gray-600 hover:text-gray-800">Log In</a></li>
                <li class="register-link"><a href="/sphere/register.html" class="text-gray-600 hover:text-gray-800">Register</a></li>
                <li class="new_post-link hidden">
                    <a href="/sphere/new_post.html" class="text-gray-600 hover:text-gray-800 md:block hidden">New Post</a>
                    <button class="new-post-icon md:hidden text-gray-600 hover:text-gray-800 focus:outline-none">
                        <ion-icon name="add-outline" class="text-2xl"></ion-icon>
                    </button>
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
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', injectNavigation);
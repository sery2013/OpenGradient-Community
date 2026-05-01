/**
 * RITUAL LEADERBOARD ENGINE
 * Выполняет функции: загрузку данных, фильтрацию по времени, 
 * отрисовку NFT-карточек и интеграцию с блокчейном Ritual Foundation.
 */

// --- КОНФИГУРАЦИЯ И СОСТОЯНИЕ ---
const CONTRACT_ADDRESS = "0x30412DD5eAf58a8491b2f728140dEb3CDCF83C26";
const CONTRACT_ABI = [
    "function mintCard(address to, string username, uint256 posts, uint256 likes, uint256 retweets, uint256 comments, uint256 views, string imageData) payable",
    "function cards(uint256 tokenId) view returns (address, string, uint256, uint256, uint256, uint256, uint256, string, uint256)",
    "function balanceOf(address owner) view returns (uint256)"
];

let state = {
    rawData: [],      // Исходные данные лидеров
    allTweets: [],    // Массив всех твитов для фильтрации по датам
    processedData: [], // Данные после фильтров и поиска
    currentSort: { key: 'posts', order: 'desc' },
    pagination: { current: 1, perPage: 15 },
    filters: { search: '', time: 'all' }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        console.log("🚀 Загрузка данных...");
        const [lbResponse, twResponse] = await Promise.all([
            fetch("leaderboard.json"),
            fetch("all_tweets.json")
        ]);

        state.rawData = await lbResponse.json();
        state.allTweets = await twResponse.json();
        
        applyFiltersAndSort();
        setupTabs();
    } catch (error) {
        showNotification("Ошибка загрузки данных. Проверьте JSON файлы.", "error");
        console.error("Critical Load Error:", error);
    }
}

// --- ЯДРО ОБРАБОТКИ ДАННЫХ ---
function applyFiltersAndSort() {
    let filtered = Array.isArray(state.rawData) ? [...state.rawData] : Object.entries(state.rawData).map(([u, s]) => ({ username: u, ...s }));

    // 1. Фильтрация по времени (если выбрано не "all")
    if (state.filters.time !== 'all') {
        const daysLimit = parseInt(state.filters.time);
        const now = new Date();
        
        filtered = filtered.map(user => {
            const userTweets = state.allTweets.filter(t => 
                (t.user?.screen_name || t.username || "").toLowerCase().replace('@','') === user.username.toLowerCase().replace('@','')
            );
            
            return calculateStatsForPeriod(user, userTweets, daysLimit, now);
        });
    }

    // 2. Поиск
    if (state.filters.search) {
        filtered = filtered.filter(u => u.username.toLowerCase().includes(state.filters.search.toLowerCase()));
    }

    // 3. Сортировка
    filtered.sort((a, b) => {
        const valA = a[state.currentSort.key] || 0;
        const valB = b[state.currentSort.key] || 0;
        return state.currentSort.order === 'desc' ? valB - valA : valA - valB;
    });

    state.processedData = filtered;
    renderAll();
}

function calculateStatsForPeriod(user, tweets, days, now) {
    const stats = { ...user, posts: 0, likes: 0, retweets: 0, views: 0 };
    tweets.forEach(t => {
        const date = new Date(t.created_at || t.tweet_created_at);
        if ((now - date) / (1000 * 60 * 60 * 24) <= days) {
            stats.posts++;
            stats.likes += (t.favorite_count || 0);
            stats.retweets += (t.retweet_count || 0);
            stats.views += (t.views_count || 0);
        }
    });
    return stats;
}

// --- ОТРИСОВКА ИНТЕРФЕЙСА ---
function renderAll() {
    renderTable();
    updateDashboardStats();
    updatePaginationUI();
}

function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    const start = (state.pagination.current - 1) * state.pagination.perPage;
    const pageData = state.processedData.slice(start, start + state.pagination.perPage);

    tbody.innerHTML = pageData.map(user => `
        <tr class="fade-in">
            <td>
                <div class="user-cell">
                    <span class="username">${user.username}</span>
                    <button class="generate-card-btn" onclick="openMintModal('${user.username}')">🎴 Card</button>
                </div>
            </td>
            <td>${user.posts.toLocaleString()}</td>
            <td>${user.likes.toLocaleString()}</td>
            <td>${(user.retweets || 0).toLocaleString()}</td>
            <td>${(user.comments || 0).toLocaleString()}</td>
            <td class="views-cell">${(user.views || 0).toLocaleString()}</td>
        </tr>
    `).join('');
}

function updateDashboardStats() {
    const totals = state.processedData.reduce((acc, curr) => {
        acc.posts += (curr.posts || 0);
        acc.views += (curr.views || 0);
        return acc;
    }, { posts: 0, views: 0 });

    document.getElementById("total-posts").textContent = totals.posts.toLocaleString();
    document.getElementById("total-users").textContent = state.processedData.length;
    document.getElementById("total-views").textContent = totals.views.toLocaleString();
}

// --- МОДАЛЬНОЕ ОКНО И CANVAS (NFT) ---
async function openMintModal(username) {
    const userStats = state.processedData.find(u => u.username === username);
    if (!userStats) return;

    const modal = document.getElementById('card-modal');
    modal.style.display = 'block';
    
    await drawNFTCard(username, userStats);
}

async function drawNFTCard(username, stats) {
    const canvas = document.getElementById('user-canvas');
    const ctx = canvas.getContext('2d');
    
    // Очистка и фон
    ctx.fillStyle = '#0f1717';
    ctx.fillRect(0, 0, 1200, 675);
    
    // Рисуем декоративные элементы (сетку/градиент)
    drawCardBranding(ctx);

    // Текст
    ctx.fillStyle = '#6fe3d1';
    ctx.font = 'bold 50px Inter, sans-serif';
    ctx.fillText(`@${username.toUpperCase()}`, 80, 100);

    // Статистика в ряд
    const items = [
        { label: 'POSTS', val: stats.posts, x: 80 },
        { label: 'LIKES', val: stats.likes, x: 330 },
        { label: 'VIEWS', val: stats.views, x: 580 }
    ];

    items.forEach(item => {
        ctx.fillStyle = '#8ba2a0';
        ctx.font = '20px Inter';
        ctx.fillText(item.label, item.x, 200);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Inter';
        ctx.fillText(item.val.toLocaleString(), item.x, 250);
    });
}

function drawCardBranding(ctx) {
    const grad = ctx.createLinearGradient(0,0, 1200, 675);
    grad.addColorStop(0, '#6fe3d122');
    grad.addColorStop(1, '#00000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0, 1200, 675);
    
    ctx.strokeStyle = '#6fe3d144';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 1160, 635);
}

// --- СОБЫТИЯ И НАВИГАЦИЯ ---
function setupEventListeners() {
    document.getElementById('search').addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        state.pagination.current = 1;
        applyFiltersAndSort();
    });

    document.getElementById('time-select').addEventListener('change', (e) => {
        state.filters.time = e.target.value;
        applyFiltersAndSort();
    });

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const key = header.id.replace('-header', '').replace('-col', '');
            state.currentSort.order = (state.currentSort.key === key && state.currentSort.order === 'desc') ? 'asc' : 'desc';
            state.currentSort.key = key;
            applyFiltersAndSort();
        });
    });

    // Закрытие модалки
    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('card-modal').style.display = 'none';
    };
}

function showNotification(msg, type) {
    // Здесь можно добавить логику всплывающих уведомлений (Toast)
    alert(msg); 
}

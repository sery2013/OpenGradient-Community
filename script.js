// --- ГЛОБАЛЬНОЕ СОСТОЯНИЕ ---
let state = {
    rawData: [], 
    allTweets: [], 
    processedData: [],
    currentSort: { key: 'posts', order: 'desc' },
    pagination: { current: 1, perPage: 15 },
    filters: { search: '', time: 'all' }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    try {
        // Загружаем данные из JSON файлов
        const [lbRes, twRes] = await Promise.all([
            fetch("leaderboard.json").then(r => r.json()),
            fetch("all_tweets.json").then(r => r.json())
        ]);
        
        // Преобразуем объект в массив, если это необходимо
        state.rawData = Array.isArray(lbRes) ? lbRes : Object.entries(lbRes).map(([u, s]) => ({ username: u, ...s }));
        state.allTweets = twRes;
        
        setupEventListeners();
        setupTabs();
        applyFiltersAndSort(); // Первая отрисовка и расчет статистики
        
    } catch (e) {
        console.error("Критическая ошибка при загрузке данных:", e);
    }
}

// --- УПРАВЛЕНИЕ ВКЛАДКАМИ ---
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.onclick = () => {
            const target = btn.dataset.tab;
            
            // Переключаем активный класс кнопок
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Переключаем видимость контента
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            const contentId = target === 'leaderboard' ? 'leaderboard-wrapper' : `tab-${target}`;
            const targetContent = document.getElementById(contentId);
            
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        };
    });
}

// --- ФИЛЬТРАЦИЯ И СОРТИРОВКА ---
function applyFiltersAndSort() {
    let data = [...state.rawData];

    // Поиск по имени пользователя
    if (state.filters.search) {
        data = data.filter(u => u.username.toLowerCase().includes(state.filters.search.toLowerCase()));
    }

    // Сортировка (с принудительным преобразованием в числа для корректного сравнения)
    data.sort((a, b) => {
        const valA = Number(a[state.currentSort.key]) || 0;
        const valB = Number(b[state.currentSort.key]) || 0;
        return state.currentSort.order === 'desc' ? valB - valA : valA - valB;
    });

    state.processedData = data;
    state.pagination.current = 1; // Сброс на первую страницу при поиске/сортировке
    
    renderAll();
}

function renderAll() {
    updateStats();
    renderTable();
}

// --- ОБНОВЛЕНИЕ СТАТИСТИКИ (ИСПРАВЛЕНО) ---
function updateStats() {
    const postsDisplay = document.getElementById("total-posts-val");
    const usersDisplay = document.getElementById("total-users-val");
    const viewsDisplay = document.getElementById("total-views-val");

    if (!state.processedData || state.processedData.length === 0) {
        if (postsDisplay) postsDisplay.textContent = "0";
        if (usersDisplay) usersDisplay.textContent = "0";
        if (viewsDisplay) viewsDisplay.textContent = "0";
        return;
    }

    // Считаем суммы, переводя строки в числа
    const totals = state.processedData.reduce((acc, curr) => {
        acc.p += Number(curr.posts) || 0;
        acc.v += Number(curr.views) || 0;
        return acc;
    }, { p: 0, v: 0 });

    // Вывод в HTML с форматированием (1 234 567)
    if (postsDisplay) postsDisplay.textContent = totals.p.toLocaleString();
    if (usersDisplay) usersDisplay.textContent = state.processedData.length.toLocaleString();
    if (viewsDisplay) viewsDisplay.textContent = totals.v.toLocaleString();
}

// --- РЕНДЕР ТАБЛИЦЫ ---
function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;

    const start = (state.pagination.current - 1) * state.pagination.perPage;
    const pageData = state.processedData.slice(start, start + state.pagination.perPage);

    tbody.innerHTML = pageData.map(user => {
        // Убираем спецсимволы из ника для создания валидного ID строки
        const safeId = user.username.replace(/[^a-z0-9]/gi, '');
        
        return `
            <tr class="main-row" onclick="toggleTweets('${user.username}', this)">
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span class="user-link" style="color:var(--accent); font-weight:bold;">@${user.username}</span>
                        <button class="generate-card-btn" onclick="event.stopPropagation(); openMintModal('${user.username}')">🎴 Card</button>
                    </div>
                </td>
                <td>${Number(user.posts).toLocaleString()}</td>
                <td>${Number(user.likes).toLocaleString()}</td>
                <td>${Number(user.retweets || user.RTs || 0).toLocaleString()}</td>
                <td>${Number(user.comments).toLocaleString()}</td>
                <td>${Number(user.views).toLocaleString()}</td>
            </tr>
            <tr id="tweets-${safeId}" class="tweets-row" style="display:none;">
                <td colspan="6">
                    <div class="tweets-container">Загрузка последних постов...</div>
                </td>
            </tr>
        `;
    }).join('');
    
    updatePaginationUI();
}

// --- ПРОСМОТР ТВИТОВ ---
function toggleTweets(username, row) {
    const safeId = `tweets-${username.replace(/[^a-z0-9]/gi, '')}`;
    const targetRow = document.getElementById(safeId);
    
    if (targetRow.style.display === 'table-row') {
        targetRow.style.display = 'none';
    } else {
        // Закрываем другие открытые списки твитов
        document.querySelectorAll('.tweets-row').forEach(r => r.style.display = 'none');
        targetRow.style.display = 'table-row';
        
        const container = targetRow.querySelector('.tweets-container');
        
        // Фильтруем твиты конкретного юзера
        const userTweets = state.allTweets.filter(t => {
            const tweetUser = (t.username || t.user?.screen_name || "").toLowerCase().replace('@','');
            return tweetUser === username.toLowerCase().replace('@','');
        }).slice(0, 5); // Показываем топ-5

        container.innerHTML = userTweets.length ? userTweets.map(t => `
            <div class="tweet-item">
                <p>${t.text || t.full_text || "Текст поста"}</p>
                <a href="https://twitter.com/i/status/${t.id_str || t.tweet_id}" target="_blank">View on X →</a>
            </div>
        `).join('') : "Посты этого пользователя не найдены в базе данных.";
    }
}

// --- ПАГИНАЦИЯ ---
function updatePaginationUI() {
    const totalPages = Math.ceil(state.processedData.length / state.pagination.perPage) || 1;
    const info = document.getElementById('page-info');
    if (info) info.textContent = `Page ${state.pagination.current} / ${totalPages}`;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (state.pagination.current > 1) {
                state.pagination.current--;
                renderTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (state.pagination.current < totalPages) {
                state.pagination.current++;
                renderTable();
            }
        };
    }
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---
function setupEventListeners() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.oninput = (e) => {
            state.filters.search = e.target.value;
            applyFiltersAndSort();
        };
    }
    
    document.querySelectorAll('.sortable').forEach(th => {
        th.onclick = () => {
            const key = th.id.replace('-header', '');
            state.currentSort.order = (state.currentSort.key === key && state.currentSort.order === 'desc') ? 'asc' : 'desc';
            state.currentSort.key = key;
            applyFiltersAndSort();
        };
    });

    // Закрытие модалки
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('card-modal').style.display = 'none';
        };
    }
}

// Функция для модального окна (Open Mint Modal) 
// должна содержать вашу логику отрисовки Canvas из предыдущих версий.
function openMintModal(username) {
    const modal = document.getElementById('card-modal');
    if (modal) modal.style.display = 'block';
    console.log("Opening modal for:", username);
    // Здесь ваша логика Canvas Draw...
}

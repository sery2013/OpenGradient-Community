// --- КОНФИГУРАЦИЯ ---
const CONTRACT_ADDRESS = "0x30412DD5eAf58a8491b2f728140dEb3CDCF83C26";
const CONTRACT_ABI = [
    "function mintCard(address to, string username, uint256 posts, uint256 likes, uint256 retweets, uint256 comments, uint256 views, string imageData) payable",
    "function cards(uint256 tokenId) view returns (address, string, uint256, uint256, uint256, uint256, uint256, string, uint256)",
    "function balanceOf(address owner) view returns (uint256)"
];

let state = {
    rawData: [], allTweets: [], processedData: [],
    currentSort: { key: 'posts', order: 'desc' },
    pagination: { current: 1, perPage: 15 },
    filters: { search: '', time: 'all' }
};

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    setupTabs(); // Исправляем работу вкладок
});

async function loadData() {
    try {
        const [lbRes, twRes] = await Promise.all([fetch("leaderboard.json"), fetch("all_tweets.json")]);
        state.rawData = await lbRes.json();
        state.allTweets = await twRes.json();
        applyFiltersAndSort();
    } catch (e) { console.error("Load error:", e); }
}

// --- ТАБЫ (ГАЛЕРЕЯ) ---
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');

            tab.classList.add('active');
            // Маппинг для ID
            const contentId = target === 'leaderboard' ? 'leaderboard-wrapper' : `tab-${target}`;
            const targetContent = document.getElementById(contentId);
            if (targetContent) targetContent.style.display = 'block';

            if (target === 'nft-gallery') loadNFTGallery();
        };
    });
}

// --- ПАГИНАЦИЯ (ИСПРАВЛЕНО) ---
function setupPagination() {
    const totalPages = Math.ceil(state.processedData.length / state.pagination.perPage);
    document.getElementById('page-info').textContent = `Page ${state.pagination.current} / ${totalPages}`;

    document.getElementById('prev-page').onclick = () => {
        if (state.pagination.current > 1) {
            state.pagination.current--;
            renderTable();
            updatePaginationUI();
        }
    };

    document.getElementById('next-page').onclick = () => {
        if (state.pagination.current < totalPages) {
            state.pagination.current++;
            renderTable();
            updatePaginationUI();
        }
    };
}

function updatePaginationUI() {
    const totalPages = Math.ceil(state.processedData.length / state.pagination.perPage);
    document.getElementById('page-info').textContent = `Page ${state.pagination.current} / ${totalPages}`;
}

// --- ТАБЛИЦА И ТВИТЫ ---
function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    const start = (state.pagination.current - 1) * state.pagination.perPage;
    const pageData = state.processedData.slice(start, start + state.pagination.perPage);

    tbody.innerHTML = pageData.map(user => `
        <tr class="main-row" onclick="toggleUserTweets('${user.username}', this)">
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="user-link">@${user.username}</span>
                    <button class="generate-card-btn" onclick="event.stopPropagation(); openMintModal('${user.username}')">🎴 Card</button>
                </div>
            </td>
            <td>${user.posts}</td>
            <td>${user.likes}</td>
            <td>${user.retweets || 0}</td>
            <td>${user.comments || 0}</td>
            <td>${user.views || 0}</td>
        </tr>
        <tr id="tweets-${user.username.replace(/[^a-zA-Z0-9]/g, '')}" class="tweets-row" style="display:none;">
            <td colspan="6"><div class="tweets-container">Loading tweets...</div></td>
        </tr>
    `).join('');
    setupPagination();
}

function toggleUserTweets(username, row) {
    const safeId = username.replace(/[^a-zA-Z0-9]/g, '');
    const tweetRow = document.getElementById(`tweets-${safeId}`);
    
    if (tweetRow.style.display === 'table-row') {
        tweetRow.style.display = 'none';
    } else {
        // Закрываем другие открытые строки
        document.querySelectorAll('.tweets-row').forEach(r => r.style.display = 'none');
        tweetRow.style.display = 'table-row';
        
        const container = tweetRow.querySelector('.tweets-container');
        const userTweets = state.allTweets.filter(t => 
            (t.user?.screen_name || t.username || "").toLowerCase().replace('@','') === username.toLowerCase().replace('@','')
        ).slice(0, 5); // Показываем последние 5

        container.innerHTML = userTweets.length ? userTweets.map(t => `
            <div class="tweet-item">
                <p>${t.text || t.full_text}</p>
                <a href="https://twitter.com/any/status/${t.id_str || t.tweet_id}" target="_blank">View on X</a>
            </div>
        `).join('') : "No tweets found.";
    }
}

// --- ОСТАЛЬНАЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ---
function applyFiltersAndSort() {
    let filtered = Array.isArray(state.rawData) ? [...state.rawData] : Object.entries(state.rawData).map(([u, s]) => ({ username: u, ...s }));
    if (state.filters.search) filtered = filtered.filter(u => u.username.toLowerCase().includes(state.filters.search.toLowerCase()));
    
    filtered.sort((a, b) => {
        const valA = a[state.currentSort.key] || 0;
        const valB = b[state.currentSort.key] || 0;
        return state.currentSort.order === 'desc' ? valB - valA : valA - valB;
    });
    state.processedData = filtered;
    renderAll();
}

function renderAll() {
    renderTable();
    updateDashboardStats();
}

function updateDashboardStats() {
    const totalPosts = state.processedData.reduce((s, i) => s + (i.posts || 0), 0);
    const totalViews = state.processedData.reduce((s, i) => s + (i.views || 0), 0);
    document.getElementById("total-posts").textContent = totalPosts.toLocaleString();
    document.getElementById("total-users").textContent = state.processedData.length;
    document.getElementById("total-views").textContent = totalViews.toLocaleString();
}

function setupEventListeners() {
    document.getElementById('search').oninput = (e) => {
        state.filters.search = e.target.value;
        state.pagination.current = 1;
        applyFiltersAndSort();
    };
    document.querySelectorAll('.sortable').forEach(h => {
        h.onclick = () => {
            const key = h.id.replace('-header', '').replace('-col', '');
            state.currentSort.order = (state.currentSort.key === key && state.currentSort.order === 'desc') ? 'asc' : 'desc';
            state.currentSort.key = key;
            applyFiltersAndSort();
        };
    });
}

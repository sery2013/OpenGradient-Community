let state = {
    rawData: [], allTweets: [], processedData: [],
    currentSort: { key: 'posts', order: 'desc' },
    pagination: { current: 1, perPage: 15 },
    filters: { search: '', time: 'all' }
};

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    try {
        const [lbRes, twRes] = await Promise.all([
            fetch("leaderboard.json").then(r => r.json()),
            fetch("all_tweets.json").then(r => r.json())
        ]);
        state.rawData = lbRes;
        state.allTweets = twRes;
        
        setupEventListeners();
        setupTabs();
        applyFiltersAndSort();
    } catch (e) {
        console.error("Ошибка инициализации:", e);
    }
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            const contentId = target === 'leaderboard' ? 'leaderboard-wrapper' : `tab-${target}`;
            document.getElementById(contentId).style.display = 'block';
        };
    });
}

function applyFiltersAndSort() {
    let data = Array.isArray(state.rawData) ? [...state.rawData] : Object.entries(state.rawData).map(([u, s]) => ({ username: u, ...s }));

    // Поиск
    if (state.filters.search) {
        data = data.filter(u => u.username.toLowerCase().includes(state.filters.search.toLowerCase()));
    }

    // Сортировка
    data.sort((a, b) => {
        const valA = Number(a[state.currentSort.key] || 0);
        const valB = Number(b[state.currentSort.key] || 0);
        return state.currentSort.order === 'desc' ? valB - valA : valA - valB;
    });

    state.processedData = data;
    state.pagination.current = 1;
    renderAll();
}

function renderAll() {
    updateStats();
    renderTable();
}

function updateStats() {
    const totals = state.processedData.reduce((acc, curr) => {
        acc.p += Number(curr.posts || 0);
        acc.v += Number(curr.views || 0);
        return acc;
    }, { p: 0, v: 0 });

    document.getElementById("total-posts-val").textContent = totals.p.toLocaleString();
    document.getElementById("total-users-val").textContent = state.processedData.length.toLocaleString();
    document.getElementById("total-views-val").textContent = totals.v.toLocaleString();
}

function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    const start = (state.pagination.current - 1) * state.pagination.perPage;
    const pageData = state.processedData.slice(start, start + state.pagination.perPage);

    tbody.innerHTML = pageData.map(user => `
        <tr class="main-row" onclick="toggleTweets('${user.username}', this)">
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:var(--accent); font-weight:bold;">@${user.username}</span>
                    <button class="generate-card-btn" onclick="event.stopPropagation(); openMintModal('${user.username}')">🎴 Card</button>
                </div>
            </td>
            <td>${Number(user.posts).toLocaleString()}</td>
            <td>${Number(user.likes).toLocaleString()}</td>
            <td>${Number(user.retweets || 0).toLocaleString()}</td>
            <td>${Number(user.comments || 0).toLocaleString()}</td>
            <td>${Number(user.views || 0).toLocaleString()}</td>
        </tr>
        <tr id="tweets-${user.username.replace(/[^a-z0-9]/gi,'')}" class="tweets-row" style="display:none;">
            <td colspan="6"><div class="tweets-container">Загрузка твитов...</div></td>
        </tr>
    `).join('');
    
    updatePaginationUI();
}

function toggleTweets(username, row) {
    const safeId = `tweets-${username.replace(/[^a-z0-9]/gi,'')}`;
    const targetRow = document.getElementById(safeId);
    
    if (targetRow.style.display === 'table-row') {
        targetRow.style.display = 'none';
    } else {
        document.querySelectorAll('.tweets-row').forEach(r => r.style.display = 'none');
        targetRow.style.display = 'table-row';
        
        const container = targetRow.querySelector('.tweets-container');
        const userTweets = state.allTweets.filter(t => 
            (t.username || t.user?.screen_name || "").toLowerCase().replace('@','') === username.toLowerCase().replace('@','')
        ).slice(0, 5);

        container.innerHTML = userTweets.length ? userTweets.map(t => `
            <div class="tweet-item">
                <p>${t.text || t.full_text || "Текст отсутствует"}</p>
                <a href="https://twitter.com/i/status/${t.id_str || t.tweet_id}" target="_blank">Открыть в X →</a>
            </div>
        `).join('') : "Твиты не найдены в базе.";
    }
}

function updatePaginationUI() {
    const totalPages = Math.ceil(state.processedData.length / state.pagination.perPage) || 1;
    document.getElementById('page-info').textContent = `Page ${state.pagination.current} / ${totalPages}`;
    
    document.getElementById('prev-page').onclick = () => {
        if (state.pagination.current > 1) { state.pagination.current--; renderTable(); }
    };
    document.getElementById('next-page').onclick = () => {
        const max = Math.ceil(state.processedData.length / state.pagination.perPage);
        if (state.pagination.current < max) { state.pagination.current++; renderTable(); }
    };
}

function setupEventListeners() {
    document.getElementById('search').oninput = (e) => {
        state.filters.search = e.target.value;
        applyFiltersAndSort();
    };
    
    document.querySelectorAll('.sortable').forEach(th => {
        th.onclick = () => {
            const key = th.id.replace('-header', '');
            state.currentSort.order = (state.currentSort.key === key && state.currentSort.order === 'desc') ? 'asc' : 'desc';
            state.currentSort.key = key;
            applyFiltersAndSort();
        };
    });

    document.querySelector('.close-modal').onclick = () => {
        document.getElementById('card-modal').style.display = 'none';
    };
}

// Функцию отрисовки NFT (openMintModal) оставь из предыдущего кода, она работает корректно.

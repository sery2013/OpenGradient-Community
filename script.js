// === ПОДДЕРЖКА КОНТРАКТА И ГЛОБАЛЬНЫЕ НАСТРОЙКИ ===
const CONTRACT_ADDRESS = "0x30412DD5eAf58a8491b2f728140dEb3CDCF83C26";
const CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"string","name":"username","type":"string"},{"internalType":"uint256","name":"posts","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"},{"internalType":"uint256","name":"retweets","type":"uint256"},{"internalType":"uint256","name":"comments","type":"uint256"},{"internalType":"uint256","name":"views","type":"uint256"},{"internalType":"string","name":"imageData","type":"string"}],"name":"mintCard","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"cards","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"}];

let rawData = [], data = [], allTweets = [], sortKey = "posts", sortOrder = "desc", currentPage = 1, timeFilter = "all";
const perPage = 15;

// === ИНИЦИАЛИЗАЦИЯ И ЗАГРУЗКА ===
const provider = () => new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");

async function loadApp() {
    try {
        const [lbRes, twRes] = await Promise.all([fetch("leaderboard.json"), fetch("all_tweets.json")]);
        rawData = await lbRes.json();
        allTweets = await twRes.json();
        updateDisplay();
        setupTabs();
    } catch (e) { console.error("Load failed", e); }
}

function updateDisplay() {
    normalizeData(rawData);
    data.sort((a, b) => sortOrder === "asc" ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
    renderTable();
    updateTotals();
}

// === ОБРАБОТКА ДАННЫХ ===
function normalizeData(json) {
    const getVal = (o, k) => o[k] ?? o[k + " "] ?? 0;
    const entries = Array.isArray(json) ? (Array.isArray(json[0]) ? json : json.map(i => [i.username || i.user, i])) : Object.entries(json);
    
    data = entries.map(([name, stats]) => {
        let base = { 
            username: name, 
            posts: Number(getVal(stats, "posts")), 
            likes: Number(getVal(stats, "likes")), 
            retweets: Number(getVal(stats, "retweets")), 
            comments: Number(getVal(stats, "comments")), 
            views: Number(getVal(stats, "views")) 
        };
        if (timeFilter === "all") return base;
        
        const filtered = allTweets.filter(t => (t.user?.screen_name || t.username || "").toLowerCase().replace(/^@/,'') === name.toLowerCase().replace(/^@/,''));
        const days = Number(timeFilter);
        const now = new Date();
        
        return filtered.reduce((acc, t) => {
            const diff = (now - new Date(t.created_at || t.tweet_created_at)) / 864e5;
            if (diff <= days) {
                acc.posts++;
                acc.likes += (t.favorite_count || 0);
                acc.views += (t.views_count || 0);
            }
            return acc;
        }, { ...base, posts: 0, likes: 0, retweets: 0, comments: 0, views: 0 });
    });
}

function updateTotals() {
    const sum = (k) => data.reduce((s, i) => s + (i[k] || 0), 0);
    document.getElementById("total-posts").textContent = `Total Posts: ${sum('posts')}`;
    document.getElementById("total-users").textContent = `Total Users: ${data.length}`;
    document.getElementById("total-views").textContent = `Total Views: ${sum('views')}`;
}

// === UI: ТАБЛИЦА И ПАГИНАЦИЯ ===
function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    const query = document.getElementById("search").value.toLowerCase();
    const filtered = data.filter(i => i.username.toLowerCase().includes(query));
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    
    tbody.innerHTML = filtered.slice((currentPage - 1) * perPage, currentPage * perPage).map(s => `
        <tr onclick="toggleTweetsRow(this, '${s.username}')">
            <td><div style="display:flex;align-items:center;gap:8px;">
                <span>${s.username}</span>
                <button class="generate-card-btn" onclick="event.stopPropagation(); showCardModal('${s.username}')">🎴 Card</button>
            </div></td>
            ${['posts','likes','retweets','comments','views'].map(k => `<td>${s[k]}</td>`).join('')}
        </tr>`).join('');
    
    document.getElementById("page-info").textContent = `Page ${currentPage} / ${totalPages}`;
    updateArrows();
}

function updateArrows() {
    document.querySelectorAll(".sort-arrow").forEach(el => el.textContent = "");
    const header = document.getElementById(`${sortKey}-header`) || document.getElementById(`${sortKey}-col-header`);
    if (header) {
        header.querySelector(".sort-arrow").textContent = sortOrder === "asc" ? "▲" : "▼";
        document.querySelectorAll("thead th").forEach(th => th.classList.toggle("active", th === header));
    }
}

// === NFT КАРТОЧКА (CANVAS) ===
async function generateCardCanvas(username, stats) {
    const canvas = document.getElementById('user-canvas');
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 675;
    
    // Фон и Рамка
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f1f1f'); grad.addColorStop(1, '#0d1a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = '#6fe3d166'; ctx.lineWidth = 4;
    ctx.strokeRect(12,12,W-24,H-24);

    // Текст
    ctx.fillStyle = '#fff'; ctx.font = 'bold 48px Segoe UI';
    ctx.fillText(`@${username}`, 210, 120);
    
    // Метрики (Цикл вместо дублирования)
    const metrics = [
        { l: 'Posts', v: stats.posts, i: '📝' }, { l: 'Likes', v: stats.likes, i: '❤️' },
        { l: 'Retweets', v: stats.retweets, i: '🔁' }, { l: 'Comments', v: stats.comments, i: '💬' },
        { l: 'Views', v: stats.views, i: '👁️' }
    ];
    
    metrics.forEach((m, i) => {
        const x = 60 + i * 225;
        ctx.fillStyle = '#ffffff0a';
        ctx.fillRect(x, 220, 210, 160);
        ctx.fillStyle = '#6fe3d1'; ctx.textAlign = 'center';
        ctx.font = 'bold 36px Segoe UI';
        ctx.fillText(m.v.toLocaleString(), x + 105, 320);
        ctx.font = '22px Segoe UI'; ctx.fillStyle = '#a9ddd3';
        ctx.fillText(`${m.i} ${m.l}`, x + 105, 265);
    });

    document.getElementById('btn-download').onclick = () => {
        const a = document.createElement('a');
        a.download = `${username}_card.png`;
        a.href = canvas.toDataURL();
        a.click();
    };
}

// === NFT МИНТ ===
async function mintCardNFT() {
    const status = document.getElementById('mint-status');
    if (!window.ethereum) return status.textContent = '❌ Install MetaMask';
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const iface = new ethers.Interface(CONTRACT_ABI);
        const txData = iface.encodeFunctionData('mintCard', [accounts[0], data.username, data.posts, data.likes, data.retweets, data.comments, data.views, ""]);
        
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{ from: accounts[0], to: CONTRACT_ADDRESS, data: txData, value: '0x5AF3107A4000', chainId: '0x7BB' }]
        });
        status.textContent = '✅ Minted! Hash: ' + txHash.slice(0,10);
    } catch (e) { status.textContent = '❌ Error: ' + e.message; }
}

// === СОБЫТИЯ ===
document.getElementById("search").oninput = () => { currentPage = 1; renderTable(); };
document.getElementById("time-select").onchange = (e) => { timeFilter = e.target.value; currentPage = 1; updateDisplay(); };
['posts','likes','retweets','comments','views'].forEach(k => {
    const el = document.getElementById(k === "views" ? "views-col-header" : k+"-header");
    if (el) el.onclick = () => {
        sortOrder = (sortKey === k && sortOrder === "desc") ? "asc" : "desc";
        sortKey = k;
        updateDisplay();
    };
});

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab === 'leaderboard' ? 'leaderboard-wrapper' : `tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active'), target.style.display = 'block';
            if (btn.dataset.tab === 'nft-gallery') loadNFTGallery();
        };
    });
}

// Запуск
loadApp();

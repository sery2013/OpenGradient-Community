// === 🔥 FIX: ОТКЛЮЧАЕМ ENS В ETHERS V6 ДЛЯ КАСТОМНЫХ СЕТЕЙ ===
try {
  if (typeof ethers !== 'undefined' && ethers.Provider) {
    ethers.Provider.prototype.getResolver = async () => null;
    ethers.Provider.prototype.resolveName = async () => null;
  }
} catch (e) { console.warn('ENS patch skipped', e); }

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let rawData = [];
let data = [];
let allTweets = [];
let sortKey = "posts";
let sortOrder = "desc";
let currentPage = 1;
const perPage = 15;
let timeFilter = "all";
let analyticsChart = null;
let analyticsPeriod = "all";
let analyticsHourFilter = "all";
let currentLang = 'en';

// === NFT MINT: ГЛОБАЛЬНЫЕ НАСТРОЙКИ ===
const CONTRACT_ADDRESS = "0x30412DD5eAf58a8491b2f728140dEb3CDCF83C26";
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "username",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "posts",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "retweets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "comments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "likes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "views",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "imageData",
        "type": "string"
      }
    ],
    "name": "mintCard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider = null;
let signer = null;
let contract = null;
let currentCardData = null;

// === ИНИЦИАЛИЗАЦИЯ БЛОКЧЕЙНА ===
async function initBlockchain() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log("✅ Blockchain connected");
    } catch (err) {
      console.error("❌ Blockchain init failed:", err);
    }
  } else {
    console.warn("⚠️ Ethereum wallet not detected");
  }
}

// === ЗАГРУЗКА ДАННЫХ ===
async function fetchData() {
  try {
    const res = await fetch('leaderboard.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rawData = await res.json();
    normalizeData();
    renderTable();
    loadNFTGallery();
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard:", err);
    document.getElementById('leaderboard-body').innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;">⚠️ Data not loaded. Check leaderboard.json</td></tr>';
  }
}

function normalizeData() {
  data = rawData.map((item, idx) => ({
    rank: idx + 1,
    username: item.username || '',
    name: item.name || '',
    avatar: item.avatar || '',
    posts: parseInt(item.posts) || 0,
    retweets: parseInt(item.retweets) || 0,
    comments: parseInt(item.comments) || 0,
    likes: parseInt(item.likes) || 0,
    views: parseInt(item.views) || 0,
    tweets: item.tweets || [],
    total: (item.posts || 0) + (item.retweets || 0) + (item.comments || 0) + (item.likes || 0)
  }));
}

// === РЕНДЕР ТАБЛИЦЫ ===
function renderTable() {
  const tbody = document.getElementById('leaderboard-body');
  const filtered = data.filter(u => {
    if (!u.username) return false;
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    return q === '' ||
      u.username.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageData = sorted.slice(start, end);

  tbody.innerHTML = '';
  pageData.forEach((user, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="user-cell">
        <div class="avatar-circle">${user.username.charAt(0).toUpperCase()}</div>
        <span>${user.username}</span>
      </td>
      <td>${user.posts}</td>
      <td>${user.retweets}</td>
      <td>${user.comments}</td>
      <td>${user.likes}</td>
      <td>${user.views}</td>
      <td>
        <button class="generate-btn" data-username="${user.username}" data-stats='${JSON.stringify(user)}'>
          GENERATE
        </button>
      </td>
    `;
    tbody.appendChild(row);

    // Обработчик Generate
    row.querySelector('.generate-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const username = e.target.dataset.username;
      const stats = JSON.parse(e.target.dataset.stats);
      await showCardModal(username, stats);
    });

    // Обработчик клика по строке — показ постов
    row.addEventListener('click', () => toggleTweetsRow(user));
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  document.getElementById('pagination').innerHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>← Prev</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next →</button>
  `;
}

function changePage(page) {
  currentPage = page;
  renderTable();
}

// === АККОРДЕОН ПОСТОВ ===
function toggleTweetsRow(user) {
  const row = document.querySelector(`tr:has(.avatar-circle:contains('${user.username.charAt(0).toUpperCase()}'))`);
  if (!row) return;

  const existing = row.nextElementSibling;
  if (existing && existing.classList.contains('tweets-row')) {
    existing.remove();
    return;
  }

  const tweetsDiv = document.createElement('tr');
  tweetsDiv.className = 'tweets-row';
  tweetsDiv.innerHTML = `
    <td colspan="7" class="tweets-container">
      <div class="tweets-list">
        ${user.tweets.slice(0, 5).map(t => `
          <div class="tweet-item">
            <div class="tweet-text">${t.text}</div>
            <div class="tweet-meta">
              <span>${t.created_at}</span> • ${t.replies} replies • ${t.retweets} RTs • ${t.likes} likes
            </div>
          </div>
        `).join('')}
        ${user.tweets.length > 5 ? `<div class="see-more">+ ${user.tweets.length - 5} more</div>` : ''}
      </div>
    </td>
  `;
  row.after(tweetsDiv);
}

// === МОДАЛЬНОЕ ОКНО КАРТОЧКИ ===
async function showCardModal(username, stats) {
  currentCardData = { username, stats };
  const modal = document.getElementById('card-modal');
  const canvas = document.getElementById('user-canvas');
  modal.style.display = 'flex';

  // Генерируем карточку 1200×675
  await generateCardCanvas(username, stats);

  // Кнопки
  document.getElementById('btn-download')?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `ritual_card_${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, { once: true });

  document.getElementById('btn-mint')?.addEventListener('click', async () => {
    await mintCardNFT(username, stats);
  }, { once: true });
}

// === ГЕНЕРАЦИЯ КАРТОЧКИ (1200×675) ===
async function generateCardCanvas(username, stats) {
  console.log("🎨 Generating card for:", username, stats);
  const canvas = document.getElementById('user-canvas');
  if (!canvas) {
    console.error("❌ Canvas not found!");
    return;
  }
  const ctx = canvas.getContext('2d');
  const W = 1200, H = 675;
  canvas.width = W;
  canvas.height = H;

  // 1. Фон (градиент)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a0f16');
  grad.addColorStop(0.5, '#111a24');
  grad.addColorStop(1, '#0a0f16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Логотип (Ritual)
  const logoUrl = 'https://ritual.net/favicon.ico';
  const logoImg = new Image();
  logoImg.crossOrigin = 'anonymous';
  logoImg.src = logoUrl;
  await new Promise(resolve => {
    logoImg.onload = resolve;
    logoImg.onerror = () => {
      console.warn("⚠️ Logo failed to load, using fallback");
      resolve();
    };
  });
  ctx.drawImage(logoImg, 60, 60, 48, 48);

  // 3. Заголовок
  ctx.font = 'bold 48px Inter, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('RITUAL COMMUNITY', 120, 90);
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.fillStyle = '#6fe3d1';
  ctx.fillText('LEADERBOARD', 120, 125);

  // 4. Аватар пользователя
  const avatarImg = new Image();
  avatarImg.crossOrigin = 'anonymous';
  avatarImg.src = stats.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6fe3d1&color=0a0f16&size=200`;
  await new Promise(resolve => {
    avatarImg.onload = resolve;
    avatarImg.onerror = () => {
      console.warn("⚠️ Avatar failed, using fallback");
      resolve();
    };
  });
  ctx.beginPath();
  ctx.arc(100, 220, 80, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatarImg, 20, 140, 160, 160);
  ctx.restore();

  // 5. Имя и ник
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText(stats.name || username, 200, 210);
  ctx.font = 'normal 28px Inter, sans-serif';
  ctx.fillStyle = '#a9ddd3';
  ctx.fillText(`@${username}`, 200, 250);

  // 6. Метрики — 2 ряда по 3
  const metrics = [
    { label: 'POSTS', value: stats.posts, color: '#6fe3d1' },
    { label: 'RETWEETS', value: stats.retweets, color: '#a9ddd3' },
    { label: 'COMMENTS', value: stats.comments, color: '#6fe3d1' },
    { label: 'LIKES', value: stats.likes, color: '#a9ddd3' },
    { label: 'VIEWS', value: stats.views, color: '#6fe3d1' },
    { label: 'TOTAL', value: stats.total, color: '#a9ddd3' }
  ];

  const cellW = (W - 240) / 3;
  const cellH = 100;
  const startY = 320;

  metrics.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 200 + col * cellW;
    const y = startY + row * cellH;

    // Бокс
    ctx.fillStyle = 'rgba(17, 26, 36, 0.7)';
    ctx.fillRect(x, y, cellW - 20, cellH - 20);
    ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, cellW - 20, cellH - 20);

    // Разделитель сверху
    if (i === 0 || i === 3) {
      ctx.strokeStyle = 'rgba(111, 227, 209, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + cellW - 20, y - 10);
      ctx.stroke();
    }

    // Текст
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = m.color;
    ctx.textAlign = 'center';
    ctx.fillText(m.label, x + (cellW - 20) / 2, y + 30);

    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(m.value.toLocaleString(), x + (cellW - 20) / 2, y + 70);
  });

  // 7. Нижняя разделительная линия
  ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(200, H - 100);
  ctx.lineTo(W - 200, H - 100);
  ctx.stroke();

  // 8. Футер
  ctx.font = 'normal 20px Inter, sans-serif';
  ctx.fillStyle = '#a9ddd3';
  ctx.textAlign = 'center';
  ctx.fillText('Generated on Ritual Testnet • ritual.net', W / 2, H - 50);

  // 9. Подпись
  ctx.font = 'italic 18px Inter, sans-serif';
  ctx.fillStyle = '#6fe3d1';
  ctx.fillText(`#RITUALIST ${stats.rank}`, W / 2, H - 20);
}

// === MINT NFT ===
async function mintCardNFT(username, stats) {
  const btn = document.getElementById('btn-mint');
  const status = document.getElementById('mint-status');
  btn.disabled = true;
  status.textContent = '⏳ Signing transaction...';

  try {
    if (!contract) {
      await initBlockchain();
      if (!contract) throw new Error('Contract not initialized');
    }

    // ⚠️ ВАЖНО: НЕ отправляем imageData в блокчейн — только метаданные
    const imageData = ''; // пустая строка — чтобы не было Payload Too Large

    const tx = await contract.mintCard(
      signer.address,
      username,
      stats.posts,
      stats.retweets,
      stats.comments,
      stats.likes,
      stats.views,
      imageData,
      { value: ethers.parseEther('0.001') }
    );

    status.textContent = '⏳ Waiting for confirmation...';
    const receipt = await tx.wait();
    status.textContent = '✅ Minted! Token ID: ' + receipt.logs.find(l => l.topics[0] === '0x...' /* event Transfer */)?.topics[3]?.toString(16) || 'unknown';

    // Обновляем галерею
    setTimeout(loadNFTGallery, 2000);

  } catch (err) {
    console.error("❌ Mint error:", err);
    status.textContent = `❌ ${err.message || 'Unknown error'}`;
    if (err.code === 4001) status.textContent = '❌ User rejected request';
  } finally {
    btn.disabled = false;
  }
}

// === ГАЛЕРЕЯ NFT ===
async function loadNFTGallery() {
  const gallery = document.getElementById('nft-gallery');
  if (!gallery) return;

  try {
    const balance = await contract.balanceOf(signer.address);
    gallery.innerHTML = `<p>Loading ${balance.toString()} NFTs...</p>`;
    if (balance === 0) {
      gallery.innerHTML = '<p>No NFTs minted yet. Generate and mint a card!</p>';
      return;
    }

    const items = [];
    for (let i = 0; i < balance; i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(signer.address, i);
        const uri = await contract.tokenURI(tokenId);
        // URI может быть IPFS или JSON — упростим: генерируем превью из статистики
        const preview = generatePreviewImage(tokenId, usernameFromTokenId(tokenId));
        items.push(`<div class="nft-card"><img src="${preview}" alt="Card ${tokenId}"><div class="nft-info"><h4>#${tokenId}</h4><p>by @${usernameFromTokenId(tokenId)}</p></div></div>`);
      } catch (e) {
        console.warn("Skip token", i, e);
      }
    }
    gallery.innerHTML = items.join('');
  } catch (err) {
    console.error("Gallery load failed:", err);
    gallery.innerHTML = `<p>❌ Gallery error: ${err.message}</p>`;
  }
}

function usernameFromTokenId(id) {
  // Заглушка — в реальности читаем из URI
  return `user${id % 1000}`;
}

function generatePreviewImage(tokenId, username) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const W = 400, H = 225;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = '#0a0f16';
  ctx.fillRect(0, 0, W, H);

  ctx.font = 'bold 24px Inter';
  ctx.fillStyle = '#6fe3d1';
  ctx.textAlign = 'center';
  ctx.fillText('RITUAL CARD', W / 2, 40);

  ctx.font = 'bold 18px Inter';
  ctx.fillStyle = '#fff';
  ctx.fillText(`@${username}`, W / 2, 80);

  ctx.font = 'bold 32px Inter';
  ctx.fillStyle = '#a9ddd3';
  ctx.fillText(`#${tokenId}`, W / 2, 140);

  return canvas.toDataURL('image/png');
}

// === АНАЛИТИКА ===
async function renderAnalytics() {
  if (!analyticsChart) {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    analyticsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Posts',
          data: [12, 19, 3, 5, 2, 3, 10],
          backgroundColor: 'rgba(111, 227, 209, 0.6)',
          borderColor: '#6fe3d1',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

// === ВКЛАДКИ ===
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', async () => {
  await initBlockchain();
  fetchData();
  setupTabs();

  // Поиск
  document.getElementById('search-input')?.addEventListener('input', renderTable);
  document.getElementById('search-btn')?.addEventListener('click', renderTable);

  // Переключение времени (заглушка)
  document.getElementById('time-filter')?.addEventListener('change', () => {
    timeFilter = document.getElementById('time-filter').value;
    renderTable();
  });
});

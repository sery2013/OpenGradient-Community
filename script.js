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
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
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
        "name": "likes",
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
    "name": "cards",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
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
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
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
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];
let currentCardData = { username: "", stats: {}, imageData: "" };

// === NFT MINT: ПОДПИСЬ И ОТПРАВКА ЧЕРЕЗ window.ethereum ===
async function mintCardNFT() {
  const status = document.getElementById('mint-status');
  const btn = document.getElementById('btn-mint');

  if (!window.ethereum) {
    status.textContent = '❌ Установи MetaMask или Rabby';
    return;
  }

  btn.disabled = true;
  status.textContent = '⏳ Подготовка...';

  try {
    // Переключаем сеть
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7BB' }]
    });

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Кодируем вызов
    const iface = new ethers.Interface(CONTRACT_ABI);
    const callData = iface.encodeFunctionData('mintCard', [
      address,
      currentCardData.username,
      BigInt(currentCardData.stats.posts || 0),
      BigInt(currentCardData.stats.likes || 0),
      BigInt(currentCardData.stats.retweets || 0),
      BigInt(currentCardData.stats.comments || 0),
      BigInt(currentCardData.stats.views || 0),
      "" // Пустая строка — чтобы избежать Payload Too Large
    ]);

    // Получаем параметры
    const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");
    const nonce = await provider.getTransactionCount(address, "pending");
    const gasPrice = await provider.getGasPrice();

    // Формируем транзакцию (Legacy)
    const tx = {
      to: CONTRACT_ADDRESS,
      data: callData,
      value: ethers.parseEther("0.0001"),
      gasLimit: 800000,
      gasPrice: gasPrice,
      nonce: nonce,
      type: 0,
      chainId: 1979
    };

    status.textContent = '🔐 Подписываю...';
    const signedTx = await new ethers.Wallet(privateKey, provider).signTransaction(tx);

    status.textContent = '📤 Отправляю...';
    const txResponse = await provider.broadcastTransaction(signedTx);
    const txHash = txResponse.hash;

    status.textContent = `⛓️ ${txHash.slice(0, 6)}...`;
    const receipt = await txResponse.wait();

    if (receipt && receipt.status === 1) {
      status.textContent = '✅ NFT успешно заминчен!';
      status.style.color = '#4ade80';
      if (typeof loadNFTGallery === 'function') {
        localStorage.removeItem('ritual_nft_gallery');
        loadNFTGallery();
      }
    } else {
      status.textContent = '❌ Reverted';
    }

  } catch (err) {
    console.error('Mint error:', err);
    status.textContent = err.message.includes('transaction type not supported')
      ? '❌ Сеть не поддерживает формат. Попробуйте позже.'
      : `❌ ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

// === NFT GALLERY ===
async function loadNFTGallery() {
  const grid = document.getElementById('nft-gallery-grid');
  if (!grid) return;
  grid.innerHTML = '<p class="gallery-loading">⏳ Загрузка данных...</p>';

  try {
    const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const latestBlock = await provider.getBlockNumber();
    const fromBlock = latestBlock > 95000 ? latestBlock - 95000 : 0;
    const filter = contract.filters.Transfer(null, null);
    const events = await contract.queryFilter(filter, fromBlock, "latest");

    const nfts = [];
    const seenIds = new Set();
    for (const event of events) {
      const tokenId = event.args.tokenId.toString();
      if (seenIds.has(tokenId)) continue;
      seenIds.add(tokenId);
      try {
        const card = await contract.cards(tokenId);
        nfts.push({
          tokenId,
          username: card.username,
          posts: card.posts.toString(),
          likes: card.likes.toString(),
          retweets: card.retweets.toString(),
          comments: card.comments.toString(),
          views: card.views.toString(),
          imageData: card.imageData,
          mintedAt: card.mintedAt.toString(),
          owner: event.args.to
        });
      } catch (e) {
        console.warn(`Failed to fetch token ${tokenId}`, e);
      }
    }

    nfts.sort((a, b) => Number(b.mintedAt) - Number(a.mintedAt));
    localStorage.setItem('ritual_nft_gallery', JSON.stringify({ nfts, timestamp: Date.now() }));
    renderNFTCards(nfts);
  } catch (err) {
    console.error("Gallery load error:", err);
    grid.innerHTML = `<p class="gallery-error">❌ Ошибка: ${err.message}</p>`;
  }
}

function renderNFTCards(nfts) {
  const grid = document.getElementById('nft-gallery-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (nfts.length === 0) {
    grid.innerHTML = '<p class="gallery-empty">🎨 Пока нет заминченных NFT. Будьте первым!</p>';
    return;
  }

  nfts.forEach(nft => {
    const card = document.createElement('div');
    card.className = 'nft-gallery-card';

    // Генерируем превью из статистики (т.к. imageData пустой)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 225;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 400, 225);
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(1, "#1e293b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 225);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Arial";
    ctx.fillText("RITUAL", 200, 40);
    ctx.fillStyle = "#6fe3d1";
    ctx.font = "bold 18px Arial";
    ctx.fillText("@" + nft.username, 200, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.fillText("📝 Posts: " + nft.posts, 50, 110);
    ctx.fillText("❤️ Likes: " + nft.likes, 50, 140);
    ctx.fillText("👁️ Views: " + nft.views, 50, 170);
    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";
    ctx.fillText("Generated Preview", 200, 210);
    const previewImg = canvas.toDataURL('image/png');

    card.innerHTML = `
      <img src="${previewImg}" alt="Card ${nft.username}" loading="lazy">
      <div class="nft-info">
        <h4>@${nft.username}</h4>
        <p>Token ID: #${nft.tokenId}</p>
        <div class="nft-stats">
          <span>📝 ${nft.posts}</span>
          <span>❤️ ${nft.likes}</span>
          <span>👁️ ${nft.views}</span>
        </div>
        <a href="https://explorer.ritualfoundation.org/token/${CONTRACT_ADDRESS}/instance/${nft.tokenId}" target="_blank" class="nft-explorer-link">
          🔍 View on Explorer
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// === ОСТАЛЬНОЙ КОД (без изменений) ===
async function fetchData() {
  try {
    const res = await fetch("leaderboard.json");
    rawData = await res.json();
    normalizeData(rawData);
    sortData();
    renderTable();
    updateArrows();
    updateTotals();
  } catch (e) { console.error("Fetch leaderboard:", e); }
}

async function fetchTweets() {
  try {
    const res = await fetch("all_tweets.json");
    allTweets = await res.json();
    if (!Array.isArray(allTweets)) allTweets = [];
    if (typeof renderAnalytics === 'function') renderAnalytics();
  } catch (e) { console.error("Fetch tweets:", e); }
}

fetchTweets().then(fetchData);
setInterval(() => { fetchTweets(); fetchData(); }, 3600000);

function normalizeData(json) {
  data = [];
  const getVal = (obj, key) => {
    return obj[key] || obj[key + " "] || Object.values(obj).find(v => typeof v === 'number' && String(key).toLowerCase().includes(String(v).toLowerCase())) || 0;
  };

  if (Array.isArray(json)) {
    data = json.map(item => {
      let username = item.username || item.user?.screen_name || item.name || "";
      if (typeof username === 'object') username = Object.values(username)[0] || "";
      username = String(username).replace(/^@/, "");
      return {
        username,
        posts: Number(getVal(item, "posts") || item.tweets || 0),
        likes: Number(getVal(item, "likes") || item.favorite_count || 0),
        retweets: Number(getVal(item, "retweets") || item.retweet_count || 0),
        comments: Number(getVal(item, "comments") || item.reply_count || 0),
        views: Number(getVal(item, "views") || item.views_count || 0)
      };
    });
  }
  data = data.filter(u => u.username);
}

function renderTable() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";
  const filtered = filterData();
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  pageData.forEach(stats => {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameSpan = document.createElement("span");
    nameSpan.textContent = `@${stats.username}`;
    nameSpan.style.fontWeight = "600";

    const btn = document.createElement("button");
    btn.className = "generate-btn";
    btn.textContent = '🎴 Generate Card';
    btn.onclick = () => showCardModal(stats.username);

    nameCell.appendChild(nameSpan);
    nameCell.appendChild(btn);
    tr.appendChild(nameCell);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.posts}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.likes}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.retweets}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.comments}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.views}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td></td>`); // Actions
    tbody.appendChild(tr);
  });

  document.getElementById("page-info").textContent = `Page ${currentPage} / ${totalPages}`;
  addUserClickHandlers();
}

function filterData() {
  const q = document.getElementById("search").value.toLowerCase();
  return data.filter(u => u.username.toLowerCase().includes(q));
}

function sortData() {
  data.sort((a, b) => {
    const va = Number(a[sortKey] || 0);
    const vb = Number(b[sortKey] || 0);
    return sortOrder === "asc" ? va - vb : vb - va;
  });
}

function updateTotals() {
  const totalPosts = data.reduce((s, u) => s + u.posts, 0);
  const totalViews = data.reduce((s, u) => s + u.views, 0);
  document.getElementById("total-posts").textContent = `Posts: ${totalPosts}`;
  document.getElementById("total-users").textContent = `Users: ${data.length}`;
  document.getElementById("total-views").textContent = `Views: ${totalViews}`;
}

function addUserClickHandlers() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", (e) => {
      if (e.target.closest('.generate-btn')) return;
      const username = tr.children[0].querySelector('span')?.textContent?.replace('@', '') || '';
      toggleTweetsRow(tr, username);
    });
  });
}

function toggleTweetsRow(tr, username) {
  const next = tr.nextElementSibling;
  if (next && next.classList.contains('tweets-row')) {
    next.remove();
    tr.classList.remove('active-row');
    return;
  }

  document.querySelectorAll(".tweets-row").forEach(r => r.remove());
  document.querySelectorAll("tr").forEach(r => r.classList.remove("active-row"));
  tr.classList.add("active-row");

  const row = document.createElement("tr");
  row.className = "tweets-row";
  const td = document.createElement("td");
  td.colSpan = 7;
  td.style.padding = "20px";
  td.style.background = "linear-gradient(135deg, #1a2a3a, #0d1725)";

  const userTweets = allTweets.filter(tweet => {
    const uname = (tweet.user?.screen_name || tweet.user?.name || tweet.username || '').toLowerCase().replace(/^@/, '');
    return uname === username.toLowerCase();
  });

  if (userTweets.length === 0) {
    td.innerHTML = "<p style='color:#a9ddd3;text-align:center;'>No tweets found for this user.</p>";
  } else {
    const container = document.createElement("div");
    container.className = "tweet-container";
    userTweets.slice(0, 6).forEach(tweet => {
      const content = tweet.text || tweet.full_text || "(no content)";
      const url = tweet.url || `https://twitter.com/${username}/status/${tweet.id_str}`;
      const date = new Date(tweet.created_at || tweet.tweet_created_at).toLocaleDateString();

      const card = document.createElement("div");
      card.className = "tweet-card";
      card.innerHTML = `
        <a href="${url}" target="_blank">${content}</a>
        ${tweet.extended_entities?.media?.[0]?.media_url_https ? `<img src="${tweet.extended_entities.media[0].media_url_https}">` : ''}
        <div class="tweet-date">${date}</div>
      `;
      container.appendChild(card);
    });
    td.appendChild(container);
  }
  row.appendChild(td);
  tr.parentNode.insertBefore(row, tr.nextElementSibling);
}

function showCardModal(username) {
  const user = data.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return;
  currentCardData = { username, stats: user };
  generateCardCanvas(username, user);
  document.getElementById('card-modal').style.display = 'flex';
  document.getElementById('mint-status').textContent = '';
}

function closeCardModal() {
  document.getElementById('card-modal').style.display = 'none';
}

async function generateCardCanvas(username, stats) {
  const canvas = document.getElementById('user-canvas');
  const ctx = canvas.getContext('2d');
  const W = 1200, H = 675;
  canvas.width = W;
  canvas.height = H;

  // Фон
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0f1f1f');
  grad.addColorStop(0.5, '#1a3333');
  grad.addColorStop(1, '#0d1a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Рамка
  ctx.strokeStyle = 'rgba(111, 227, 209, 0.4)';
  ctx.lineWidth = 4;
  ctx.roundRect(12, 12, W - 24, H - 24, 20);
  ctx.stroke();

  // Аватар
  const avatarUrl = await fetchAvatarUrl(username);
  if (avatarUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl;
    await new Promise(r => img.onload = r);
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 130, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 60, 70, 120, 120);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(120, 130, 60, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#6fe3d1';
    ctx.stroke();
  }

  // Никнейм
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Segoe UI, sans-serif';
  ctx.fillText(`@${username}`, 210, 120);
  ctx.fillStyle = '#6fe3d1';
  ctx.font = '24px Segoe UI, sans-serif';
  ctx.fillText('USER TWEET STATISTICS', 210, 155);

  // Разделитель
  ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 185);
  ctx.lineTo(W - 40, 185);
  ctx.stroke();

  // Метрики
  const metrics = [
    { label: 'Posts', val: stats.posts || 0, icon: '📝' },
    { label: 'Likes', val: stats.likes || 0, icon: '❤️' },
    { label: 'Retweets', val: stats.retweets || 0, icon: '🔁' },
    { label: 'Comments', val: stats.comments || 0, icon: '💬' },
    { label: 'Views', val: stats.views || 0, icon: '👁️' }
  ];

  const cellW = (W - 120) / 5;
  const cellH = 160;
  const startY = 220;

  metrics.forEach((m, i) => {
    const x = 60 + i * cellW;
    const y = startY;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.roundRect(x, y, cellW - 12, cellH, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(111, 227, 209, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.roundRect(x, y, cellW - 12, cellH, 12);
    ctx.stroke();
    ctx.fillStyle = '#a9ddd3';
    ctx.font = '22px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${m.icon} ${m.label}`, x + (cellW - 12) / 2, y + 45);
    ctx.fillStyle = '#6fe3d1';
    ctx.font = 'bold 36px Segoe UI, sans-serif';
    ctx.fillText(Number(m.val).toLocaleString(), x + (cellW - 12) / 2, y + 100);
  });

  // Футер
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '20px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MINTED ON RITUAL TESTNET', W / 2, H - 60);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = '16px Segoe UI, sans-serif';
  ctx.fillText('Generated ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), W / 2, H - 35);

  currentCardData.imageData = canvas.toDataURL('image/png').split(',')[1];

  document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `card_${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
}

async function fetchAvatarUrl(username) {
  const clean = username.toLowerCase();
  const tweet = allTweets.find(t =>
    (t.user?.screen_name || t.user?.name || '').toLowerCase().replace(/^@/, '') === clean
  );
  return tweet?.user?.profile_image_url_https || null;
}

// === TABS ===
document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = btn.id.replace('-btn', '');
    if (tab === 'leaderboard') document.getElementById('leaderboard-wrapper').classList.add('active');
    if (tab === 'analytics') document.getElementById('tab-analytics').classList.add('active');
    if (tab === 'gallery') document.getElementById('tab-nft-gallery').classList.add('active');
  });
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-mint').onclick = mintCardNFT;
});

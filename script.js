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

// === NFT CONTRACT ===
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
  }
];
let currentCardData = { username: "", stats: {}, imageData: "" };

// === FETCH DATA ===
async function fetchData() {
  try {
    const res = await fetch("leaderboard.json");
    rawData = await res.json();
    normalizeData(rawData);
    sortData();
    renderTable();
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

// === NORMALIZE ===
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

// === RENDER TABLE ===
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
    btn.className = "generate-card-btn";
    btn.textContent = "GENERATE";
    btn.onclick = () => showCardModal(stats.username);

    nameCell.appendChild(nameSpan);
    nameCell.appendChild(btn);
    tr.appendChild(nameCell);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.posts}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.likes}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.retweets}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.comments}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${stats.views}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td></td>`); // empty for card
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

// === USER CLICK → TWEETS ===
function addUserClickHandlers() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", (e) => {
      if (e.target.closest('.generate-card-btn')) return;
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

  const userTweets = allTweets.filter(t => {
    const uname = (t.user?.screen_name || t.user?.name || t.username || '').toLowerCase().replace(/^@/, '');
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

// === CARD MODAL ===
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

  // Background
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0a0f16');
  grad.addColorStop(1, '#121a24');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border
  ctx.strokeStyle = 'rgba(111, 227, 209, 0.4)';
  ctx.lineWidth = 2;
  ctx.roundRect(20, 20, W - 40, H - 40, 16);
  ctx.stroke();

  // Avatar
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

  // Username & Title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Segoe UI, sans-serif';
  ctx.fillText(`@${username}`, 210, 120);
  ctx.fillStyle = '#6fe3d1';
  ctx.font = '24px Segoe UI, sans-serif';
  ctx.fillText('USER TWEET STATISTICS', 210, 155);

  // Divider
  ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 185);
  ctx.lineTo(W - 40, 185);
  ctx.stroke();

  // Metrics
  const metrics = [
    { label: 'Posts', val: stats.posts, icon: '📝' },
    { label: 'Likes', val: stats.likes, icon: '❤️' },
    { label: 'Retweets', val: stats.retweets, icon: '🔁' },
    { label: 'Comments', val: stats.comments, icon: '💬' },
    { label: 'Views', val: stats.views, icon: '👁️' }
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
    ctx.lineWidth = 1;
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

  // Footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '20px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MINTED ON RITUAL TESTNET', W / 2, H - 60);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.font = '16px Segoe UI, sans-serif';
  ctx.fillText('Generated ' + new Date().toLocaleDateString(), W / 2, H - 35);

  currentCardData.imageData = canvas.toDataURL('image/png').split(',')[1];

  // Download
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

// === NFT MINT (Legacy TX) ===
async function mintCardNFT() {
  const status = document.getElementById('mint-status');
  const btn = document.getElementById('btn-mint');

  if (!window.ethereum) {
    status.textContent = '❌ Install MetaMask or Rabby';
    return;
  }

  btn.disabled = true;
  status.textContent = '⏳ Preparing...';

  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x7BB' }] });
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    const iface = new ethers.Interface(CONTRACT_ABI);
    const callData = iface.encodeFunctionData('mintCard', [
      address,
      currentCardData.username,
      BigInt(currentCardData.stats.posts || 0),
      BigInt(currentCardData.stats.likes || 0),
      BigInt(currentCardData.stats.retweets || 0),
      BigInt(currentCardData.stats.comments || 0),
      BigInt(currentCardData.stats.views || 0),
      ""
    ]);

    const [gasPriceHex, nonceHex] = await Promise.all([
      fetch("https://rpc.ritualfoundation.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_gasPrice", params: [] })
      }).then(r => r.json()).then(r => r.result),
      fetch("https://rpc.ritualfoundation.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "eth_getTransactionCount", params: [address, "pending"] })
      }).then(r => r.json()).then(r => r.result)
    ]);

    const txParams = {
      from: address,
      to: CONTRACT_ADDRESS,
      data: callData,
      value: ethers.toBeHex(ethers.parseEther("0.0001")),
      gasPrice: gasPriceHex,
      gas: "0xC3500", // 800000
      nonce: ethers.toBeHex(parseInt(nonceHex, 16)),
      type: '0x0',
      chainId: '0x7BB'
    };

    status.textContent = '🔐 Signing...';
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    });

    status.textContent = `⛓️ ${txHash.slice(0, 6)}...`;
    const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");
    const receipt = await provider.waitForTransaction(txHash);

    if (receipt.status === 1) {
      status.textContent = '✅ Minted!';
      status.style.color = '#4ade80';
      setTimeout(() => loadNFTGallery(), 2000);
    } else {
      status.textContent = '❌ Reverted';
    }

  } catch (err) {
    console.error(err);
    status.textContent = err.message.includes('transaction type not supported') 
      ? '❌ Network does not support Legacy TX. Try again later.' 
      : `❌ ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

document.getElementById('btn-mint').onclick = mintCardNFT;

// === TABS ===
document.querySelectorAll('.btn-outline').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = btn.textContent.trim().toLowerCase();
    if (tab === 'leaderboard') document.getElementById('leaderboard-wrapper').classList.add('active');
    if (tab === 'analytics') document.getElementById('tab-analytics').classList.add('active');
    if (tab === 'gallery') document.getElementById('tab-nft-gallery').classList.add('active');
  });
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-download').onclick = () => {};
});

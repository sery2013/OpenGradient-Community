// === 🔥 FIX: ОТКЛЮЧАЕМ ENS В ETHERS V6 ДЛЯ КАСТОМНЫХ СЕТЕЙ ===
try {
    if (typeof ethers !== 'undefined' && ethers.Provider) {
        ethers.Provider.prototype.getResolver = async () => null;
        ethers.Provider.prototype.resolveName = async () => null;
    }
} catch(e) { console.warn('ENS patch skipped', e); }
// ============================================================

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

// === NFT MINT: ФИНАЛЬНАЯ ВЕРСИЯ (Legacy TX через window.ethereum.request) ===
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
        // 1. Переключаем сеть на CratD2C Testnet (Chain ID: 1979)
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainIdHex, 16);
        if (currentChainId !== 1979) {
            status.textContent = '🔄 Переключаю на CratD2C Testnet...';
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7BB' }]
            });
        }

        // 2. Получаем адрес пользователя
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // 3. Кодируем вызов контракта (используем ethers ТОЛЬКО для этого)
        const iface = new ethers.Interface(CONTRACT_ABI);
        const callData = iface.encodeFunctionData('mintCard', [
            address,
            currentCardData.username,
            BigInt(currentCardData.stats.posts || 0),
            BigInt(currentCardData.stats.likes || 0),
            BigInt(currentCardData.stats.retweets || 0),
            BigInt(currentCardData.stats.comments || 0),
            BigInt(currentCardData.stats.views || 0),
            "" // Пустая строка для imageData (контракт должен это принимать)
        ]);

        // 4. Получаем параметры транзакции напрямую через RPC Ritual
        status.textContent = '🔍 Получаю gasPrice и nonce...';

        const [gasPriceHex, nonceHex] = await Promise.all([
            fetch("https://rpc.ritualfoundation.org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "eth_gasPrice",
                    params: []
                })
            }).then(r => r.json()).then(r => {
                if (r.error) throw new Error(`RPC Error (gasPrice): ${r.error.message}`);
                return r.result;
            }),
            fetch("https://rpc.ritualfoundation.org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 2,
                    method: "eth_getTransactionCount",
                    params: [address, "pending"]
                })
            }).then(r => r.json()).then(r => {
                if (r.error) throw new Error(`RPC Error (nonce): ${r.error.message}`);
                return r.result;
            })
        ]);

        const gasPrice = BigInt(gasPriceHex);
        const nonce = parseInt(nonceHex, 16);

        // 5. Оцениваем gas (если не получается — используем фиксированное значение)
        let estimatedGas = 800000n; // 800k gas по умолчанию
        try {
            const estimationResult = await fetch("https://rpc.ritualfoundation.org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 3,
                    method: "eth_estimateGas",
                    params: [{
                        from: address,
                        to: CONTRACT_ADDRESS,
                         callData,
                        value: ethers.toBeHex(ethers.parseEther("0.0001"))
                    }]
                })
            }).then(r => r.json());

            if (!estimationResult.error) {
                estimatedGas = BigInt(estimationResult.result);
                // Добавим 20% запаса
                estimatedGas = estimatedGas + (estimatedGas / 5n);
            }
        } catch (e) {
            console.warn("Gas estimation failed, using default:", e);
        }

        // 6. ФОРМИРУЕМ ПАРАМЕТРЫ ТРАНЗАКЦИИ ВРУЧНУЮ
        // ВАЖНО: ЯВНО указываем type: '0x0' для Legacy
        const txParams = {
            from: address,
            to: CONTRACT_ADDRESS,
             callData,
            value: ethers.toBeHex(ethers.parseEther("0.0001")), // 0.0001 CRAT
            gasPrice: gasPriceHex, // Используем полученный gasPrice
            gas: ethers.toBeHex(estimatedGas), // Используем оценку
            nonce: ethers.toBeHex(nonce), // Используем полученный nonce
            type: '0x0', // 🔥 КРИТИЧЕСКИ ВАЖНО: Legacy тип
            chainId: '0x7BB' // Chain ID Ritual
        };

        status.textContent = '🔐 Подтверждаю транзакцию в кошельке...';

        // 7. Отправляем транзакцию через window.ethereum.request
        // Это заставит кошелёк сформировать и подписать чистую Legacy транзакцию.
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
        });

        status.textContent = `⛓️ Транзакция отправлена: ${txHash.slice(0, 6)}...`;
        status.style.color = '#fbbf24';

        // 8. Ждём подтверждения
        const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");
        const receipt = await provider.waitForTransaction(txHash);

        if (receipt && receipt.status === 1) {
            status.textContent = '✅ NFT успешно заминчен!';
            status.style.color = '#4ade80';
            // Обновляем галерею
            if (typeof loadNFTGallery === 'function') {
                localStorage.removeItem('ritual_nft_gallery');
                loadNFTGallery();
            }
        } else {
            status.textContent = '❌ Транзакция не удалась (reverted)';
            status.style.color = '#ef4444';
        }

    } catch (err) {
        console.error('Mint error (Final Legacy):', err);
        if (err.code === 4001) {
            status.textContent = '❌ Пользователь отменил транзакцию';
        } else if (err.message?.includes('insufficient funds')) {
            status.textContent = '❌ Недостаточно CRAT для газа или цены минта';
        } else if (err.message?.includes('transaction type not supported')) {
            status.textContent = '❌ Сеть Ritual отклоняет транзакцию. Проверьте, что в кошельке выбрана сеть CratD2C (Chain ID: 1979).';
        } else if (err.message?.includes('Payload Too Large')) {
            status.textContent = '❌ Ошибка сети: слишком большой запрос. Попробуйте ещё раз.';
        } else {
            status.textContent = `❌ Ошибка: ${err.message || 'Неизвестная ошибка'}`;
        }
        status.style.color = '#ef4444';
    } finally {
        btn.disabled = false;
    }
}

// === NFT GALLERY: ЗАГРУЗКА С ОГРАНИЧЕНИЕМ ДИАПАЗОНА БЛОКОВ ===
async function loadNFTGallery() {
    const grid = document.getElementById('nft-gallery-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="gallery-loading">⏳ Загрузка данных из Ritual Testnet...</p>';

    const cached = localStorage.getItem('ritual_nft_gallery');
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
            renderNFTCards(data);
            return;
        }
    }

    try {
        const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");

        if (!CONTRACT_ABI || CONTRACT_ABI.length === 0 || CONTRACT_ABI[0]?.inputs === undefined) {
            throw new Error("❌ ABI контракта не найден или пуст. Проверь CONTRACT_ABI в script.js.");
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // --- ИСПРАВЛЕНИЕ: Ограничиваем диапазон поиска ---
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock > 95000 ? latestBlock - 95000 : 0; // Запрашиваем последние 100к блоков

        const filter = contract.filters.Transfer(null, null);
        const events = await contract.queryFilter(filter, fromBlock, "latest");
        // ---

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
                    imageData: card.imageData, // Тут пока пусто (см. минт)
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
        grid.innerHTML = `<p class="gallery-error">❌ Ошибка загрузки. Проверьте консоль или попробуйте позже.<br><small>${err.message}</small></p>`;
    }
}

// === NFT GALLERY: РЕНДЕР КАРТОЧЕК (с генерацией превью) ===
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

        // 🔥 ГЕНЕРИРУЕМ КАРТИНКУ ИЗ СТАТИСТИКИ (т.к. imageData пустая)
        const canvas = document.createElement('canvas');
        canvas.width = 400; // Уменьшенный размер для галереи
        canvas.height = 225;
        const ctx = canvas.getContext('2d');

        // Фон
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(1, "#1e293b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Логотип (условный прямоугольник)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("RITUAL", canvas.width / 2, 40);

        // Username
        ctx.fillStyle = "#6fe3d1";
        ctx.font = "bold 18px Arial";
        ctx.fillText("@" + nft.username, canvas.width / 2, 70);

        // Метрики
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";
        ctx.fillText("📝 Posts: " + nft.posts, 50, 110);
        ctx.fillText("❤️ Likes: " + nft.likes, 50, 140);
        ctx.fillText("👁️ Views: " + nft.views, 50, 170);

        // Подпись
        ctx.fillStyle = "#888";
        ctx.font = "12px Arial";
        ctx.fillText("Generated Preview", canvas.width / 2, 210);

        // Преобразуем в data URL
        const previewImageSrc = canvas.toDataURL('image/png');

        card.innerHTML = `
            <img src="${previewImageSrc}" alt="Card ${nft.username}" loading="lazy">
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

// === ОСТАЛЬНОЙ КОД (все остальные функции остаются без изменений) ===
// ... (fetchData, fetchTweets, normalizeData, renderTable, generateCardCanvas, и т.д.) ...

// - Fetch leaderboard data -
async function fetchData() {
    try {
        const response = await fetch("leaderboard.json");
        const json = await response.json();
        rawData = json;
        normalizeData(rawData);
        sortData();
        renderTable();
        updateArrows();
        updateTotals();
    } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
    }
}

// - Fetch all tweets -
async function fetchTweets() {
    try {
        const response = await fetch("all_tweets.json");
        const json = await response.json();
        if (Array.isArray(json)) {
            allTweets = json;
        } else if (json && typeof json === "object") {
            if (Array.isArray(json.tweets)) {
                allTweets = json.tweets;
            } else if (Array.isArray(json.data)) {
                allTweets = json.data;
            } else {
                allTweets = [json];
            }
        } else {
            allTweets = [];
        }
        if (typeof renderAnalytics === "function") renderAnalytics();
    } catch (err) {
        console.error("Failed to fetch all tweets:", err);
        allTweets = [];
    }
}

fetchTweets().then(() => fetchData());
setInterval(() => { fetchTweets(); fetchData(); }, 3600000);

// - Normalize leaderboard data -
function normalizeData(json) {
    data = [];
    const getVal = (obj, key) => {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
        if (obj[key + " "] !== undefined && obj[key + " "] !== null) return obj[key + " "];
        for (let k in obj) {
            if (k && k.trim() === key && obj[k] !== undefined && obj[k] !== null) {
                return obj[k];
            }
        }
        return 0;
    };

    if (Array.isArray(json) && json.length > 0 && !Array.isArray(json[0])) {
        data = json.map(item => extractBaseStatsFromItem(item, getVal));
    } else if (Array.isArray(json) && json.length > 0 && Array.isArray(json[0])) {
        data = json.map(([name, stats]) => {
            const base = extractBaseStatsFromItem(stats || {}, getVal);
            base.username = name || base.username || "";
            return applyTimeFilterIfNeeded(base);
        });
    } else if (json && typeof json === "object") {
        data = Object.entries(json).map(([name, stats]) => {
            const base = extractBaseStatsFromItem(stats || {}, getVal);
            base.username = name || base.username || "";
            return applyTimeFilterIfNeeded(base);
        });
    }
    data = data.map(d => applyTimeFilterIfNeeded(d));

    function extractBaseStatsFromItem(item, getVal) {
        const username = item.username || item.user || item.name || item.screen_name || "";
        const posts = Number(getVal(item, "posts") || item.tweets || 0);
        const likes = Number(getVal(item, "likes") || item.favorite_count || 0);
        const retweets = Number(getVal(item, "retweets") || item.retweet_count || 0);
        const comments = Number(getVal(item, "comments") || item.reply_count || 0);
        const views = Number(getVal(item, "views") || item.views_count || 0);
        return { username, posts, likes, retweets, comments, views };
    }

    function applyTimeFilterIfNeeded(base) {
        if (!base || !base.username) return base;
        if (timeFilter === "all") return base;
        const days = Number(timeFilter);
        if (!days || days <= 0) return base;
        const now = new Date();
        const uname = String(base.username).toLowerCase().replace(/^@/, "");
        const userTweets = allTweets.filter(t => {
            const candidate = (t.user && (t.user.screen_name || t.user.name)) || "";
            return String(candidate).toLowerCase().replace(/^@/, "") === uname;
        });
        let posts = 0, likes = 0, retweets = 0, comments = 0, views = 0;
        userTweets.forEach(tweet => {
            const created = tweet.tweet_created_at || tweet.created_at || tweet.created || null;
            if (!created) return;
            const tweetDate = new Date(created);
            if (isNaN(tweetDate)) return;
            const diffDays = (now - tweetDate) / (1000 * 60 * 60 * 24);
            if (diffDays <= days) {
                posts += 1;
                likes += Number(tweet.favorite_count || 0);
                retweets += Number(tweet.retweet_count || 0);
                comments += Number(tweet.reply_count || 0);
                views += Number(tweet.views_count || 0);
            }
        });
        return { username: base.username, posts, likes, retweets, comments, views };
    }
}

// - Update totals -
function updateTotals() {
    const totalPosts = data.reduce((sum, s) => sum + (Number(s.posts) || 0), 0);
    const totalViews = data.reduce((sum, s) => sum + (Number(s.views) || 0), 0);
    document.getElementById("total-posts").textContent = `Posts: ${totalPosts}`;
    document.getElementById("total-users").textContent = `Users: ${data.length}`;
    document.getElementById("total-views").textContent = `Views: ${totalViews}`;
}

// - Sort, Filter, Render -
function sortData() {
    data.sort((a, b) => {
        const valA = Number(a[sortKey] || 0);
        const valB = Number(b[sortKey] || 0);
        return sortOrder === "asc" ? valA - valB : valB - valA;
    });
}

function filterData() {
    const query = document.getElementById("search").value.toLowerCase();
    return data.filter(item => (item.username || "").toLowerCase().includes(query));
}

// === NFT CARD: ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ===
function showCardModal(username) {
    const user = data.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return;
    currentCardData = { username, stats: user };
    generateCardCanvas(username, user);
    const modal = document.getElementById('card-modal');
    if (modal) modal.style.display = 'flex';
    document.getElementById('card-modal-title').textContent = `@${username} Card`;
    document.getElementById('mint-status').textContent = '';
    document.getElementById('btn-mint').disabled = false;
}

function closeCardModal() {
    document.getElementById('card-modal').style.display = 'none';
}

// === NFT CARD: ГЕНЕРАЦИЯ CANVAS (1200x675 - Twitter Format) ===
async function generateCardCanvas(username, stats) {
    const canvas = document.getElementById('user-canvas');
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 675;
    canvas.width = W;
    canvas.height = H;

    // 1. Фон (градиент)
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f1f1f');
    grad.addColorStop(0.5, '#1a3333');
    grad.addColorStop(1, '#0d1a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Внешняя рамка
    ctx.strokeStyle = 'rgba(111, 227, 209, 0.4)';
    ctx.lineWidth = 4;
    ctx.roundRect(12, 12, W - 24, H - 24, 20);
    ctx.stroke();

    // Внутренняя тонкая рамка
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.roundRect(20, 20, W - 40, H - 40, 16);
    ctx.stroke();

    // 3. Аватар (круглый, с обводкой)
    const avatarUrl = await fetchAvatarUrl(username);
    if (avatarUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = avatarUrl;
        await new Promise(res => { img.onload = res; img.onerror = res; });
        ctx.shadowColor = 'rgba(111, 227, 209, 0.4)';
        ctx.shadowBlur = 20;
        ctx.save();
        ctx.beginPath();
        ctx.arc(120, 130, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 60, 70, 120, 120);
        ctx.restore();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(120, 130, 60, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#6fe3d1';
        ctx.stroke();
    }

    // 4. Никнейм и подзаголовок
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Segoe UI, sans-serif';
    ctx.fillText(`@${username}`, 210, 120);
    ctx.fillStyle = '#6fe3d1';
    ctx.font = '24px Segoe UI, sans-serif';
    ctx.fillText('USER TWEET STATISTICS', 210, 155);

    // 5. Разделительная линия под шапкой
    ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 185);
    ctx.lineTo(W - 40, 185);
    ctx.stroke();

    // 6. Метрики в рамках/ячейках
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
        // Фон ячейки
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.roundRect(x, y, cellW - 12, cellH, 12);
        ctx.fill();
        // Рамка ячейки
        ctx.strokeStyle = 'rgba(111, 227, 209, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.roundRect(x, y, cellW - 12, cellH, 12);
        ctx.stroke();
        // Иконка и название
        ctx.fillStyle = '#a9ddd3';
        ctx.font = '22px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.icon} ${m.label}`, x + (cellW - 12) / 2, y + 45);
        // Значение
        ctx.fillStyle = '#6fe3d1';
        ctx.font = 'bold 36px Segoe UI, sans-serif';
        ctx.fillText(Number(m.val).toLocaleString(), x + (cellW - 12) / 2, y + 100);
    });

    ctx.textAlign = 'left';

    // === ЛОГОТИП И ТЕКСТ ===
    try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = 'https://i.postimg.cc/prn7dJ1c/Gemini-Generated-Image-nq0xe5nq0xe5nq0x-(1).png';
        
        console.log('🔄 Загрузка логотипа...');
        
        // Ждём загрузки
        await Promise.race([
            new Promise((resolve, reject) => {
                logoImg.onload = () => {
                    console.log('✅ Логотип загружен:', logoImg.width, 'x', logoImg.height);
                    resolve();
                };
                logoImg.onerror = (e) => {
                    console.error('❌ Ошибка загрузки логотипа:', e);
                    reject(new Error('Logo failed to load'));
                };
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        // Рисуем логотип если загрузился
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
            const logoSize = 55;  // Размер 45x45 пикселей
            const logoX = (W / 2) - 350;  // СДВИНУЛ ЛЕВЕЕ (было -180, стало -220)
            const logoY = H - 176;  // ПОДНЯЛ ВЫШЕ (было -175, стало -180)
            
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            console.log('🎨 Логотип нарисован на позиции:', logoX, logoY);
        }
        
    } catch (e) {
        console.error('❌ Ошибка при загрузке логотипа:', e.message);
    }

    // Текст (рисуем ВСЕГДА)
    ctx.fillStyle = '#6fe3d1';
    ctx.font = 'bold 40px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TWITTER RITUAL COMMUNITY', W / 2, H - 135);  // ОПУСТИЛ НИЖЕ (было -145, стало -135)
    ctx.textAlign = 'left';
    // === КОНЕЦ ЛОГОТИПА ===

    // 7. Нижняя разделительная линия
    ctx.strokeStyle = 'rgba(111, 227, 209, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, H - 100);
    ctx.lineTo(W - 40, H - 100);
    ctx.stroke();

    // 8. Футер (рисуем ВСЕГДА)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '20px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MINTED ON RITUAL TESTNET', W / 2, H - 60);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText('Generated ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), W / 2, H - 35);

    currentCardData.imageData = canvas.toDataURL('image/png').split(',')[1];

    // Кнопка Download
    document.getElementById('btn-download').onclick = () => {
        const link = document.createElement('a');
        link.download = `card_${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
}

async function fetchAvatarUrl(username) {
    const clean = username.replace(/^@/, '').toLowerCase();
    const tweet = allTweets.find(t =>
        (t.user?.screen_name || t.user?.name || '').toLowerCase().replace(/^@/, '') === clean
    );
    return tweet?.user?.profile_image_url_https || null;
}

// - Render Table with Generate Card Button -
function renderTable() {
    const tbody = document.getElementById("leaderboard-body");
    tbody.innerHTML = "";
    const filtered = filterData();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageData = filtered.slice(start, start + perPage);
    pageData.forEach(stats => {
        const name = stats.username || "";
        const tr = document.createElement("tr");
        const nameCell = document.createElement("td");
        const nameContainer = document.createElement("div");
        nameContainer.style.display = "flex";
        nameContainer.style.alignItems = "center";
        nameContainer.style.gap = "8px";
        const nameSpan = document.createElement("span");
        nameSpan.textContent = escapeHtml(name);
        
        // Кнопка Generate Card
        const cardBtn = document.createElement("button");
        cardBtn.className = 'generate-card-btn';
        cardBtn.textContent = '🎴 Generate Card';
        cardBtn.title = currentLang === 'en' ? `Generate NFT card for ${escapeHtml(name)}` : `Сгенерировать NFT карточку для ${escapeHtml(name)}`;
        cardBtn.onclick = function(e) {
            e.stopPropagation();
            showCardModal(name);
        };
        
        nameContainer.appendChild(nameSpan);
        nameContainer.appendChild(cardBtn);
        nameCell.appendChild(nameContainer);
        tr.appendChild(nameCell);
        tr.insertAdjacentHTML('beforeend', `<td>${Number(stats.posts || 0)}</td>`);
        tr.insertAdjacentHTML('beforeend', `<td>${Number(stats.retweets || 0)}</td>`);
        tr.insertAdjacentHTML('beforeend', `<td>${Number(stats.comments || 0)}</td>`);
        tr.insertAdjacentHTML('beforeend', `<td>${Number(stats.likes || 0)}</td>`);
        tr.insertAdjacentHTML('beforeend', `<td>${Number(stats.views || 0)}</td>`);
        tbody.appendChild(tr);
    });
    document.getElementById("page-info").textContent = `Page ${currentPage} / ${totalPages}`;
    addUserClickHandlers();
}

// - Escaping HTML -
function escapeHtml(str) {
    const stringified = String(str || '');
    return stringified
        .replace(/&/g, "&amp;")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// - Sorting headers -
function updateSort(key) {
    if (sortKey === key) sortOrder = sortOrder === "asc" ? "desc" : "asc";
    else { sortKey = key; sortOrder = "desc"; }
    sortData();
    renderTable();
    updateArrows();
}

function updateArrows() {
    document.querySelectorAll(".sort-arrow").forEach(el => el.textContent = "");
    const active = document.querySelector(`#${sortKey}-header .sort-arrow`) || document.querySelector(`#${sortKey}-col-header .sort-arrow`);
    if (active) active.textContent = sortOrder === "asc" ? "▲" : "▼";
    document.querySelectorAll("thead th").forEach(th => th.classList.remove("active"));
    const headerId = sortKey + (["views", "retweets", "comments"].includes(sortKey) ? "-col-header" : "-header");
    const headerEl = document.getElementById(headerId);
    if (headerEl) headerEl.classList.add("active");
}

// - Pagination -
document.getElementById("prev-page").onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
document.getElementById("next-page").onclick = () => {
    const total = Math.ceil(filterData().length / perPage);
    if (currentPage < total) { currentPage++; renderTable(); }
};

// - Search -
document.getElementById("search").addEventListener("input", () => { currentPage = 1; renderTable(); });

// - Sorting headers click -
["posts", "retweets", "comments", "likes", "views"].forEach(key => {
    const el = document.getElementById(key === "views" ? "views-col-header" : key+"-header");
    if(el) el.addEventListener("click", () => updateSort(key));
});

// - Time filter -
document.getElementById("time-select").addEventListener("change", e => {
    timeFilter = e.target.value || "all";
    currentPage = 1;
    normalizeData(rawData);
    sortData();
    renderTable();
    updateTotals();
});

// - Отображение твитов при клике на пользователя -
function showTweets(username) {
    const container = document.getElementById("tweets-list");
    const title = document.getElementById("tweets-title");
    container.innerHTML = "";
    const userTweets = allTweets.filter(tweet => {
        const candidate = (tweet.user && (tweet.user.screen_name || tweet.user.name)) || "";
        return candidate.toLowerCase().replace(/^@/, "") === username.toLowerCase().replace(/^@/, "");
    });
    title.textContent = `Посты пользователя: ${username}`;
    if(userTweets.length === 0) {
        container.innerHTML = "<li>У пользователя нет постов</li>";
        return;
    }
    userTweets.forEach(tweet => {
        const li = document.createElement("li");
        const content = tweet.text || tweet.content || "(no content)";
        const url = tweet.url || (tweet.id_str ? `https://twitter.com/${username}/status/${tweet.id_str}` : "#");
        li.innerHTML = `<a href="${url}" target="_blank">${escapeHtml(content)}</a>`;
        container.appendChild(li);
    });
}

// - Добавляем обработчики клика на строки таблицы после рендера -
function addUserClickHandlers() {
    const tbody = document.getElementById("leaderboard-body");
    if (!tbody) return;
    
    tbody.querySelectorAll("tr").forEach(tr => {
        tr.addEventListener("click", (e) => {
            // Игнорируем клик на кнопке генерации карточки
            if (e.target.closest('.generate-card-btn')) return;
            
            // Получаем имя пользователя из первой ячейки
            const nameCell = tr.children[0];
            const nameSpan = nameCell.querySelector('span');
            const username = nameSpan ? nameSpan.textContent.trim() : tr.children[0].textContent.trim();
            
            toggleTweetsRow(tr, username);
        });
    });
}

// - Создание аккордеона твитов -
function toggleTweetsRow(tr, username) {
    const nextRow = tr.nextElementSibling;
    const isAlreadyOpen = nextRow && nextRow.classList.contains("tweets-row") &&
        nextRow.dataset.username === username;
    
    // Удаляем все предыдущие аккордеоны и подсветку
    document.querySelectorAll(".tweets-row").forEach(row => row.remove());
    document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("active-row"));
    
    // Если уже был открыт — просто закрываем
    if (isAlreadyOpen) return;
    
    // Подсветить текущую строку
    tr.classList.add("active-row");
    
    const tweetsRow = document.createElement("tr");
    tweetsRow.classList.add("tweets-row");
    tweetsRow.dataset.username = username;
    
    const td = document.createElement("td");
    td.colSpan = 6;
    td.style.padding = "20px";
    td.style.background = "linear-gradient(135deg, #2F4F4F, #1a2a2a)";
    
    // Очищаем имя пользователя от @ и приводим к нижнему регистру
    const cleanUsername = username.toLowerCase().replace(/^@/, '');
    
    // Фильтруем твиты пользователя из allTweets
    const userTweets = allTweets.filter(tweet => {
        const tweetUser = (tweet.user?.screen_name || tweet.user?.name || tweet.username || '').toLowerCase().replace(/^@/, '');
        return tweetUser === cleanUsername;
    });
    
    if (userTweets.length === 0) {
        td.innerHTML = "<i style='color:#a9ddd3;'>У пользователя нет постов в сообществе</i>";
    } else {
        const container = document.createElement("div");
        container.classList.add("tweet-container");
        container.style.cssText = "display:flex;flex-wrap:wrap;gap:15px;justify-content:flex-start;";
        
        // Показываем максимум 10 последних твитов
        userTweets.slice(0, 10).forEach(tweet => {
            const content = tweet.full_text || tweet.text || tweet.content || "";
            const url = tweet.url || (tweet.id_str ? `https://twitter.com/${username}/status/${tweet.id_str}` : "#");
            
            // Формат даты
            let dateRaw = tweet.created_at || tweet.tweet_created_at || "";
            let date = "";
            if (dateRaw) {
                const parsed = new Date(dateRaw);
                date = !isNaN(parsed)
                    ? parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : dateRaw.split(" ")[0];
            }
            
            // Медиа без дубликатов
            const mediaList = tweet.extended_entities?.media || tweet.entities?.media || tweet.media || [];
            const uniqueMediaUrls = [...new Set(mediaList.map(m => m.media_url_https || m.media_url).filter(Boolean))];
            let imgTag = uniqueMediaUrls.map(u => `<img src="${u}" style="max-width:100%;border-radius:8px;margin-top:10px;">`).join("");
            
            // Fallback на ссылки в тексте
            if (!imgTag) {
                const match = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)/i);
                if (match) imgTag = `<img src="${match[0]}" style="max-width:100%;border-radius:8px;margin-top:10px;">`;
            }
            
            // Создаём карточку твита
            const card = document.createElement("div");
            card.classList.add("tweet-card");
            card.style.cssText = `
                background: linear-gradient(135deg, #2F4F4F, #1a2a2a);
                border: 1px solid rgba(111, 227, 209, 0.2);
                border-radius: 12px;
                padding: 15px;
                width: 400px;
                color: #fff;
                transition: all 0.2s;
            `;
            card.onmouseenter = () => card.style.transform = 'translateY(-3px)';
            card.onmouseleave = () => card.style.transform = 'translateY(0)';
            
            const wordCount = content.trim().split(/\s+/).length;
            if (wordCount <= 3 && !imgTag) card.classList.add("short");
            
            card.innerHTML = `
                <a href="${url}" target="_blank" style="text-decoration:none; color:inherit; display:block;">
                    <p style="margin:0 0 10px 0; line-height:1.4; white-space:pre-wrap;">${escapeHtml(content)}</p>
                    ${imgTag}
                    <div style="margin-top:10px; font-size:0.85rem; color:#a9ddd3; text-align:right;">${date}</div>
                </a>
            `;
            container.appendChild(card);
        });
        td.appendChild(container);
    }
    
    tweetsRow.appendChild(td);
    tr.parentNode.insertBefore(tweetsRow, tr.nextElementSibling);
}

// - Tabs setup and Analytics rendering -
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            const lb = document.getElementById('leaderboard-wrapper');
            const an = document.getElementById('tab-analytics');
            const gallery = document.getElementById('tab-nft-gallery');
            if (tab === 'analytics') {
                if (lb) lb.style.display = 'none';
                if (an) an.style.display = 'block';
                if (gallery) gallery.style.display = 'none';
                renderAnalytics();
            } else if (tab === 'nft-gallery') {
                if (lb) lb.style.display = 'none';
                if (an) an.style.display = 'none';
                if (gallery) {
                    gallery.style.display = 'block';
                    setTimeout(loadNFTGallery, 100);
                }
            } else {
                if (lb) lb.style.display = 'block';
                if (an) an.style.display = 'none';
                if (gallery) gallery.style.display = 'none';
            }
        });
    });
}

// - Функция для отрисовки тепловой гистограммы -
function renderHeatmap(tweets) {
    const container = document.getElementById('heatmap-container');
    if (!container) return;
    const heatmap = Array(7).fill().map(() => Array(24).fill(0));
    tweets.forEach(t => {
        const created = t.tweet_created_at || t.created_at || t.created || null;
        if (!created) return;
        const d = new Date(created);
        if (isNaN(d)) return;
        const day = d.getUTCDay();
        const hour = d.getUTCHours();
        heatmap[day][hour] = (heatmap[day][hour] || 0) + 1;
    });
    const max = Math.max(...heatmap.flat());
    container.innerHTML = '';
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const count = heatmap[day][hour] || 0;
            const cell = document.createElement('div');
            cell.style.width = '100%';
            cell.style.aspectRatio = '1';
            cell.style.borderRadius = '3px';
            cell.title = `${count} tweet(s)\n${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}, ${hour}:00 UTC`;
            if (count === 0) {
                cell.style.backgroundColor = 'rgba(255,255,255,0.03)';
            } else {
                const intensity = count / (max || 1);
                const r = Math.floor(111 * intensity + 255 * (1 - intensity));
                const g = Math.floor(227 * intensity + 255 * (1 - intensity));
                const b = Math.floor(209 * intensity + 255 * (1 - intensity));
                cell.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
            container.appendChild.appendChild

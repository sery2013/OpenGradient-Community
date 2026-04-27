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
const CONTRACT_ADDRESS = "0x30412DD5eAf58a8491b2f728140dDeb3CDCF83C26";
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

// === NFT MINT: ФУНКЦИЯ (без отправки картинки) ===
async function mintCardNFT() {
    const status = document.getElementById('mint-status');
    const btn = document.getElementById('btn-mint');

    if (!window.ethereum) {
        status.textContent = '❌ Установи MetaMask';
        return;
    }

    btn.disabled = true;
    status.textContent = '⏳ Подключение к кошельку...';

    try {
        // 1. Проверяем сеть
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const currentChainId = parseInt(chainIdHex, 16);

        if (currentChainId !== 1979) {
            status.textContent = '🔄 Переключаю на Ritual Testnet...';
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x7BB' }]
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 2. Подготавливаем данные для вызова (imageData = "")
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
            "" // 🔥 ПУСТАЯ СТРОКА - чтобы избежать "Payload Too Large"
        ]);

        // 3. Формируем транзакцию (Legacy Type 0)
        const txParams = {
            from: address,
            to: CONTRACT_ADDRESS,
            data: callData,
            value: ethers.parseEther("0.0001").toString(),
            gasLimit: ethers.toQuantity(500000),
            gasPrice: ethers.toQuantity(ethers.parseUnits("1", "gwei"))
        };

        status.textContent = '🔗 Подготовка транзакции...';
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams]
        });

        status.textContent = `⛓️ Транзакция отправлена: ${txHash.slice(0, 6)}...`;
        status.style.color = '#fbbf24';

        // Ждем подтверждения
        let receipt;
        while (!receipt) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                receipt = await new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org").getTransactionReceipt(txHash);
            } catch (e) { /* ignore */ }
        }

        if (receipt.status === 1) {
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
        console.error('Mint error:', err);
        if (err.code === 4001) {
            status.textContent = '❌ Пользователь отменил транзакцию';
        } else if (err.message?.includes('insufficient funds')) {
            status.textContent = '❌ Недостаточно средств (баланс < 0.001 RITUAL)';
        } else {
            status.textContent = `❌ Ошибка: ${err.message || 'Неизвестная ошибка'}`;
        }
    } finally {
        btn.disabled = false;
    }
}

// === NFT GALLERY: ЗАГРУЗКА (с обходом лимита RPC) ===
async function loadNFTGallery() {
    const grid = document.getElementById('nft-gallery-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="gallery-loading">⏳ Загрузка данных из Ritual Testnet...</p>';

    try {
        const provider = new ethers.JsonRpcProvider("https://rpc.ritualfoundation.org");

        if (!CONTRACT_ABI || CONTRACT_ABI.length === 0 || CONTRACT_ABI[0]?.inputs === undefined) {
            throw new Error("❌ ABI контракта не найден или пуст. Проверь CONTRACT_ABI в script.js.");
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // ИСПРАВЛЕНИЕ: Ограничиваем диапазон поиска (макс 100,000 блоков)
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
                if (card.username) {
                    nfts.push({
                        tokenId,
                        username: card.username,
                        posts: card.posts.toString(),
                        likes: card.likes.toString(),
                        views: card.views.toString(),
                        imageData: "", // В блокчейне пусто (см. минт)
                        mintedAt: card.mintedAt.toString(),
                        owner: event.args.to
                    });
                }
            } catch (e) {
                console.warn("Skip token", tokenId, e);
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

// === NFT GALLERY: РЕНДЕР (с генерацией превью) ===
function renderNFTCards(nfts) {
    const grid = document.getElementById('nft-gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

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
            <div style="background: #1a2a2a; border-radius: 12px; overflow: hidden; border: 1px solid rgba(111,227,209,0.2);">
                <img src="${previewImageSrc}" alt="@${nft.username}" style="width:100%; display:block;">
                <div style="padding: 15px;">
                    <h4 style="margin:0; color:#6fe3d1;">@${nft.username}</h4>
                    <p style="font-size:12px; color:#888;">Token ID: #${nft.tokenId}</p>
                    <div style="display:flex; gap:10px; margin-top:10px; font-size:13px;">
                        <span>📝 ${nft.posts}</span>
                        <span>❤️ ${nft.likes}</span>
                        <span>👁️ ${nft.views}</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// === ГЕНЕРАЦИЯ КАРТОЧКИ (для минта и скачивания) ===
let currentCardData = null;

function generateCard(username, stats) {
    currentCardData = { username, stats };

    const modal = document.getElementById('modal');
    const canvasContainer = document.getElementById('canvas-container');
    modal.style.display = 'block';
    canvasContainer.innerHTML = '<p>🎨 Генерация карточки...</p>';

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.id = 'user-canvas';
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Фон
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(1, "#1e293b");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Логотип (условный прямоугольник)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("RITUAL", canvas.width / 2, 100);

        // Username
        ctx.fillStyle = "#6fe3d1";
        ctx.font = "bold 28px Arial";
        ctx.fillText("@" + username, canvas.width / 2, 150);

        // Метрики (рамки)
        const metrics = [
            { label: "Posts", value: stats.posts, y: 250 },
            { label: "Likes", value: stats.likes, y: 350 },
            { label: "Retweets", value: stats.retweets, y: 450 },
            { label: "Comments", value: stats.comments, y: 550 },
            { label: "Views", value: stats.views, y: 650 }
        ];

        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        ctx.textAlign = "left";

        metrics.forEach(m => {
            ctx.fillText(`${m.label}: ${m.value}`, 50, m.y);
            ctx.strokeRect(40, m.y - 25, canvas.width - 80, 40);
        });

        // Подпись
        ctx.fillStyle = "#888";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Generated on Ritual Testnet", canvas.width / 2, 780);

        canvasContainer.innerHTML = '';
        canvasContainer.appendChild(canvas);

        // Сохраняем base64 (без префикса) для минта
        currentCardData.imageData = canvas.toDataURL('image/png').split(',')[1];

        // Кнопка Download
        document.getElementById('btn-download').onclick = () => {
            const link = document.createElement('a');
            link.download = `card_${username}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    }, 100);
}

// Закрытие модального окна
document.querySelector('.close').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};

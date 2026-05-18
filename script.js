// 1. 從瀏覽器本地記憶體讀取已經收集到的代碼，如果沒有就初始化為空陣列
let unlocked = JSON.parse(localStorage.getItem('unlockedLayers')) || [];

// 2. 自動擷取當前網址後方的參數 (例如: ?code=1)
const urlParams = new URLSearchParams(window.location.search);
const currentCode = urlParams.get('code');

// 3. 邏輯判斷
// 如果有偵測到 code，且這個 code 之前「沒有被收集過」
if (currentCode && !unlocked.includes(currentCode)) {
    // 如果 code=0，代表是入口處的「預設畫面 QRCode」，我們純開網頁，不紀錄進疊圖陣列
    if (currentCode !== '0') {
        unlocked.push(currentCode);
        // 將更新後的陣列存回 LocalStorage，永久保存觀眾的進度
        localStorage.setItem('unlockedLayers', JSON.stringify(unlocked));
    }
}

// 4. 畫面渲染：如果觀眾已經解鎖了至少任一張圖，就把中央預設的「＋」號隱藏起來
if (unlocked.length > 0) {
    const placeholder = document.querySelector('.empty-state-placeholder');
    if (placeholder) placeholder.style.display = 'none';
}

// 5. 巡迴檢查已解鎖的陣列，將對應的圖片移除 .hidden 類別
// 調整需求 1：由於 CSS 設定了 transition，當此處移除 'hidden' 時，圖片會自動執行「淡入」
unlocked.forEach(code => {
    const targetImg = document.getElementById(`img-${code}`);
    if (targetImg) {
        targetImg.classList.remove('hidden');
    }
});

// 6. 宣告互動元素
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const statusText = document.getElementById('status-text');

// 7. 檢查集滿條件：當集滿全部 5 張圖層時
if (unlocked.length >= 5) {
    // 顯示儲存與分享按鈕
    if (downloadBtn) downloadBtn.style.display = 'block';
    if (shareBtn) shareBtn.style.display = 'block';

    // 調整需求 3：最後完成頁面，標題和子標題「完全維持原樣的 CSS 結構與樣式」
    // 僅微調文字內容，不改變任何字級、顏色、間距等基礎 class，確保與其他頁面完全一致！
    if (statusText) {
        statusText.innerHTML = "重生碎片蒐集成功！<br><span class='sub-text'>至服務台出示手機畫面即可兌換禮品！</span>";
    }
}

// 8. 下載功能：利用 HTML5 Canvas 將所有解鎖圖層完美縫合
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 輸出高清正方形規格 (1200x1200px)，極適合發社群媒體
        canvas.width = 1200;
        canvas.height = 1200;

        const imagesToDraw = [];
        // 依序檢查並推入已解鎖的 HTML 圖片物件
        for (let i = 1; i <= 5; i++) {
            if (unlocked.includes(i.toString())) {
                imagesToDraw.push(document.getElementById(`img-${i}`));
            }
        }

        let loadedCount = 0;
        // 迴圈繪製 Canvas
        imagesToDraw.forEach((img) => {
            const tempImg = new Image();
            tempImg.src = img.src;
            tempImg.onload = () => {
                loadedCount++;
                // 將圖層完美的畫入虛擬畫布中
                ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
                
                // 當所有圖層都疊加完畢，觸發瀏覽器下載行為
                if (loadedCount === imagesToDraw.length) {
                    const link = document.createElement('a');
                    link.download = 'REBIRTH_Artwork.png'; // 預設儲存檔名
                    link.href = canvas.toDataURL('image/png');
                    link.click(); // 模擬自動點擊下載
                }
            };
        });
    });
}

// 9. 手機原生一鍵分享 API (支援 LINE, IG, FB 視裝置而定)
if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'REBIRTH 數位集章',
                    text: '我剛剛集滿了所有圖層，完成了我的重生！快來教研B2一起看圖文系展重生！',
                    url: window.location.origin + window.location.pathname // 分享乾淨不帶 code 參數的原始網址
                });
            } catch (err) {
                console.log('使用者關閉分享選單');
            }
        } else {
            // 桌機電腦或不支援的瀏覽器替代方案
            alert('您的瀏覽器不支援一鍵分享，歡迎手動複製網址分享給朋友喔！');
        }
    });
}
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // 從本地存儲取得已解鎖列表
    let unlocked = JSON.parse(localStorage.getItem('unlockedLayers')) || [];

    // 如果網址有 code 且還沒紀錄過，就存進去
    if (code && !unlocked.includes(code)) {
        unlocked.push(code);
        localStorage.setItem('unlockedLayers', JSON.stringify(unlocked));
    }

    // 顯示對應圖層
    unlocked.forEach(id => {
        const img = document.getElementById(`img-${id}`);
        if (img) img.classList.add('visible');
    });

    // 判斷是否集滿（假設共 3 層）
    if (unlocked.length >= 5) {
        document.getElementById('status-text').innerText = "集齊了！快下載分享吧！";
        const btn = document.getElementById('download-btn');
        btn.style.display = "inline-block";

        btn.onclick = function() {
            html2canvas(document.querySelector("#combined-area")).then(canvas => {
                const link = document.createElement('a');
                link.download = 'my-artwork.png';
                link.href = canvas.toDataURL("image/png");
                link.click();
            });
        };
    }
};
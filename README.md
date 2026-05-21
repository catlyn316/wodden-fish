# 🕉️ 禪意電子木魚 Online (Zen Muyu Online)

> **「隨時隨地敲擊木魚，累積功德，消除煩惱。」**

這是一個精心設計、極具質感且響應迅速的線上電子木魚單頁網頁應用（SPA）。採用純前端 HTML、CSS 與 JavaScript 打造，無任何外部依賴與後端代碼。打擊感清脆細膩、介面美觀，**非常適合直接部署至 GitHub Pages 上免費託管**！

---

## 🌟 核心特色 (Key Features)

### 1. 🎵 高保真即時音效合成 (Web Audio API)
* 傳統網頁載入外部 `.mp3` 音檔時，常常因為網路下載慢或瀏覽器解碼而造成**打擊延遲（Lag）**。
* 本專案採用瀏覽器原生的 **Web Audio API**，直接使用數學波形（三角波與正弦波）與指數衰減包絡線，**即時合成出清脆、厚實的真實木魚敲擊聲**。
* **0 延遲**、支援離線遊玩、高頻敲擊下聲音不干擾不爆音，並支援自由微調音量、音調（木材密度）與餘音共鳴（殿堂空間）。

### 2. 🎨 精美微動畫與多款法相皮膚 (Premium Themes)
* **經典木紋**：古樸沉靜，溫潤禪風。
* **金光禪意**：佛光璀璨，神聖莊嚴。
* **賽博霓虹**：極具未來感的電音賽博風，敲出電子佛陀的動感。
* **水墨禪心**：極簡黑白，儒雅留白。
* 敲擊時木魚會觸發 Q 彈縮放動畫，敲擊點更會向外擴散動態的水波漣漪。

### 3. ✍️ 自訂飄浮文字 (Custom Merits)
* 預設敲擊時飄浮「功德 +1」。
* 您可以任意修改自訂文字，例如改為「薪水 +1」、「煩惱 -1」、「好運 +1」、「脂肪 -1」或「Bug -1」，釋放您日常生活的壓力！

### 4. 🤖 自動修行與數據持久化 (Auto Tap & LocalStorage)
* 開啟「自動修行（Auto Tap）」功能，調整間隔時間（0.2秒 至 3秒），讓系統為您自動積累功德。
* 所有累計功德數、今日功德數、最大連擊（Combo）與成就解鎖進度均會儲存於瀏覽器的 `LocalStorage` 中，重新整理或關閉網頁數據也不會流失。

### 5. 🧘 極簡禪修模式 (Zen Mode)
* 點擊「極簡模式」可隱藏所有側邊欄、設定與數據，只留下木魚與水波，在深邃的呼吸指引下，來一場百分之百的心靈放鬆。

---

## 📂 檔案結構 (Project Structure)

```
wooden-fish/
├── index.html   # 網頁結構與 inline SVG 木魚法相
├── style.css    # 設計系統、4款皮膚配色與磨砂玻璃排版
├── app.js       # 音效合成引擎、粒子系統、成就系統與修行邏輯
└── README.md    # 說明文件 (本檔案)
```

---

## 🚀 如何在本地運行 (Local Execution)

因為專案是純靜態的 HTML/CSS/JS，您可以直接在瀏覽器中雙擊打開 `index.html` 進行遊玩！

如果您想以網頁伺服器（Web Server）環境運行（能提供更完美的本地調試體驗）：
1. 確保您安裝了 Node.js。
2. 在此目錄下打開終端機並執行：
   ```bash
   npx http-server ./
   ```
3. 打開瀏覽器並訪問 `http://localhost:8080` 即可！

---

## 🌐 部署到 GitHub Pages 的步驟 (GitHub Pages Deploy Guide)

只要將這個資料夾上傳到 GitHub，並啟用 GitHub Pages，就可以將您的電子木魚網頁分享給所有人了！

### 步驟 1：在 GitHub 上建立新倉庫 (Repository)
1. 登入您的 GitHub 帳號。
2. 點擊右上角 **New** 建立新倉庫。
3. 倉庫名稱填寫例如：`wooden-fish` 或 `muyu-online`。
4. 設定為 **Public**（公開），然後點擊 **Create repository**。

### 步驟 2：上傳代碼到 GitHub
在您本地的 `wooden-fish` 目錄中執行以下終端機命令：
```bash
# 初始化 git
git init

# 將所有檔案加入暫存區
git add .

# 提交第一次 commit
git commit -m "feat: init premium online wooden-fish app"

# 分支命名為 main
git branch -M main

# 關聯您的 GitHub 倉庫 (請替換為您自己的倉庫網址)
git remote add origin https://github.com/您的用戶名/您的倉庫名.git

# 推送到 GitHub
git push -u origin main
```

### 步驟 3：開啟 GitHub Pages 服務
1. 打開您的 GitHub 倉庫網頁，點擊右上角的 **Settings** (設定)。
2. 在左側選單中找到 **Pages** 點擊進入。
3. 在 **Build and deployment** 下的 **Source** 選擇 **Deploy from a branch**。
4. 在 **Branch** 選單中，將預設的 `None` 改選為 `main`，路徑保持 `/ (root)`，然後點擊 **Save** (儲存)。
5. 等待約 1 分鐘，重新整理頁面，GitHub 就會為您生成一個專屬網址（例如：`https://您的用戶名.github.io/您的倉庫名/`）。

現在，所有人都可以打開您的網址，一起敲木魚累積功德了！

---

## 📜 修行成就清單 (Achievements)
* 🌱 **初叩法門** — 敲擊木魚 1 次
* 🪵 **漸入佳境** — 累計修行達 100 功德
* ✨ **功德無量** — 累計修行達 1,000 功德
* ☸️ **超凡入聖** — 累計修行達 10,000 功德
* 🔥 **聚精會神** — 達成 10 連擊 (Combo)
* ⚡ **心明眼亮** — 達成 50 連擊 (Combo)
* 🤖 **賽博修行** — 啟用自動修行模式
* 🌌 **未來佛陀** — 切換至賽博霓虹皮膚
* 🖌️ **水墨禪心** — 切換至水墨禪心皮膚

---

> **諸法皆空，自由修行。祝您修行圓滿，功德無量！🕉️**

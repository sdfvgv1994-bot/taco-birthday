# 🎂 生日大冒險 taco-birthday

一個可以換主題的**生日闖關小遊戲**。做一個只屬於壽星的小網頁：路線上每一站是一關（猜謎、填空、戳氣球、數字密碼），過一站就蓋一個章，全部完成後走到終點，接著放煙火、生日快樂歌，跳出照片和你寫的祝福。

| 主題 | 路線上的站 | 終點 |
|---|---|---|
| 🏮 夜市 `night` | 雞排、珍奶、射氣球…等攤位 | 放天燈 |
| 🛵 外送送禮 `delivery` | 飲料店、便當店、蛋糕店… | 把禮物送到壽星家 |
| 🚀 太空冒險 `space` | 一顆顆星球 | 抵達生日星 |
| ✉️ 手作卡片 `paper` | 手帳的每一頁、收集貼紙 | 打開最後的信 |

- 📱 手機直接點開就能玩，不用下載 App
- 🎨 4 種主題可選，進度會存在手機裡，關掉 LINE 再打開可以接著玩
- 🧩 不用寫程式：用「產生器」填表單就有分享連結
- 🔓 開源（MIT），想怎麼改都可以
- 🧱 積木式架構：關卡類型一個檔案一種，想加新玩法很容易

**▶ 線上試玩：** https://sdfvgv1994-bot.github.io/taco-birthday/
**🛠 產生器：** https://sdfvgv1994-bot.github.io/taco-birthday/create.html

---

## 怎麼用？

### 方法一：用產生器（最簡單，3 分鐘）

1. 打開 [產生器](https://sdfvgv1994-bot.github.io/taco-birthday/create.html)
2. 選主題，填壽星名字、5 個關卡的題目和答案、生日祝福
3. 按「產生連結」→「先玩玩看」確認沒問題
4. 按「複製連結」或「傳到 LINE」傳給壽星 🎉

草稿會自動存在你的手機瀏覽器裡，關掉再打開還在。
想改已經送出去的連結？把連結裡的 `index.html` 換成 `create.html` 打開，就能接著改。

### 方法二：Fork 一份（可以放手機裡的照片）

連結版只能放「網路上的圖片網址」。想放自己的照片：

1. 按右上角 **Fork**，複製一份到你的 GitHub
2. 把照片上傳到 `photos/` 資料夾（網頁版：進資料夾 → Add file → Upload files）
3. 改 `config.js`：填名字、關卡、祝福，`photos` 寫 `["photos/1.jpg", "photos/2.jpg"]`
   （也可以用產生器填好，展開「進階：匯出 config.js」複製貼上）
4. 到 **Settings → Pages**，Source 選 **GitHub Actions**
5. 等一兩分鐘，網址就是 `https://你的帳號.github.io/taco-birthday/`

> 照片建議先縮小到寬 1000px 左右，手機開起來比較快。

---

## 關卡類型

| 類型 | `type` | 設定 | 說明 |
|---|---|---|---|
| 選擇題 | `choice` | `question`, `options`, `answer`, `hint` | `answer` 是正確選項的位置，從 0 開始算 |
| 填空題 | `text` | `question`, `answers`, `hint` | `answers` 可放好幾種寫法；比對時會忽略空白、大小寫、全半形 |
| 戳氣球 | `balloon` | `question`, `count`, `clue` | 戳破全部氣球後出現 `clue` 那句話 |
| 數字密碼 | `lock` | `question`, `password`, `hint` | 只能是數字（3～8 碼），像生日 `0315`；畫面跟著主題變（取餐號碼、門禁、艙門、日記鎖） |

每一關都可以再加兩個設定（都可以不填）：

| 設定 | 說明 |
|---|---|
| `place` | 站點名稱，例如 `"阿宇的雞排攤"`、`"第一次見面那天"` |
| `style` | 圖案，每個主題不同，見 `config.js` 開頭的說明（不填會自動輪流） |

關卡數量可以 1～10 關，順序隨你排。

## 專案結構（積木架構）

```
index.html          遊戲本體
create.html         產生器
config.js           預設內容（沒有分享連結時用這份）
css/                樣式（style.css 遊戲、themes.css 各主題配色、create.css 產生器）
js/core/            核心積木：data（連結編碼）、ui（畫面工具）、audio（8-bit 音效）、sprites（像素畫筆）
js/themes/          主題積木：night、delivery、space、paper（各自的圖案和文字）
js/levels/          關卡積木：choice、text、balloon、lock
js/route.js         路線畫面（站點解鎖、角色移動、集點卡），所有主題共用
js/celebrate.js     終點慶祝（煙火、照片、祝福）
js/main.js          主流程
js/create.js        產生器邏輯
fonts/              俐方體 11 號（像素中文字型）
photos/             放照片的地方
```

### 想加新的關卡類型？

1. 在 `js/levels/` 新增一個檔案，例如 `memory.js`：
   ```js
   Bday.levels.memory = function (stage, level, api) {
     // 把畫面放進 stage；對方過關時呼叫 api.pass()，答錯呼叫 api.fail()
   };
   ```
2. 在 `index.html` 的關卡積木區加一行 `<script src="js/levels/memory.js"></script>`
3. （選做）在 `js/create.js` 的 `TYPES` 和 `levelFields` 加上它的表單

### 想加新的主題？

複製 `js/themes/night.js` 改成新檔案（例如 `ocean.js`），把 `B.themes.night` 改名、換掉文字和圖案，在 `index.html` 和 `create.html` 的主題積木區多載入一行，產生器的主題選單就會自動出現它。配色寫在 `css/themes.css`（用 `body.theme-ocean` 開頭）。

## 小提醒

- 內容是放在連結的 `#` 後面，有壓縮編碼過，一般人看不出答案，但懂程式的人解得開，**不要放太私密的資訊**。
- 分享連結不會經過任何伺服器（`#` 後面的內容瀏覽器不會送出去），也不會收集任何資料。
- 第一次按「開始遊戲」後才會有聲音（手機瀏覽器的規定）；右上角喇叭可以靜音。
- 在 LINE 裡打開如果沒聲音，點右上角選「用預設瀏覽器開啟」。

## 測試小技巧

網址加 `#level=5` 會直接打開路線、前 4 關當作已完成（不會存進度），例如 `index.html#level=5`。

加 `#theme=space` 可以用範例內容看別的主題。所有像素圖都是用程式畫的原創圖案，放在 `js/themes/`。

## 授權

- 程式碼：[MIT License](LICENSE)
- 字型：[俐方體 11 號 Cubic 11](https://github.com/ACh-K/Cubic-11)，SIL Open Font License 1.1（見 `fonts/Cubic_11-OFL.txt`）
- 〈Happy Birthday to You〉旋律為公共領域，本專案用程式即時合成

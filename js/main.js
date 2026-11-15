/*
 * 主流程：開場 → 路線 → 進站闖關 → 集點 → 集滿 → 終點 → 煙火、照片、祝福
 * 畫面上的文字和圖案跟著主題（js/themes/）換。
 * 想新增關卡類型：在 js/levels/ 加一個檔案，註冊 Bday.levels.新名字，
 * 再到 index.html 用 <script> 載入就好，這個檔案不用改。
 */
(async function () {
  const B = window.Bday;
  const { el } = B;
  const app = document.getElementById("app");

  B.makeStars(document.getElementById("sky"), 40);

  const muteBtn = document.getElementById("mute");
  muteBtn.addEventListener("click", () => {
    const m = B.sfx.toggle();
    muteBtn.textContent = m ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-label", m ? "開啟聲音" : "關閉聲音");
  });

  const cfg = await B.loadConfig();
  const T = (B.theme = B.themes[cfg.theme]);
  document.body.classList.add("theme-" + cfg.theme);
  document.title = cfg.title;
  if (B.loadError) B.toast("連結好像不完整，先顯示範例內容", 3500);
  const n = cfg.levels.length;

  // ---------- 進度：存在這支手機裡，關掉 LINE 再打開還能接著玩 ----------
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  const KEY = "bday-route-" + hash(JSON.stringify(cfg));
  let progress = { done: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.done >= 0) progress = { done: Math.min(n, saved.done | 0) };
  } catch (e) { /* 沒辦法讀就從頭開始 */ }
  let saveProgress = function () {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) { /* 存不了也能玩 */ }
  };
  function resetProgress() { progress = { done: 0 }; saveProgress(); }

  // 紅布條標題
  function banner(text) {
    return el("div", { class: "sign" }, [el("h1", { text })]);
  }

  // ---------- 開場 ----------
  function intro() {
    B.stopMelody && B.stopMelody();
    const lantern = el("div", { class: "intro-lantern bob" });
    lantern.innerHTML = T.goalSVG();
    const resumed = progress.done > 0;
    app.replaceChildren(
      banner(cfg.title),
      el("div", { class: "screen intro" }, [
        lantern,
        el("p", { class: "lead", text: T.intro.lead(cfg.name) }),
        el("p", {
          class: "sub",
          text: n ? T.intro.sub(n) : "準備好了嗎？"
        }),
        B.button(resumed ? T.intro.resume : T.intro.start, () => { B.sfx.unlock(); n ? market() : finale(); }, "yellow wide big"),
        resumed ? B.button("從頭開始", () => { resetProgress(); intro(); }, "small") : null
      ])
    );
    window.scrollTo(0, 0);
  }

  // ---------- 夜市街 ----------
  function market(justCleared) {
    B.renderRoute(app, {
      cfg, progress, justCleared,
      onEnter: playLevel,
      onGoal: fullCard,
      onHome: () => { B.sfx.click(); intro(); }
    });
    if (justCleared == null) window.scrollTo(0, 0);
  }

  function showStamp(next) {
    const box = el("div", { class: "clear-banner" }, [
      el("div", { class: "clear-box pop-in" }, [
        el("p", { class: "clear-title", text: T.pass.big }),
        el("p", { class: "clear-stars", text: T.pass.small })
      ])
    ]);
    document.body.appendChild(box);
    setTimeout(() => { box.remove(); next(); }, 1100);
  }

  // ---------- 攤位（關卡） ----------
  function playLevel(i) {
    const lv = cfg.levels[i];
    const stage = el("div", { class: "screen stage" });
    app.replaceChildren(
      banner(B.placeName(cfg, i)),
      el("div", { class: "level-head" }, [
        el("button", { class: "back-btn", type: "button", text: T.back, onclick: () => { B.sfx.click(); market(); } }),
        el("span", { class: "level-tag", text: `第 ${i + 1} ${T.unit}／共 ${n} ${T.unit}` })
      ]),
      stage
    );
    window.scrollTo(0, 0);

    let passed = false;
    B.levels[lv.type](stage, lv, {
      pass(quiet) {
        if (passed) return;
        passed = true;
        if (quiet !== true) B.sfx.ok();
        if (i >= progress.done) { progress.done = i + 1; saveProgress(); }
        setTimeout(() => showStamp(() => market(i)), quiet === true ? 0 : 350);
      },
      fail() { B.sfx.wrong(); }
    });
  }

  // ---------- 集滿 ----------
  function fullCard() {
    B.sfx.win();
    const stamp = el("div", { class: "big-clear" }, [el("p", { class: "big-clear-text", text: T.full })]);
    document.body.appendChild(stamp);
    setTimeout(() => { stamp.remove(); finale(); }, 1600);
  }

  function finale() {
    B.celebrate(app, cfg, () => { resetProgress(); intro(); });
  }

  // 方便測試：網址加 #level=3 直接打開夜市、前 2 攤當作已過（不會存起來）
  const jump = location.hash.match(/[#&]level=(\d+)/);
  if (jump) {
    progress = { done: Math.min(n, Math.max(0, parseInt(jump[1], 10) - 1)) };
    saveProgress = function () {};
    market();
  } else {
    intro();
  }
})();

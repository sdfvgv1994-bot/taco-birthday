/*
 * 關卡積木：數字密碼
 * 一塊亮燈的號碼板，輸入正確的數字才過關（上面的字跟著主題換）。
 * 設定：{ type:"lock", question, password:"1104", hint }
 * 號碼只能是數字，格子數量會跟著號碼長度變。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  B.levels = B.levels || {};

  B.levels.lock = function (stage, level, api) {
    const { el } = B;
    const password = String(level.password || "0000").replace(/\D/g, "").slice(0, 8) || "0000";
    const len = password.length;
    let typed = "";
    let wrongCount = 0;
    let done = false;

    const slots = [];
    const slotRow = el("div", { class: "lock-slots" });
    for (let i = 0; i < len; i++) {
      const s = el("span", { class: "slot", text: "" });
      slots.push(s);
      slotRow.appendChild(s);
    }
    if (len > 5) slotRow.classList.add("many");

    const lock = el("div", { class: "lock" }, [
      el("div", { class: "lock-body" }, [
        el("p", { class: "board-label", text: B.theme.lock.label }),
        slotRow
      ])
    ]);

    // 提示在第一次輸錯後才出現，保留一點懸念
    const hintBox = el("p", { class: "hint", text: "" });

    function render() {
      slots.forEach((s, i) => { s.textContent = typed[i] || ""; });
    }

    function press(k) {
      if (done) return;
      if (k === "del") { typed = typed.slice(0, -1); B.sfx.key(); render(); return; }
      if (typed.length >= len) return;
      typed += k;
      B.sfx.key();
      render();
      if (typed.length === len) setTimeout(check, 200);
    }

    function check() {
      if (typed === password) {
        done = true;
        lock.classList.add("open");
        B.sfx.unlockLock();
        setTimeout(() => api.pass(), 700);
      } else {
        wrongCount++;
        B.replay(lock, "shake");
        api.fail();
        setTimeout(() => { typed = ""; render(); }, 350);
        if (level.hint) {
          hintBox.textContent = "💡 提示：" + level.hint;
          B.replay(hintBox, "glow");
        } else {
          hintBox.textContent = "號碼不對，再試一次！";
        }
      }
    }

    const pad = el("div", { class: "keypad" });
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0"].forEach(k => {
      const btn = el("button", {
        class: "px-btn key" + (k === "del" ? " red" : ""),
        type: "button",
        "aria-label": k === "del" ? "刪除" : k,
        text: k === "del" ? "⌫" : k
      });
      btn.addEventListener("click", () => press(k));
      pad.appendChild(btn);
    });

    // 實體鍵盤也能用（電腦上玩的時候）
    function onKey(e) {
      if (!stage.isConnected) { document.removeEventListener("keydown", onKey); return; }
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    }
    document.addEventListener("keydown", onKey);

    stage.appendChild(lock);
    stage.appendChild(el("p", { class: "lock-title", text: level.question || B.theme.lock.question }));
    stage.appendChild(pad);
    stage.appendChild(hintBox);
  };
})();

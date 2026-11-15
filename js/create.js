/*
 * 產生器：把表單內容變成一條分享連結
 * 流程：表單 → state（設定物件）→ 壓縮編碼 → index.html#d=...
 * 草稿會自動存在這支手機的瀏覽器裡，關掉再打開還在。
 */
(async function () {
  const B = window.Bday;
  const { el } = B;
  const $ = id => document.getElementById(id);
  const DRAFT_KEY = "bday-maker-draft-v2";
  const themeOf = () => B.themes[state.theme] || B.themes.night;
  const MAX_LEVELS = 10;

  B.makeStars($("sky"), 30);

  const TYPES = {
    choice: "選擇題",
    text: "填空題",
    balloon: "戳氣球",
    lock: "數字密碼"
  };

  function blankLevel(type) {
    if (type === "choice") return { type, question: "", options: ["", "", "", ""], answer: 0, hint: "" };
    if (type === "text") return { type, question: "", answers: [], hint: "" };
    if (type === "balloon") return { type, question: "把氣球全部戳破，裡面藏著一句話！", count: 8, clue: "" };
    return { type: "lock", question: "", password: "", hint: "" };
  }

  // 把任何來源的設定整理成表單好編輯的樣子（選擇題固定 4 格）
  function toEditable(cfg) {
    const c = JSON.parse(JSON.stringify(cfg || {}));
    c.levels = (c.levels || []).filter(l => l && TYPES[l.type]).map(l => {
      const base = Object.assign(blankLevel(l.type), l);
      if (l.type === "choice") {
        const opts = (l.options || []).slice(0, 6);
        while (opts.length < 4) opts.push("");
        base.options = opts;
      }
      if (l.type === "text" && !Array.isArray(base.answers)) base.answers = [String(base.answers || "")];
      return base;
    });
    c.photos = Array.isArray(c.photos) ? c.photos : [];
    return c;
  }

  // 載入順序：網址裡的 #d=（修改舊連結）→ 草稿 → 範例
  let state = null;
  const m = location.hash.match(/[#&]d=([^&]+)/);
  if (m) {
    try { state = toEditable(await B.decodeConfig(m[1])); B.toast("已載入連結內容，可以直接修改"); }
    catch (e) { B.toast("連結看不懂，改用草稿"); }
  }
  if (!state) {
    try { const d = localStorage.getItem(DRAFT_KEY); if (d) state = toEditable(JSON.parse(d)); } catch (e) { /* 無法存取就算了 */ }
  }
  if (!state) {
    state = toEditable(Object.assign({}, window.BIRTHDAY_CONFIG, { name: "", from: "" }));
    state.levels.forEach(l => { l.place = ""; l.style = ""; });
  }
  if (!B.themes[state.theme]) state.theme = "night";

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (e) { /* 無痕模式之類的 */ }
    }, 300);
    $("result").hidden = true; // 內容改了，舊連結就不算數
  }

  // ---------- 基本欄位 ----------
  function bindField(id, key, parse) {
    const f = $(id);
    f.value = state[key] == null ? "" : state[key];
    f.addEventListener("input", () => { state[key] = parse ? parse(f.value) : f.value; save(); });
  }
  const themeSel = $("f-theme");
  Object.keys(B.themes).forEach(k => themeSel.appendChild(el("option", { value: k, text: B.themes[k].name, selected: state.theme === k })));
  themeSel.addEventListener("change", () => {
    state.theme = themeSel.value;
    // 圖案是跟著主題走的，換主題後不適用的就改回「自動」
    state.levels.forEach(l => { if (!themeOf().styles[l.style]) l.style = ""; });
    save(); renderLevels();
  });
  bindField("f-name", "name");
  bindField("f-title", "title");
  bindField("f-from", "from");
  bindField("f-wish", "wish");
  const photosBox = $("f-photos");
  photosBox.value = state.photos.join("\n");
  photosBox.addEventListener("input", () => {
    state.photos = photosBox.value.split("\n").map(s => s.trim()).filter(Boolean);
    save();
  });

  // ---------- 關卡編輯 ----------
  function input(lv, key, placeholder, opts) {
    opts = opts || {};
    const tag = opts.multi ? "textarea" : "input";
    const f = el(tag, {
      class: "px-input",
      placeholder,
      maxlength: opts.max || 200,
      rows: opts.multi ? 2 : null,
      inputmode: opts.numeric ? "numeric" : null,
      type: opts.type || (opts.multi ? null : "text")
    });
    const v = opts.get ? opts.get() : lv[key];
    f.value = v == null ? "" : v;
    f.addEventListener("input", () => {
      if (opts.clean) {
        const c = opts.clean(f.value);
        if (c !== f.value) f.value = c; // 打錯字當下就修掉，畫面和存的內容一致
      }
      if (opts.set) opts.set(f.value); else lv[key] = f.value;
      save();
    });
    return f;
  }

  function field(label, control) {
    return el("label", null, [label, control]);
  }

  function levelFields(lv, idx) {
    const out = [];
    const styleSel = el("select", { class: "px-input" });
    styleSel.appendChild(el("option", { value: "", text: "自動", selected: !lv.style }));
    Object.keys(themeOf().styles).forEach(k => styleSel.appendChild(el("option", { value: k, text: themeOf().styles[k], selected: lv.style === k })));
    styleSel.addEventListener("change", () => { lv.style = styleSel.value; save(); });
    out.push(el("div", { class: "two-col" }, [
      field("站點名稱", input(lv, "place", themeOf().placeHint, { max: 14 })),
      field("圖案", styleSel)
    ]));
    out.push(field("題目／說明", input(lv, "question", "要問對方的問題", { multi: true })));

    if (lv.type === "choice") {
      const name = "ans-" + idx;
      lv.options.forEach((opt, i) => {
        const radio = el("input", { type: "radio", name, checked: lv.answer === i });
        radio.addEventListener("change", () => { lv.answer = i; save(); });
        out.push(el("div", { class: "opt-row" }, [
          input(lv, null, "選項 " + "ABCDEF"[i], {
            get: () => lv.options[i],
            set: v => { lv.options[i] = v; },
            max: 60
          }),
          el("label", { class: "correct" }, [radio, "正確"])
        ]));
      });
      out.push(field("提示（答錯時出現，可不填）", input(lv, "hint", "例如：那天有下雨")));
    }

    if (lv.type === "text") {
      out.push(field("答案（好幾種寫法都算對的話，用 / 分開）", input(lv, null, "例如：鹹酥雞 / 鹽酥雞", {
        get: () => (lv.answers || []).join(" / "),
        set: v => { lv.answers = v.split("/").map(s => s.trim()).filter(Boolean); }
      })));
      out.push(field("提示（答錯兩次後出現，可不填）", input(lv, "hint", "")));
    }

    if (lv.type === "balloon") {
      const sel = el("select", { class: "px-input" });
      [4, 6, 8, 10, 12, 16].forEach(n => sel.appendChild(el("option", { value: n, text: n + " 顆", selected: +lv.count === n })));
      sel.addEventListener("change", () => { lv.count = +sel.value; save(); });
      out.push(field("氣球數量", sel));
      out.push(field("全部戳破後出現的一句話", input(lv, "clue", "例如：你是我最好的朋友", { multi: true })));
    }

    if (lv.type === "lock") {
      out.push(field("號碼（只能是數字，3～8 碼，例如生日 0315）", input(lv, "password", "例如：0315", {
        numeric: true, max: 8,
        clean: v => v.replace(/\D/g, "")
      })));
      out.push(field("提示（輸錯時出現）", input(lv, "hint", "例如：你的生日（月＋日）")));
    }
    return out;
  }

  function renderLevels() {
    const box = $("levels");
    box.replaceChildren();
    state.levels.forEach((lv, idx) => {
      const typeSel = el("select", { class: "px-input", "aria-label": "關卡類型" });
      Object.keys(TYPES).forEach(t => typeSel.appendChild(el("option", { value: t, text: TYPES[t], selected: lv.type === t })));
      typeSel.addEventListener("change", () => {
        const q = lv.question;
        state.levels[idx] = Object.assign(blankLevel(typeSel.value), { place: lv.place || "", style: lv.style || "" });
        if (q && typeSel.value !== "lock" && typeSel.value !== "balloon") state.levels[idx].question = q;
        save(); renderLevels();
      });

      const up = el("button", { class: "icon-btn", type: "button", "aria-label": "往上移", text: "↑", disabled: idx === 0 });
      up.addEventListener("click", () => { move(idx, -1); });
      const del = el("button", { class: "icon-btn del", type: "button", "aria-label": "刪除這關", text: "✕", disabled: state.levels.length <= 1 });
      del.addEventListener("click", () => { state.levels.splice(idx, 1); save(); renderLevels(); });

      box.appendChild(el("div", { class: "level-card" }, [
        el("div", { class: "level-top" }, [
          el("span", { class: "level-no", text: `第 ${idx + 1} 關` }), typeSel, up, del
        ])
      ].concat(levelFields(lv, idx))));
    });
    $("add-level").disabled = state.levels.length >= MAX_LEVELS;
  }

  function move(idx, d) {
    const j = idx + d;
    if (j < 0 || j >= state.levels.length) return;
    const t = state.levels[idx];
    state.levels[idx] = state.levels[j];
    state.levels[j] = t;
    save(); renderLevels();
  }

  $("add-level").addEventListener("click", () => {
    if (state.levels.length >= MAX_LEVELS) return;
    state.levels.push(blankLevel("choice"));
    save(); renderLevels();
  });

  // ---------- 檢查 & 輸出 ----------
  function buildConfig() {
    const errors = [];
    if (!String(state.name || "").trim()) errors.push("請填壽星名字");

    const levels = state.levels.map((lv, i) => {
      const lvCfg = buildLevel(lv, i);
      const place = String(lv.place || "").trim();
      if (place) lvCfg.place = place;
      if (lv.style && themeOf().styles[lv.style]) lvCfg.style = lv.style;
      return lvCfg;
    });

    function buildLevel(lv, i) {
      const n = `第 ${i + 1} 關`;
      const q = String(lv.question || "").trim();
      if (lv.type === "choice") {
        const filled = lv.options.map((o, k) => ({ o: String(o).trim(), k })).filter(x => x.o);
        const ans = filled.findIndex(x => x.k === lv.answer);
        if (!q) errors.push(n + "：還沒寫題目");
        if (filled.length < 2) errors.push(n + "：至少要有 2 個選項");
        else if (ans < 0) errors.push(n + "：勾選「正確」的那個選項是空的");
        return { type: "choice", question: q, options: filled.map(x => x.o), answer: Math.max(0, ans), hint: (lv.hint || "").trim() };
      }
      if (lv.type === "text") {
        const answers = (lv.answers || []).map(s => String(s).trim()).filter(Boolean);
        if (!q) errors.push(n + "：還沒寫題目");
        if (!answers.length) errors.push(n + "：還沒填答案");
        return { type: "text", question: q, answers, hint: (lv.hint || "").trim() };
      }
      if (lv.type === "balloon") {
        return { type: "balloon", question: q, count: +lv.count || 8, clue: (lv.clue || "").trim() || "生日快樂！" };
      }
      const pw = String(lv.password || "").replace(/\D/g, "");
      if (pw.length < 3 || pw.length > 8) errors.push(n + "：號碼要 3～8 個數字");
      return { type: "lock", question: q, password: pw, hint: (lv.hint || "").trim() };
    }

    const cfg = {
      theme: state.theme,
      name: String(state.name || "").trim(),
      title: String(state.title || "").trim(),
      from: String(state.from || "").trim(),
      levels,
      wish: String(state.wish || "").trim() || "生日快樂！",
      photos: (state.photos || []).filter(p => /^https?:\/\/\S+$/i.test(p) || /^[^\s:"'<>]+$/.test(p))
    };
    const badPhotos = (state.photos || []).length - cfg.photos.length;
    if (badPhotos) errors.push(`有 ${badPhotos} 個照片網址格式不對（要 https:// 開頭）`);
    return { cfg, errors };
  }

  function gameURL(code) {
    return new URL("index.html", location.href).href.split("#")[0] + "#d=" + code;
  }

  function configJS(cfg) {
    return "window.BIRTHDAY_CONFIG = " + JSON.stringify(cfg, null, 2) + ";\n";
  }

  $("make").addEventListener("click", async () => {
    const { cfg, errors } = buildConfig();
    $("errors").textContent = errors.length ? "還差一點：\n・" + errors.join("\n・") : "";
    $("config-out").value = configJS(cfg);
    if (errors.length) { B.replay($("make"), "shake"); return; }
    const url = gameURL(await B.encodeConfig(cfg));
    $("link").value = url;
    $("preview").href = url;
    $("line").href = "https://line.me/R/share?text=" + encodeURIComponent("🎂 生日快樂！送你一個小遊戲，全部過關有驚喜喔\n" + url);
    $("result").hidden = false;
    $("result").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  async function copy(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      B.toast(okMsg);
    } catch (e) {
      B.toast("請長按上面的文字手動複製");
    }
  }
  $("copy").addEventListener("click", () => copy($("link").value, "已複製連結 ✔"));
  $("copy-config").addEventListener("click", () => {
    const { cfg } = buildConfig();
    $("config-out").value = configJS(cfg);
    copy($("config-out").value, "已複製 config.js 內容 ✔");
  });
  document.querySelector(".adv").addEventListener("toggle", () => {
    $("config-out").value = configJS(buildConfig().cfg);
  });

  // 清空要按兩次，避免手滑
  let resetArmed = false;
  $("reset").addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      $("reset").textContent = "再按一次確定清空";
      setTimeout(() => { resetArmed = false; $("reset").textContent = "清空，重新開始"; }, 3000);
      return;
    }
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* 略 */ }
    location.replace(location.pathname);
  });

  renderLevels();
})();

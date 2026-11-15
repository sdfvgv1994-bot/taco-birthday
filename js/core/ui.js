/*
 * 積木：畫面小工具
 * el() 用來建立元素。所有使用者輸入的文字都用 textContent 放進去，
 * 不用 innerHTML，這樣別人在連結裡塞程式碼也不會被執行（安全考量）。
 */
(function () {
  const B = (window.Bday = window.Bday || {});

  B.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    [].concat(children || []).forEach(c => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  };

  // 重新播放某個 CSS 動畫（例如答錯的搖晃）
  B.replay = function (node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  };

  B.wait = ms => new Promise(r => setTimeout(r, ms));

  B.toast = function (msg, ms) {
    const t = B.el("div", { class: "toast", text: msg });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, ms || 1800);
  };

  B.button = function (label, onClick, cls) {
    return B.el("button", {
      class: "px-btn " + (cls || ""),
      type: "button",
      onclick: e => { B.sfx && B.sfx.click(); onClick && onClick(e); }
    }, label);
  };

  // 背景星星
  B.makeStars = function (host, n) {
    for (let i = 0; i < n; i++) {
      const s = B.el("i", { class: "star" });
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      if (Math.random() < 0.3) s.classList.add("big");
      host.appendChild(s);
    }
  };
})();

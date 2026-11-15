/*
 * 積木：路線畫面（每個主題共用）
 * 一條由上往下的路線，每一關是一個站點：還沒開 → 目前這站 → 已完成。
 * 上面是集點卡，每過一站蓋一格；全部完成後，路線尾端的終點就會亮起來。
 * 站點長什麼樣子、文字怎麼寫，都由主題（js/themes/）決定。
 */
(function () {
  const B = (window.Bday = window.Bday || {});

  B.placeName = function (cfg, i) {
    const p = cfg.levels[i] && cfg.levels[i].place;
    return (p && String(p).trim()) || B.theme.places[i % B.theme.places.length];
  };
  B.nodeStyle = function (style, i) {
    return B.theme.styles[style] ? style : B.theme.order[i % B.theme.order.length];
  };

  function sprite(html, cls) {
    const d = B.el("div", { class: cls });
    d.innerHTML = html; // 都是固定的像素圖，沒有使用者文字
    return d;
  }

  /* opts: { cfg, progress, onEnter(i), onGoal(), onHome(), justCleared } */
  B.renderRoute = function (app, opts) {
    const { el } = B, T = B.theme;
    const { cfg, progress } = opts;
    const n = cfg.levels.length, done = progress.done, allDone = done >= n;

    // ---- 集點卡 ----
    const card = el("div", { class: "stamp-card", "aria-label": `${T.card.title}：${done} / ${n}` }, [
      el("span", { class: "stamp-title", text: T.card.title })
    ]);
    for (let i = 0; i < n; i++) {
      card.appendChild(el("span", {
        class: "stamp" + (i < done ? " on" : "") + (i === opts.justCleared ? " fresh" : ""),
        text: i < done ? T.card.mark : String(i + 1)
      }));
    }
    const tip = el("p", { class: "next-tip", text: allDone ? T.doneTip : T.nextTip(B.placeName(cfg, done)) });
    const top = el("div", { class: "market-top" }, [
      el("button", { class: "home-btn", type: "button", "aria-label": "回到首頁", text: "↩", onclick: opts.onHome }),
      card
    ]);

    // ---- 路線 ----
    const street = el("div", { class: "street" });
    const nodes = [];
    let walking = false;

    function node(i) {
      const state = i < done ? "cleared" : i === done ? "open" : "closed";
      const b = el("button", {
        class: "stall " + state, type: "button",
        "aria-label": `${B.placeName(cfg, i)}（${T.labels[state]}）`
      }, [
        el("span", { class: "stall-flag", text: T.labels[state] }),
        sprite(T.nodeSVG(B.nodeStyle(cfg.levels[i].style, i)), "stall-art"),
        el("span", { class: "stall-name", text: B.placeName(cfg, i) })
      ]);
      b.addEventListener("click", () => {
        if (walking) return;
        if (state === "closed") { B.sfx.wrong(); B.replay(b, "shake"); B.toast(T.closedToast(B.placeName(cfg, done))); }
        else if (state === "cleared") { B.sfx.click(); B.toast(T.clearedToast); }
        else { B.sfx.click(); walkTo(b, () => opts.onEnter(i)); }
      });
      nodes[i] = b;
      return b;
    }

    // 站點左右交錯排，旁邊放裝飾
    for (let i = 0; i < n; i++) {
      street.appendChild(el("div", { class: "street-row" + (i % 2 ? " flip" : "") }, [
        node(i),
        el("div", { class: "side" }, [
          sprite(T.decoA(), "deco-a"),
          i % 2 ? sprite(T.decoB(), "deco-b") : sprite(T.decoA(), "deco-a low")
        ])
      ]));
    }

    // 終點
    const goal = el("button", {
      class: "altar" + (allDone ? " ready" : ""), type: "button",
      "aria-label": allDone ? T.goal.ready : T.goal.name
    }, [
      sprite(T.goalSVG(), "altar-art"),
      el("span", { class: "stall-name", text: allDone ? T.goal.ready : T.goal.name })
    ]);
    goal.addEventListener("click", () => {
      if (walking) return;
      B.sfx.click();
      if (allDone) walkTo(goal, opts.onGoal);
      else B.toast(T.goal.notYet(n - done));
    });
    street.appendChild(el("div", { class: "street-end" }, [goal]));

    // ---- 會移動的小角色 ----
    const walker = sprite(T.walkerSVG(), "walker");
    street.appendChild(walker);

    function spotOf(nd) {
      const m = street.getBoundingClientRect(), r = nd.getBoundingClientRect();
      return { x: r.left - m.left + r.width / 2, y: r.top - m.top + r.height * 0.86 };
    }
    function place(p) { walker.style.left = p.x + "px"; walker.style.top = p.y + "px"; }
    function walkTo(nd, then) {
      walking = true;
      const from = { x: parseFloat(walker.style.left) || 0, y: parseFloat(walker.style.top) || 0 };
      const to = spotOf(nd);
      const ms = Math.max(350, Math.min(1400, Math.hypot(to.x - from.x, to.y - from.y) * 3));
      walker.classList.toggle("face-left", to.x < from.x);
      walker.classList.add("walking");
      walker.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
      place(to);
      setTimeout(() => { walker.classList.remove("walking"); walking = false; then(); }, ms + 120);
    }

    app.replaceChildren(el("div", { class: "screen market" }, [top, tip, street]));

    // 等畫面排好才知道座標
    requestAnimationFrame(() => {
      walker.style.transition = "none";
      if (opts.justCleared != null && nodes[opts.justCleared]) place(spotOf(nodes[opts.justCleared]));
      else if (done > 0 && nodes[done - 1]) place(spotOf(nodes[done - 1]));
      else place({ x: street.clientWidth / 2, y: 30 });
      walker.classList.add("ready");
      if (opts.justCleared != null) setTimeout(() => B.sfx.unlockLock(), 450);
      const focus = nodes[done] || goal;
      const rect = focus.getBoundingClientRect();
      if (rect.bottom > innerHeight - 20 || rect.top < 0) {
        window.scrollTo({ top: window.scrollY + rect.top - innerHeight / 3, behavior: "smooth" });
      }
    });
  };
})();

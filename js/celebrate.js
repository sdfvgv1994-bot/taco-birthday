/*
 * 積木：終點慶祝（每個主題共用）
 * 第一步：點一下終點的東西（天燈、禮物、星星、信封，看主題）
 * 第二步：放煙火＋生日快樂歌＋照片＋祝福（打字機效果）
 */
(function () {
  const B = (window.Bday = window.Bday || {});

  // 煙火：在畫面上半部隨機炸開
  function fireworks(ms) {
    const cvs = B.el("canvas", { class: "confetti" });
    document.body.appendChild(cvs);
    const ctx = cvs.getContext("2d");
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { cvs.width = innerWidth * dpr; cvs.height = innerHeight * dpr; }
    size();
    addEventListener("resize", size);
    const colors = ["#ff5d73", "#ffcf4a", "#4fd1a1", "#5aa9ff", "#ff9a3a", "#f4f1e6"];
    let parts = [];
    function burst() {
      const x = (0.15 + Math.random() * 0.7) * cvs.width;
      const y = (0.1 + Math.random() * 0.4) * cvs.height;
      const c = colors[(Math.random() * colors.length) | 0];
      const count = 26 + ((Math.random() * 14) | 0);
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const v = (2 + Math.random() * 2.5) * dpr;
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c });
      }
      B.sfx.pop();
    }
    const end = performance.now() + (ms || 7000);
    let nextBurst = 0;
    (function frame(now) {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      if (now < end && now > nextBurst) { burst(); nextBurst = now + 500 + Math.random() * 500; }
      parts = parts.filter(p => p.life > 0);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04 * dpr; p.vx *= 0.985; p.life -= 0.016;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        const s = 4 * dpr;
        ctx.fillRect(Math.round(p.x / s) * s, Math.round(p.y / s) * s, s, s); // 對齊格子，保持像素感
      });
      ctx.globalAlpha = 1;
      if ((now < end || parts.length) && cvs.isConnected) requestAnimationFrame(frame);
      else { cvs.remove(); removeEventListener("resize", size); }
    })(performance.now());
  }

  function typewriter(node, text, speed) {
    let i = 0;
    let timer = null;
    const chars = [...text];
    function step() {
      node.textContent = chars.slice(0, ++i).join("");
      if (i < chars.length) timer = setTimeout(step, chars[i - 1] === "\n" ? speed * 6 : speed);
      else node.classList.add("done");
    }
    // 點一下可以直接顯示全部
    node.addEventListener("click", () => {
      clearTimeout(timer);
      i = chars.length;
      node.textContent = text;
      node.classList.add("done");
    });
    step();
  }

  function photoStrip(photos) {
    const { el } = B;
    const strip = el("div", { class: "photos" });
    photos.forEach((src, i) => {
      const img = el("img", { src, alt: `照片 ${i + 1}`, loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" });
      const frame = el("figure", { class: "polaroid" }, [img]);
      frame.style.setProperty("--tilt", ((i % 2 ? 1 : -1) * (1 + Math.random() * 2.5)).toFixed(1) + "deg");
      img.addEventListener("error", () => frame.remove());
      strip.appendChild(frame);
    });
    return strip;
  }

  function finale(app, cfg, restart) {
    const { el } = B;
    setTimeout(() => B.playMelody(), 600);
    fireworks(8000);

    const wishText = el("p", { class: "wish-text" });
    const parts = [
      el("div", { class: "sign big" }, [el("h1", { text: "生日快樂！" })]),
      el("p", { class: "hb-name pop-in", text: cfg.name })
    ];
    if (cfg.photos.length) {
      parts.push(photoStrip(cfg.photos));
      if (cfg.photos.length > 1) parts.push(el("p", { class: "swipe-tip", text: "← 左右滑動看照片 →" }));
    }
    parts.push(el("div", { class: "card wish" }, [
      wishText,
      cfg.from ? el("p", { class: "wish-from", text: "—— " + cfg.from }) : null
    ]));
    parts.push(el("div", { class: "end-buttons" }, [
      B.button("🎵 再聽一次", () => B.playMelody(), "yellow"),
      B.button("🎆 再放煙火", () => fireworks(5000), "green"),
      B.button(B.theme.again, restart, "")
    ]));

    app.replaceChildren(el("div", { class: "screen finale" }, parts));
    window.scrollTo(0, 0);
    setTimeout(() => typewriter(wishText, cfg.wish, 70), 600);
  }

  B.celebrate = function (app, cfg, restart) {
    const { el } = B, F = B.theme.finale;
    let released = false;

    const art = el("div", { class: "sky-lantern-art" });
    art.innerHTML = B.theme.goalSVG(); // 固定圖案，沒有使用者文字
    const label = cfg.name + "\n生日快樂";
    const thing = el("button", { class: "sky-lantern bob", type: "button", "aria-label": F.tip }, [
      art,
      F.inside ? el("span", { class: "sky-lantern-text", text: label }) : null
    ]);
    const tip = el("p", { class: "counter", text: F.tip });

    thing.addEventListener("click", () => {
      if (released) return;
      released = true;
      B.sfx.win();
      tip.textContent = "許個願吧 ✨";
      thing.classList.remove("bob");
      thing.classList.add(F.anim === "fly" ? "fly" : "burst");
      setTimeout(() => finale(app, cfg, restart), F.anim === "fly" ? 2400 : 1300);
    });

    app.replaceChildren(
      el("div", { class: "sign" }, [el("h1", { text: F.title })]),
      el("div", { class: "screen lantern-screen" }, [
        el("p", { class: "lead", text: F.lead }),
        thing,
        F.inside ? null : el("p", { class: "goal-tag", text: label }),
        tip
      ])
    );
    window.scrollTo(0, 0);
  };
})();

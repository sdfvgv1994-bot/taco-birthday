/*
 * 關卡積木：戳氣球
 * 設定：{ type:"balloon", question, count:氣球數量, clue:戳完出現的一句話 }
 * 氣球用 SVG 方塊畫，所以放大也是像素風。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  B.levels = B.levels || {};

  const COLORS = ["#ff5d73", "#ffc400", "#4fd1a1", "#5aa9ff", "#c77dff", "#ff8c42"];

  // 12x16 的像素氣球：1 = 氣球色、2 = 反光、3 = 繩子
  const SHAPE = [
    "...111111...",
    "..11111111..",
    ".1122111111.",
    ".1121111111.",
    "111111111111",
    "111111111111",
    "111111111111",
    ".1111111111.",
    ".1111111111.",
    "..11111111..",
    "...111111...",
    ".....11.....",
    "......3.....",
    ".....3......",
    "......3.....",
    ".....3......"
  ];

  function balloonSVG(color) {
    let rects = "";
    SHAPE.forEach((row, y) => {
      [...row].forEach((c, x) => {
        const fill = c === "1" ? color : c === "2" ? "#fff" : c === "3" ? "#d9d4ff" : null;
        if (fill) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`;
      });
    });
    return `<svg viewBox="0 0 12 16" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  B.levels.balloon = function (stage, level, api) {
    const { el } = B;
    const count = Math.max(1, Math.min(20, parseInt(level.count, 10) || 8));
    let left = count;

    const counter = el("p", { class: "counter", text: `還剩 ${left} 顆` });
    const field = el("div", { class: "balloon-field" });

    // 用格子排位置，避免氣球疊在一起點不到
    const cols = count <= 6 ? 3 : 4;
    const rows = Math.ceil(count / cols);
    for (let i = 0; i < count; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const b = el("button", { class: "balloon", type: "button", "aria-label": "氣球" });
      b.innerHTML = balloonSVG(COLORS[i % COLORS.length]); // 固定的 SVG，沒有使用者文字
      b.style.left = ((col + 0.5) / cols * 100 + (Math.random() * 10 - 5)) + "%";
      b.style.top = ((row + 0.5) / rows * 100 + (Math.random() * 8 - 4)) + "%";
      b.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
      b.style.animationDuration = (2 + Math.random() * 1.5).toFixed(2) + "s";
      b.addEventListener("click", () => {
        if (b.classList.contains("popped")) return;
        b.classList.add("popped");
        B.sfx.pop();
        left--;
        counter.textContent = left > 0 ? `還剩 ${left} 顆` : "全部戳破了！";
        if (left === 0) setTimeout(reveal, 450);
      });
      field.appendChild(b);
    }

    function reveal() {
      field.replaceChildren(el("div", { class: "clue pop-in" }, [
        el("p", { class: "clue-label", text: "氣球裡藏著一句話：" }),
        el("p", { class: "clue-text", text: level.clue || "生日快樂！" })
      ]));
      stage.appendChild(B.button(B.theme.next, () => api.pass(true), "green wide"));
      B.sfx.ok();
    }

    stage.appendChild(el("div", { class: "card" }, [
      el("p", { class: "question", text: level.question || "把氣球全部戳破！" })
    ]));
    stage.appendChild(counter);
    stage.appendChild(field);
  };
})();

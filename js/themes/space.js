/* 主題：太空 —— 火箭飛過一顆顆星球，最後抵達生日星 */
(function () {
  const B = window.Bday, { svg, pen, pic } = B.px;
  const PLANETS = {
    fire: { base: "#e8573a", dark: "#a8321f", light: "#ffb38a", spot: "#ffcf4a" },
    ring: { base: "#e8b85a", dark: "#b07f2a", light: "#ffe2a0", ring: "#f4f1e6" },
    ice: { base: "#7fd0f0", dark: "#3f8fc0", light: "#e3f8ff", spot: "#ffffff" },
    green: { base: "#4fd1a1", dark: "#2a8f6b", light: "#b8f5dc", spot: "#2f7de0" },
    purple: { base: "#a66bff", dark: "#6a3fc0", light: "#dcc4ff", ring: "#ff8fab" }
  };

  B.themes.space = {
    name: "太空冒險", suffix: "的生日星際之旅", unit: "站",
    order: ["fire", "ring", "ice", "green", "purple"],
    styles: { fire: "火球星", ring: "土黃環星", ice: "冰晶星", green: "綠洲星", purple: "紫霧星" },
    places: ["火球星", "環環星", "冰晶星", "綠洲星", "紫霧星"],
    placeHint: "例如：珍奶星",
    intro: { lead: n => `${n} 艦長，準備升空！`, sub: k => `探索 ${k} 顆星球、航行紀錄全部點亮，\n就能抵達生日星 ⭐`, start: "點火升空 ▶", resume: "繼續航行 ▶" },
    labels: { closed: "未探索", open: "下一站", cleared: "已登陸" },
    card: { title: "航行紀錄", mark: "★" },
    nextTip: p => `下一站 ▶ ${p}`, doneTip: "全部探索完畢！飛向生日星 ⭐",
    closedToast: p => `燃料不夠飛這麼遠，先去「${p}」`, clearedToast: "這顆星球已經登陸過囉",
    goal: { name: "生日星", ready: "降落生日星", notYet: k => `還有 ${k} 顆星球沒探索` },
    pass: { big: "★", small: "登陸成功！" }, full: "任務完成", back: "← 回星圖", next: "回太空船 ▶",
    lock: { label: "艙 門 密 碼", question: "請輸入艙門密碼" },
    finale: { title: "抵達生日星", lead: "整個宇宙最亮的一顆星，是你的！", tip: "點一下星星，許個願", anim: "open" },
    again: "🔁 再飛一次",

    nodeSVG(style) {
      const p = PLANETS[style] || PLANETS.fire;
      const r = pen();
      for (let y = -10; y <= 10; y++) for (let x = -10; x <= 10; x++) {
        if (x * x + y * y > 104) continue;
        r(16 + x, 13 + y, 1.02, 1.02, x + y > 7 ? p.dark : x + y < -9 ? p.light : p.base);
      }
      if (p.spot) { r(11, 9, 3, 2, p.spot); r(18, 15, 4, 2, p.spot); r(13, 18, 2, 1, p.spot); r(20, 8, 2, 2, p.dark); }
      if (p.ring) { r(1, 13, 30, 2, p.ring); r(3, 15, 26, 1, "rgba(0,0,0,.25)"); r(4, 12, 3, 1, p.ring); r(25, 12, 3, 1, p.ring); }
      return svg(32, 26, r.done());
    },
    decoA: () => pic(8, 8, ["...1....", "..111...", "...1..2.", "........", ".2......", ".....1..", "....111.", ".....1.."], { 1: "#ffe27a", 2: "#ffffff" }),
    decoB: () => pic(16, 10, ["....11111.......", "..111111111.....", ".11121111111....", ".111111112111...", "1111211111111...", ".111111111111...", "..1111121111....", "....111111......"], { 1: "#8a93ad", 2: "#5a6380" }),
    goalSVG: () => pic(15, 13, [
      ".......1.......", "......111......", "......121......", ".....11211.....", "111111121111111", ".1112222221111.", "..11122221111..",
      "...111111111...", "...111111111...", "..11111.11111..", "..1111...1111..", ".111.......111.", ".1...........1."
    ], { 1: "#ffcf4a", 2: "#fff3b0" }),
    walkerSVG: () => pic(8, 12, ["...11...", "..1111..", "..1221..", "..1221..", ".111111.", ".111111.", "31111113", "33111133", "3.1111.3", "...44...", "..4554..", "...44..."],
      { 1: "#f4f1e6", 2: "#5aa9ff", 3: "#e23a3a", 4: "#ff9a3a", 5: "#ffe27a" })
  };
})();

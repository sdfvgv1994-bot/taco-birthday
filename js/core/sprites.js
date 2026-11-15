/*
 * 積木：像素畫筆
 * 所有圖都用程式畫成 SVG 方塊，沒有圖片檔。各主題的圖放在 js/themes/ 裡，
 * 這裡只提供共用的畫圖工具。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  B.themes = B.themes || {};

  function svg(w, h, body) {
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`;
  }
  // 小畫筆：r(x, y, 寬, 高, 顏色)
  function pen() {
    const out = [];
    const r = (x, y, w, h, c) => out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
    r.done = () => out.join("");
    return r;
  }
  // 從文字圖畫：每個字元對應一個顏色，(ox, oy) 是起點，s 是放大倍數
  function rows(r, list, colors, ox, oy, s) {
    s = s || 1;
    list.forEach((row, y) => [...row].forEach((ch, x) => {
      if (colors[ch]) r((ox || 0) + x * s, (oy || 0) + y * s, s + 0.02, s + 0.02, colors[ch]);
    }));
  }
  // 直接把文字圖變成一張 SVG
  function pic(w, h, list, colors) {
    const r = pen();
    rows(r, list, colors, 0, 0);
    return svg(w, h, r.done());
  }
  B.px = { svg, pen, rows, pic };
})();

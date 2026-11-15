/*
 * 積木：資料
 * 負責把設定「打包成網址」和「從網址拆回來」，以及補上預設值。
 * 為什麼放網址？因為這樣不需要伺服器，連結本身就帶著全部內容。
 */
(function () {
  const B = (window.Bday = window.Bday || {});

  function toB64url(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function fromB64url(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  // 開頭字母代表格式：z = 有壓縮（網址比較短），j = 沒壓縮（舊瀏覽器用）
  B.encodeConfig = async function (cfg) {
    const raw = new TextEncoder().encode(JSON.stringify(cfg));
    if (typeof CompressionStream !== "undefined") {
      try {
        return "z" + toB64url(await pipe(raw, new CompressionStream("deflate-raw")));
      } catch (e) { /* 改用不壓縮 */ }
    }
    return "j" + toB64url(raw);
  };

  B.decodeConfig = async function (code) {
    const kind = code.charAt(0);
    let bytes = fromB64url(code.slice(1));
    if (kind === "z") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    else if (kind !== "j") throw new Error("unknown format");
    return JSON.parse(new TextDecoder().decode(bytes));
  };

  // 比對答案前先整理：全形轉半形、英文轉小寫、去掉空白
  B.normAnswer = function (s) {
    return String(s == null ? "" : s).normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  };

  function str(v, d) { return typeof v === "string" ? v : d; }

  B.normalize = function (cfg) {
    cfg = cfg && typeof cfg === "object" ? cfg : {};
    const name = str(cfg.name, "").trim() || "壽星";
    const levels = (Array.isArray(cfg.levels) ? cfg.levels : [])
      .filter(l => l && B.levels && B.levels[l.type])
      .slice(0, 10);
    const theme = B.themes[cfg.theme] ? cfg.theme : "night";
    return {
      name,
      theme,
      title: str(cfg.title, "").trim() || name + B.themes[theme].suffix,
      from: str(cfg.from, "").trim(),
      levels,
      wish: str(cfg.wish, "生日快樂！"),
      // 只接受 https/http 網址或相對路徑，避免奇怪的連結
      photos: (Array.isArray(cfg.photos) ? cfg.photos : [])
        .map(p => String(p).trim())
        .filter(p => /^(https?:\/\/\S+|[^\s:"'<>]+)$/i.test(p))
        .slice(0, 20)
    };
  };

  B.loadConfig = async function () {
    const m = location.hash.match(/[#&]d=([^&]+)/);
    if (m) {
      try {
        return B.normalize(await B.decodeConfig(m[1]));
      } catch (e) {
        console.warn(e);
        B.loadError = true;
      }
    }
    // 試玩用：網址加 #theme=space 之類，可以用範例內容看別的主題
    const t = location.hash.match(/[#&]theme=(\w+)/);
    if (t && B.themes[t[1]]) {
      const demo = JSON.parse(JSON.stringify(window.BIRTHDAY_CONFIG));
      demo.theme = t[1];
      (demo.levels || []).forEach(l => { delete l.place; delete l.style; });
      return B.normalize(demo);
    }
    return B.normalize(window.BIRTHDAY_CONFIG);
  };
})();

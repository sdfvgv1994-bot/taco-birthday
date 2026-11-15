/*
 * 積木：音效
 * 用瀏覽器內建的 Web Audio 即時合成 8-bit 音效，不需要任何音檔。
 * 手機規定要「使用者點過畫面」才能出聲，所以在按「開始」時呼叫 unlock()。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  let ctx = null;
  let muted = false;
  let melodyTimer = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  let melodyNodes = [];

  function tone(freq, start, dur, type, vol, track) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime + start;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(vol || 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
    if (track) melodyNodes.push(o);
  }

  function slide(f1, f2, dur, type, vol) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol || 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  B.sfx = {
    unlock() { ac(); },
    isMuted() { return muted; },
    toggle() { muted = !muted; if (muted) B.stopMelody(); return muted; },
    click() { tone(660, 0, 0.05, "square", 0.04); },
    key() { tone(880, 0, 0.04, "square", 0.04); },
    ok() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.12)); },
    wrong() { tone(196, 0, 0.12, "square", 0.07); tone(147, 0.12, 0.2, "square", 0.07); },
    pop() { slide(900, 120, 0.12, "triangle", 0.12); },
    puff() { slide(400, 80, 0.25, "sawtooth", 0.03); },
    unlockLock() { tone(1200, 0, 0.05); tone(1500, 0.06, 0.12); },
    win() { [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.16)); }
  };

  // 〈Happy Birthday to You〉旋律（美國法院 2016 年判定為公共領域）
  const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
  const SONG = [
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
    ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3]
  ];

  B.playMelody = function () {
    B.stopMelody();
    const beat = 0.42;
    let t = 0;
    SONG.forEach(([n, len]) => {
      tone(N[n], t, len * beat * 0.95, "square", 0.06, true);
      tone(N[n] / 2, t, len * beat * 0.9, "triangle", 0.05, true);
      t += len * beat;
    });
    melodyTimer = setTimeout(() => { melodyTimer = null; melodyNodes = []; }, t * 1000 + 200);
  };

  // 停掉正在播的歌（不關閉音效系統，iPhone 才不會之後變無聲）
  B.stopMelody = function () {
    if (melodyTimer) clearTimeout(melodyTimer);
    melodyTimer = null;
    melodyNodes.forEach(o => { try { o.stop(); } catch (e) { /* 已經停了 */ } });
    melodyNodes = [];
  };
})();

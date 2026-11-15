/*
 * 關卡積木：選擇題
 * 設定：{ type:"choice", question, options:[...], answer:正確答案的位置(0 開始), hint }
 * 每個關卡積木都長一樣：接收 (stage, level, api)，過關時呼叫 api.pass()。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  B.levels = B.levels || {};

  B.levels.choice = function (stage, level, api) {
    const { el } = B;
    const options = (level.options || []).filter(o => String(o).trim() !== "");
    const answer = parseInt(level.answer, 10) || 0;
    let wrongCount = 0;

    const hintBox = el("p", { class: "hint", text: "" });
    const list = el("div", { class: "choices" });

    options.forEach((opt, i) => {
      const btn = el("button", { class: "px-btn choice", type: "button" }, [
        el("span", { class: "choice-mark", text: "ABCDEF"[i] || "?" }),
        el("span", { text: String(opt) })
      ]);
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        if (i === answer) {
          btn.classList.add("right");
          list.querySelectorAll("button").forEach(b => (b.disabled = true));
          api.pass();
        } else {
          wrongCount++;
          btn.disabled = true;
          btn.classList.add("bad");
          B.replay(btn, "shake");
          api.fail();
          if (level.hint && wrongCount >= 1) hintBox.textContent = "💡 提示：" + level.hint;
        }
      });
      list.appendChild(btn);
    });

    stage.appendChild(el("div", { class: "card" }, [
      el("p", { class: "question", text: level.question || "選一個答案" })
    ]));
    stage.appendChild(list);
    stage.appendChild(hintBox);
  };
})();

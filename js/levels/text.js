/*
 * 關卡積木：填空題
 * 設定：{ type:"text", question, answers:["寫法一","寫法二"], hint }
 * 比對時會忽略空白、大小寫、全形半形，避免對方明明答對卻被判錯。
 */
(function () {
  const B = (window.Bday = window.Bday || {});
  B.levels = B.levels || {};

  B.levels.text = function (stage, level, api) {
    const { el } = B;
    const answers = (Array.isArray(level.answers) ? level.answers : [level.answers])
      .map(B.normAnswer)
      .filter(Boolean);
    let wrongCount = 0;

    const input = el("input", {
      class: "px-input",
      type: "text",
      placeholder: "在這裡輸入答案",
      autocomplete: "off",
      enterkeyhint: "done"
    });
    const hintBox = el("p", { class: "hint", text: "" });
    const box = el("div", { class: "answer-row" });

    function check() {
      const v = B.normAnswer(input.value);
      if (!v) { B.replay(box, "shake"); return; }
      if (answers.includes(v)) {
        input.disabled = true;
        input.classList.add("right");
        api.pass();
      } else {
        wrongCount++;
        B.replay(box, "shake");
        api.fail();
        input.select();
        if (level.hint && wrongCount >= 2) hintBox.textContent = "💡 提示：" + level.hint;
        else hintBox.textContent = "不對喔，再想想～";
      }
    }

    input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
    box.appendChild(input);
    box.appendChild(B.button("確定", check, "green"));

    stage.appendChild(el("div", { class: "card" }, [
      el("p", { class: "question", text: level.question || "請輸入答案" })
    ]));
    stage.appendChild(box);
    stage.appendChild(hintBox);
    setTimeout(() => input.focus({ preventScroll: true }), 400);
  };
})();

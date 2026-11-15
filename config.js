/*
 * 生日大冒險 設定檔
 * ------------------------------------------------------------
 * 想做自己的版本，有兩種方法：
 *   1. 最簡單：打開 create.html（產生器），填完表單就有分享連結，不用改這個檔案。
 *   2. 想放自己的照片：fork 這個專案，把照片丟進 photos/ 資料夾，然後改下面的內容。
 *
 * theme 主題：night 夜市、delivery 外送送禮、space 太空冒險、paper 手作卡片
 *
 * 每一關都是路線上的一站，可以加這兩個設定（都可以不填）：
 *   place  站點名稱，例如 "阿宇的雞排攤"
 *   style  圖案，每個主題不一樣：
 *          night    chicken boba dart ring pinball sausage cotton
 *          delivery drink bento cake flower parcel
 *          space    fire ring ice green purple
 *          paper    heart star cake balloon flower
 *
 * 關卡類型（type）：
 *   "choice"  選擇題   question, options[], answer（正確答案是第幾個，從 0 開始算）, hint
 *   "text"    填空題   question, answers[]（可以放好幾種寫法，都算對）, hint
 *   "balloon" 戳氣球   question, count（氣球數量）, clue（戳完會出現的一句話）
 *   "lock"    數字密碼   question, password（只能是數字）, hint
 */
window.BIRTHDAY_CONFIG = {
  theme: "night",               // 主題
  name: "小明",                 // 壽星名字（會出現在標題和最後的祝福）
  title: "",                    // 標題，留空會照主題自動取名
  from: "你的好朋友",            // 署名

  levels: [
    {
      type: "choice",
      place: "雞排攤",
      style: "chicken",
      question: "我們第一次見面是在哪裡？",
      options: ["學校", "朋友的生日派對", "打工的地方", "網路上"],
      answer: 1,
      hint: "那天也有蛋糕喔"
    },
    {
      type: "text",
      place: "珍奶攤",
      style: "boba",
      question: "我最常叫你的綽號是什麼？",
      answers: ["小明明", "明明"],
      hint: "兩個字疊在一起"
    },
    {
      type: "balloon",
      place: "射氣球",
      style: "dart",
      question: "把氣球全部戳破，裡面藏著一句話！",
      count: 8,
      clue: "你是我最重要的人之一 ❤"
    },
    {
      type: "choice",
      place: "烤香腸",
      style: "sausage",
      question: "我最愛吃的宵夜是？",
      options: ["鹹酥雞", "滷味", "泡麵", "麥當勞"],
      answer: 0,
      hint: "炸的！"
    },
    {
      type: "lock",
      place: "取餐處",
      style: "pinball",
      question: "",
      password: "1104",
      hint: "你的生日（月＋日，4 個數字）"
    }
  ],

  wish: "生日快樂！\n謝謝你這一年一直在我身邊，\n願你新的一歲每天都開開心心，\n想做的事都能順利完成。\n今天你最大！",

  // 照片：放在 photos/ 資料夾裡，或填網路上的圖片網址（https://...）
  photos: []
};

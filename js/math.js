let currentQuestionIndex = 0;
const totalQuestions = 10;
let currentQuestion = 0;
const optionLetters = ["A", "B", "C", "D"];
let userAnswers = [];
let studentName = getStudentNameFromURL();

const questionText = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

const soundCorrect = new Audio("sounds/correct.wav");
const soundWrong = new Audio("sounds/wrong.wav");
soundCorrect.volume = 0.3;
soundWrong.volume = 0.3;
let soundEnabled = true;
const soundToggle = document.getElementById("sound-toggle");

const questions = [
  {
    question: "What is 7 + 5?",
    options: ["11", "12", "13", "14"],
    correctAnswer: "12"
  },
  {
    question: "What is 15 - 6?",
    options: ["8", "9", "10", "11"],
    correctAnswer: "9"
  },
  {
    question: "What is 4 × 3?",
    options: ["12", "14", "16", "18"],
    correctAnswer: "12"
  },
  {
    question: "What is 20 ÷ 5?",
    options: ["2", "4", "5", "6"],
    correctAnswer: "4"
  },
  {
    question: "What is 9 + 8?",
    options: ["16", "17", "18", "19"],
    correctAnswer: "17"
  },
  {
    question: "What is 13 - 7?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6"
  },
  {
    question: "What is 6 × 2?",
    options: ["10", "11", "12", "13"],
    correctAnswer: "12"
  },
  {
    question: "What is 18 ÷ 3?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6"
  },
  {
    question: "What is 7 × 1?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "7"
  },
  {
    question: "What is 12 ÷ 4?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3"
  },
];

function renderQuestionTracker() {
  const tracker = document.getElementById("question-tracker");
  tracker.innerHTML = "";

  for (let i = 0; i < totalQuestions; i++) {
    const box = document.createElement("div");
    box.className = "tracker-box";
    box.innerText = i + 1;
    if (i === currentQuestion) {
        box.classList.add("active");
    }
    tracker.appendChild(box);
  }
}

function showQuestion() {
  // 清空画面
  optionsContainer.innerHTML = "";

  // 取当前题
  const q = questions[currentQuestionIndex];
  questionText.textContent = q.question;

  // 选项乱序
  const shuffledOptions = q.options.slice().sort(() => Math.random() - 0.5);
  const correct = q.correctAnswer;

  // 存一下本题所有按钮和小标记，方便后面处理
  const btns = [];
  const marks = [];

  // 渲染选项
  for (let i = 0; i < shuffledOptions.length; i++) {
    const option = shuffledOptions[i];
    const letter = optionLetters[i]; // A/B/C/D

    // 每行容器
    const row = document.createElement("div");
    row.className = "option-row"; // 可选：你也可以不用这个类

    // 选项按钮
    const btn = document.createElement("button");
    btn.classList.add("option-button");
    // 显示 A. 7 这种
    btn.innerText = `${letter}. ${option}`;

    // ✅/❌ 标记（放在按钮里面，固定在右侧）
    const mark = document.createElement("span");
    mark.className = "answer-indicator";
    mark.textContent = ""; // 点击后再填

    // 点击选项：记录答案 + 恢复你原本“选中变绿”的样式
    btn.onclick = function () {
      const selectedAnswer = btn.innerText.replace(/^.*?\.\s*/, "");
      userAnswers[currentQuestionIndex] = selectedAnswer;

      // 移除所有已选
      btns.forEach(b => b.classList.remove("selected"));
      // 当前按钮加 selected（你 CSS 里本来就有“选中变绿”的样式）
      btn.classList.add("selected");
    };

    // 组装
    row.appendChild(btn);
    btn.appendChild(mark);   // 关键：把标记放进按钮内部
    optionsContainer.appendChild(row);

    btns.push(btn);
    marks.push(mark);
  }

  // ==== Check 区块 ====
  const checkWrap = document.createElement("div");
  checkWrap.className = "check-wrap";

  const checkBtn = document.createElement("button");
  checkBtn.className = "check-button";
  checkBtn.textContent = "Check Answer";

  const note = document.createElement("p");
  note.className = "check-note";
  note.innerHTML = 'Once checked, you can’t change your answer.';

  checkWrap.appendChild(checkBtn);
  checkWrap.appendChild(note);
  optionsContainer.appendChild(checkWrap);

  // === Check 逻辑：显示 ✅/❌ 并锁定（不用 disabled）===
  checkBtn.onclick = function () {
    const selected = userAnswers[currentQuestionIndex];
    if (!selected) {
      alert("Please select an answer before checking.");
      return;
    }

    // 清空所有小标记
    marks.forEach(m => {
      m.textContent = "";
      m.classList.remove("show", "correct", "incorrect");
    });

    // 找到被选的那个 index
    let selectedIdx = -1;
    btns.forEach((b, idx) => {
      const txt = b.innerText.replace(/^.*?\.\s*/, "");
      if (txt === selected) selectedIdx = idx;
    });

    // 对/错标记
    if (selected === correct) {
      marks[selectedIdx].textContent = "✅";
      marks[selectedIdx].classList.add("show", "correct");
      soundCorrect.currentTime = 0;
      playSound(soundCorrect);
    } else {
      marks[selectedIdx].textContent = "❌";
      marks[selectedIdx].classList.add("show", "incorrect");
      soundWrong.currentTime = 0;
      playSound(soundWrong);
      // 把正确项也标出来
      btns.forEach((b, idx) => {
        const txt = b.innerText.replace(/^.*?\.\s*/, "");
        if (txt === correct) {
          marks[idx].textContent = "✅";
          marks[idx].classList.add("show", "correct");
        }
      });
    }

    // 锁定：不用 disabled，避免变灰
    btns.forEach(b => {
      b.classList.add("locked");                // CSS 里定义 pointer-events:none;
      b.setAttribute("aria-disabled", "true");  // 语义
      b.tabIndex = -1;                          // 键盘也不可聚焦
    });
    checkBtn.classList.add("locked");
    checkBtn.setAttribute("aria-disabled", "true");
    checkBtn.tabIndex = -1;
  };
}

soundToggle.onclick = function() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
};

function playSound(audio) {
    if (!soundEnabled) return;
    audio.currentTime = 0;
    audio.play();
}

function calculateScore() {
  let correct = 0;
  userAnswers.forEach((ans, i) => {
    if (ans === questions[i].correctAnswer) correct++;
  });
  return correct;
}

function handleNext() {
    if (!userAnswers[currentQuestionIndex]) {
        alert("Please select an answer before next quiz.");
        return;
      }
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {      
      currentQuestion++;
      if (currentQuestion < totalQuestions) {
          renderQuestionTracker();
      }
      showQuestion();
    } else {
        // —— 做完最后一题 ——
        const total   = questions.length;
        const score   = calculateScore();                     // ✅ 用回函数统计
        const percent = Math.round((score / total) * 100);

        // 标题与内容收尾
        if (questionText) questionText.textContent = "Quiz Completed!";
        if (optionsContainer) optionsContainer.innerHTML = "";

        // 上报成绩（保留你的 Apps Script 逻辑）
        submitToGoogleSheet(studentName, score);

        // 分数面板
        const panel = document.createElement("div");
        panel.className = "summary-panel";
        panel.innerHTML = `
          <div class="score-line">Your Score: <span class="score">${score} / ${total}</span> (${percent}%)</div>
          <div class="msg">${getPraiseMessage(percent)}</div>
        `;
        panel.innerHTML += `
          <div id="feedback-section">
            <p>How difficult was this quiz?</p>
            <div id="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <button id="submit-feedback">Submit Feedback</button>
          </div>
        `;

        // 稳健插入：优先放在题号条上方，找不到就放容器末尾
        const container = document.getElementById("quiz-container");
        const tracker   = document.getElementById("question-tracker");

        if (tracker && tracker.parentNode) {
          tracker.parentNode.insertBefore(panel, tracker);
        } else if (container) {
          container.appendChild(panel);
        } else {
          document.body.appendChild(panel); // 兜底：至少让它出现
        }

        if (tracker) tracker.style.display = "none";

        // 初始化星星点击
        const feedbackStars  = panel.querySelectorAll('#stars span');
        const feedbackBtn = panel.querySelector('#submit-feedback');
        let fb = 0;

        if (feedbackStars.length) {
          feedbackStars.forEach((star, idx) => {
            star.addEventListener('click', () => {
              fb = idx + 1;
              feedbackStars.forEach((s, i) => s.classList.toggle('active', i <= idx));
            });
          });
        }
        if (feedbackBtn) {
          feedbackBtn.addEventListener('click', () => {
            if (fb === 0) {
              alert("Please select at least one star before submitting!");
              return;
            }
            submitFeedbackOnly(fb);
            feedbackBtn.disabled = true;
            feedbackBtn.textContent = "Submitted ✔";
          });
        }

        // 切换按钮：隐藏 Next，显示 Home
        const nextBtnEl = document.getElementById("next-btn");
        if (nextBtnEl) nextBtnEl.style.display = "none";

        const homeBtn = document.getElementById("home-btn");
        if (homeBtn) {
          homeBtn.style.display = "block";
          homeBtn.textContent = "Return to Home";
          homeBtn.onclick = () => { window.location.href = "index.html"; };
        }

        // 若有 Check 区域残留，隐藏
        const checkWrap = document.querySelector(".check-wrap");
        if (checkWrap) checkWrap.style.display = "none";
      }
}

function getPraiseMessage(percent){
  if (percent === 100) return "( Perfect! )";
  if (percent >= 80)  return "( Great job! )";
  if (percent >= 60)  return "( Good try! )";
  return "( Keep practicing! )";
}

function getStudentNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || "UnknownStudent";
}

function submitToGoogleSheet(name, score) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbyeqvCaljDDQP8eIhCOjwBdTDzu4JA7_ypAK_9yg-sJZlLhq4IU2d8gIOooxpnUUgPt/exec";
  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      name: name,
      score: score,
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function submitFeedbackOnly(feedback) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzsuM-4VoJZ5RXZMHEDsMfILR4D_k4s-qyxciUZbfYHnfZBR5ydwl-uGwd-iVd9rHrv/exec";
  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feedback: Number(feedback) || 0
    }),
  });
}

renderQuestionTracker();
questions.sort(() => Math.random() - 0.5);
showQuestion()
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
  optionsContainer.innerHTML = "";

  const q = questions[currentQuestionIndex];
  questionText.textContent = q.question;

  const shuffledOptions = q.options.slice().sort(() => Math.random() - 0.5);
  const correct = q.correctAnswer;

  const btns = [];
  const marks = [];

  // render option
  for (let i = 0; i < shuffledOptions.length; i++) {
    const option = shuffledOptions[i];
    const letter = optionLetters[i]; // A/B/C/D

    const row = document.createElement("div");
    row.className = "option-row";

    const btn = document.createElement("button");
    btn.classList.add("option-button");
    btn.innerText = `${letter}. ${option}`;

    // ✅/❌ marking
    const mark = document.createElement("span");
    mark.className = "answer-indicator";
    mark.textContent = "";

    btn.onclick = function () {
      const selectedAnswer = btn.innerText.replace(/^.*?\.\s*/, "");
      userAnswers[currentQuestionIndex] = selectedAnswer;

      // Remove all selected
      btns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    };

    row.appendChild(btn);
    btn.appendChild(mark);
    optionsContainer.appendChild(row);

    btns.push(btn);
    marks.push(mark);
  }

  // ==== Check block ====
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

  checkBtn.onclick = function () {
    const selected = userAnswers[currentQuestionIndex];
    if (!selected) {
      alert("Please select an answer before checking.");
      return;
    }

    // Clear all small markers
    marks.forEach(m => {
      m.textContent = "";
      m.classList.remove("show", "correct", "incorrect");
    });

    // Find the selected index
    let selectedIdx = -1;
    btns.forEach((b, idx) => {
      const txt = b.innerText.replace(/^.*?\.\s*/, "");
      if (txt === selected) selectedIdx = idx;
    });

    if (selected === correct) {
      fireworkOnce();
      marks[selectedIdx].textContent = "✅";
      marks[selectedIdx].classList.add("show", "correct");
      soundCorrect.currentTime = 0;
      playSound(soundCorrect);
    } else {
      marks[selectedIdx].textContent = "❌";
      marks[selectedIdx].classList.add("show", "incorrect");
      soundWrong.currentTime = 0;
      playSound(soundWrong);
      // Mark the correct option.
      btns.forEach((b, idx) => {
        const txt = b.innerText.replace(/^.*?\.\s*/, "");
        if (txt === correct) {
          marks[idx].textContent = "✅";
          marks[idx].classList.add("show", "correct");
        }
      });
    }

    btns.forEach(b => {
      b.classList.add("locked");
      b.setAttribute("aria-disabled", "true");
      b.tabIndex = -1;
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
        // —— last question ——
        const total   = questions.length;
        const score   = calculateScore();
        const percent = Math.round((score / total) * 100);

        if (questionText) questionText.textContent = "Quiz Completed!";
        if (optionsContainer) optionsContainer.innerHTML = "";

        submitToGoogleSheet(studentName, score);

        // score panel
        const panel = document.createElement("div");
        panel.className = "summary-panel";
        panel.innerHTML = `
          <div class="score-line">Your Score: <span class="score">${score} / ${total}</span> (${percent}%)</div>
          <div class="msg">${getPraiseMessage(percent)}</div>
        `;
        panel.innerHTML += `
          <div id="feedback-section">
            <p>How difficult was this quiz?</p>
            <div id="levels">
              <span>🧱</span><span>🧱</span><span>🧱</span><span>🧱</span><span>🧱</span>
            </div>
            <button id="submit-feedback">Submit Feedback</button>
          </div>
        `;
        panel.innerHTML += `
          <div id="review-section" style="margin-top:14px;">
            <button id="toggle-review" class="review-btn">Show Question Review</button>
            <div id="review-list" style="display:none; margin-top:10px;"></div>
          </div>
        `;

        const container = document.getElementById("quiz-container");
        const tracker   = document.getElementById("question-tracker");

        if (tracker && tracker.parentNode) {
          tracker.parentNode.insertBefore(panel, tracker);
        } else if (container) {
          container.appendChild(panel);
        } else {
          document.body.appendChild(panel);
        }

        if (tracker) tracker.style.display = "none";

        // ini
        const feedbackStars  = panel.querySelectorAll('#levels span');
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
        // ===== Review (Question-by-question) =====
        const toggleReviewBtn = panel.querySelector("#toggle-review");
        const reviewList = panel.querySelector("#review-list");

        if (toggleReviewBtn && reviewList) {
          toggleReviewBtn.addEventListener("click", () => {
            const isOpen = reviewList.style.display === "block";
            reviewList.style.display = isOpen ? "none" : "block";
            toggleReviewBtn.textContent = isOpen ? "Show Question Review" : "Hide Question Review";

            // 第一次打开才生成内容
            if (!isOpen && reviewList.innerHTML.trim() === "") {
              let html = `<ol style="padding-left:18px; margin:0;">`;

              for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const yourAns = userAnswers[i] ?? "-";
                const correctAns = q.correctAnswer;
                const ok = yourAns === correctAns;

                html += `
                  <li style="margin:6px 0;">
                    <div><strong>Q${i + 1} ${ok ? "✅" : "❌"}</strong></div>
                    <div>${q.question}</div>
                    <div>Your answer: <strong>${yourAns}</strong></div>
                    <div>Correct answer: <strong>${correctAns}</strong></div>
                  </li>
                `;
              }

              html += `</ol>`;
              reviewList.innerHTML = html;
            }
          });
        }


        const nextBtnEl = document.getElementById("next-btn");
        if (nextBtnEl) nextBtnEl.style.display = "none";

        const homeBtn = document.getElementById("home-btn");
        if (homeBtn) {
          homeBtn.style.display = "block";
          homeBtn.textContent = "Return to Home";
          homeBtn.onclick = () => { window.location.href = "index.html"; };
        }

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

function fireworkOnce(){
  const fw = document.getElementById("firework");
  if(!fw) return;
  fw.classList.remove("play");
  void fw.offsetWidth;
  fw.classList.add("play");
}


renderQuestionTracker();
questions.sort(() => Math.random() - 0.5);
showQuestion()
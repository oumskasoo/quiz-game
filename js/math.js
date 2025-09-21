let currentQuestionIndex = 0;
const totalQuestions = 10;
let currentQuestion = 0;
const optionLetters = ["A", "B", "C", "D"];
let userAnswers = [];
let studentName = getStudentNameFromURL();

const questionText = document.getElementById("question-text")
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

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
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    const shuffledOptions = currentQuestion.options.sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledOptions.length; i++) {
        let option = shuffledOptions[i];
        let letter = optionLetters[i]; // A, B, C, D

        let btn = document.createElement("button");
        btn.innerText = `${letter}. ${option}`; // A. 选项

        btn.onclick = function () {
          const allButtons = document.querySelectorAll(".option-button");
          allButtons.forEach((b) => {
              b.classList.remove("selected");
          });

          btn.classList.add("selected");

          // remove A.）
          const selectedAnswer = btn.innerText.replace(/^.*?\.\s*/, ""); 
          userAnswers[currentQuestionIndex] = selectedAnswer;
        };

        btn.classList.add("option-button");

        optionsContainer.appendChild(btn);
    }
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
        questionText.textContent = "Quiz Completed!";
        optionsContainer.innerHTML = "";
        let score = calculateScore();
        submitToGoogleSheet(studentName, score);
        document.getElementById("next-btn").style.display = "none";
        document.getElementById("home-btn").style.display = "block";
    }
}

function getStudentNameFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("name") || "UnknownStudent";
}

function submitToGoogleSheet(name, score) {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwPnGOeHQUz3Ori2zGKILPaIBZdAYb_wBu7abmIzDt5CxJQ29_h1oR6CN64Q-RXUR9_/exec";
  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({
      name: name,
      score: score
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

renderQuestionTracker();
questions.sort(() => Math.random() - 0.5);
showQuestion()
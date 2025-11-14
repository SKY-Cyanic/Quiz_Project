let questions = [];
let idx = 0;
let correctAnswers = 0;
let currentScore = 0;
let timeUpdateHandler = null;

const CRITERIA = [
    "'특효', '100% 효과보장' 등 지나치게 장담하는 문구가 포함되었나요?",
    "'항암효과,'탈모치료','체중감량' 등 증명 할 수 없는 내용이 있나요?",
    "'공인된 기관'이 아닌 사설기관 등에서 인증 받은 내용이 있나요?",
    "일반 식품이 아닌 건강 기능 식품 표시가 있나요?",
    "SNS 광고내용이 공식 쇼핑몰 광고내용과 같나요?"
];

const QUESTIONS_DATA = [
    {
        "id": 1,
        "type": "image",
        "title": "다이어트 보조제 광고",
        "path": "/static/images/q1.webp",
        "answer": "가짜",
        "hints": [
          "개인적 후기 형식으로 증명하기 어려운 체중 감량 등의 내용이 포함된 광고는 허위, 과장 광고일 확률이 높습니다."
        ],
    },
    {
        "id": 2,
        "type": "image",
        "title": "유명인 사칭 주식 투자 광고",
        "path": "/static/images/q2.webp",
        "answer": "가짜",
        "hints": [
            "100%, 전재산을 걸고 등, 지나치게 확신하는 광고는 허위, 과장 광고일 확률이 높습니다. 최근에는 AI 영상을 이용하여 사기를 치는 경우가 늘고있으니 조심해야 합니다."
        ],
    },
    {
        "id": 3,
        "type": "image",
        "title": "SNS와 공식몰 내용이 다른 광고",
        "path": "/static/images/q3.webp",
        "answer": "가짜",
        "hints": [
            "SNS 광고의 내용과 공식 홈쇼핑의 제품의 효과가 다른경우, 교묘하게 과장된 경우가 많습니다. SNS의 광고가 진실된 내용인지 꼼꼼히 확인해야 합니다."
        ],
    },
    {
        "id": 4,
        "type": "image",
        "title": "탈모 방지 샴푸 광고",
        "path": "/static/images/q4.webp",
        "answer": "가짜",
        "hints": [
            "의학적 효능(탈모 방지)을 내세우는 광고는 허위·과대 광고일 가능성이 높습니다. 식품의약품안전처의 인증을 확인해야 합니다."
        ],
    },
    {
        "id": 5,
        "type": "image",
        "title": "건강기능식품 인증 마크",
        "path": "/static/images/q5.webp",
        "answer": "진짜",
        "hints": [
            "식품의약품안전처에서 인증한 건강기능식품 마크가 있는 제품은 신뢰할 수 있습니다."
        ],
    },
    {
      "id": 6,
        "type": "image",
        "title": "건강기능식품 인증 콜라겐",
        "path": "/static/images/q6.webp",
        "answer": "진짜",
        "hints": [
            "건강기능식품 제품은 효과가 검증된 제품입니다."
        ],
    }
];

// DOM Elements
const scoreValue = document.getElementById("score-value");
const qTitle = document.getElementById("question-title");
const qImage = document.getElementById("quiz-image");
const qVideo = document.getElementById("quiz-video");
const highlightsContainer = document.getElementById("highlights-container");
const trueBtn = document.getElementById("true-btn");
const fakeBtn = document.getElementById("fake-btn");
const feedback = document.getElementById("feedback");
const feedbackMsg = document.getElementById("feedback-msg");
const feedbackTech = document.getElementById("feedback-tech");
const feedbackHints = document.getElementById("feedback-hints");
const nextBtn = document.getElementById("next-btn");
const finalArea = document.getElementById("final-area");
const finalScore = document.getElementById("final-score");
const finalRemark = document.getElementById("final-remark");
const restartBtn = document.getElementById("restart-btn");
const homeBtn = document.getElementById("home-btn");
const startPage = document.getElementById("start-page");
const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz-container");
const criteriaSidebarList = document.getElementById("criteria-sidebar-list");


function populateCriteriaList() {
    criteriaSidebarList.innerHTML = '';
    CRITERIA.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        criteriaSidebarList.appendChild(li);
    });
}

function loadQuestions() {
  questions = QUESTIONS_DATA;
  // questions.sort(() => Math.random() - 0.5); // Shuffle if needed
  populateCriteriaList();
  showQuestion();
}

function clearHighlights() {
  highlightsContainer.innerHTML = "";
}

function renderHighlights(highlights = []) {
  clearHighlights();
  if (!highlights) return;
  highlights.forEach(h => {
    const box = document.createElement("div");
    box.className = "highlight-box";
    box.style.left = h.x + "%";
    box.style.top = h.y + "%";
    box.style.width = h.w + "%";
    box.style.height = h.h + "%";
    highlightsContainer.appendChild(box);
  });
}

function showQuestion() {
  clearHighlights();
  if (idx >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[idx];
  qTitle.textContent = `문제 ${idx + 1}. ${q.title}`;
  feedback.classList.add("hidden");
  
  if (timeUpdateHandler) {
    qVideo.removeEventListener("timeupdate", timeUpdateHandler);
    timeUpdateHandler = null;
  }
  qVideo.pause();

  if (q.type === 'video') {
    qImage.classList.add("hidden");
    qVideo.classList.remove("hidden");
    qVideo.src = q.path;
    qVideo.currentTime = q.time_range ? q.time_range[0] : 0;
    
    timeUpdateHandler = () => {
        if (q.time_range && qVideo.currentTime >= q.time_range[1]) {
            qVideo.currentTime = q.time_range[0];
        }
    };
    qVideo.addEventListener("timeupdate", timeUpdateHandler);
    qVideo.play();
    
  } else {
    qVideo.classList.add("hidden");
    qImage.classList.remove("hidden");
    qImage.src = q.path;
  }
  
  trueBtn.disabled = false;
  fakeBtn.disabled = false;
}

function submitAnswer(userAns) {
  trueBtn.disabled = true;
  fakeBtn.disabled = true;

  const q = questions[idx];
  const correct = (userAns === q.answer);
  
  if (correct) {
    correctAnswers++;
    currentScore = Math.round((correctAnswers / questions.length) * 100);
    scoreValue.textContent = currentScore;
  }
  
  const message = correct ? "정답! 🌟 날카로운 분석력입니다!" : "아쉽습니다! 😥 단서를 더 살펴보세요.";
  
  feedbackMsg.textContent = `${message} (정답: ${q.answer})`;
  feedbackTech.textContent = q.technique || 'N/A';
  feedbackHints.innerHTML = "";
  q.hints.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    feedbackHints.appendChild(li);
  });
  
  renderHighlights(q.highlights);
  feedback.classList.remove("hidden");
}

function finishQuiz() {
  quizContainer.classList.add("hidden");
  finalArea.classList.remove("hidden");
  qVideo.pause();
  
  const finalPercentage = Math.round((correctAnswers / questions.length) * 100);
  finalScore.textContent = `최종 점수: ${finalPercentage}점`;

  if (finalPercentage >= 80) {
    finalRemark.textContent = "허위-과대 광고 탐지 전문가! 당신의 눈은 디지털 위변조를 꿰뚫어 봅니다. 👁️‍🗨️";
  } else if (finalPercentage >= 50) {
    finalRemark.textContent = "좋은 판별 능력입니다! 광고 속 미세한 '오류'에 좀 더 주목해보세요. 👍";
  } else {
    finalRemark.textContent = "주의 깊은 관찰이 필요합니다. 광고를 볼 때 비판적인 시각을 유지하는 연습을 해보세요. 🤔";
  }
}

// Event Listeners
startBtn.addEventListener("click", () => {
    startPage.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    loadQuestions();
});

trueBtn.addEventListener("click", () => submitAnswer("진짜"));
fakeBtn.addEventListener("click", () => submitAnswer("가짜"));

nextBtn.addEventListener("click", () => {
  idx += 1;
  showQuestion();
});

restartBtn.addEventListener("click", () => {
  idx = 0;
  correctAnswers = 0;
  currentScore = 0;
  scoreValue.textContent = currentScore;
  finalArea.classList.add("hidden");
  startPage.classList.remove("hidden");
  quizContainer.classList.add("hidden");
});

homeBtn.addEventListener("click", () => {
    window.location.href = "/";
});
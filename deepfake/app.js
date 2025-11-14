let questions = [];
let idx = 0;
let score = 0;
let timeUpdateHandler = null; // 비디오 시간 업데이트 핸들러 참조

const QUESTIONS_DATA = [
    {
        "id": 1,
        "title": "유명 정치인 A의 공식 석상 클로즈업 사진",
        "type": "image",
        "path": "/static/images/q1.jpg",
        "answer": "가짜",
        "technique": "Face Swap (얼굴 교체)",
        "hints": [
            "얼굴과 목의 피부 톤 불일치",
            "광원/그림자 불일치",
            "눈동자 반사광 불일치"
        ],
        "highlights": [{"x": 35, "y": 12, "w": 28, "h": 30}]
    },
    {
        "id": 2,
        "title": "모델 B가 신제품을 들고 웃는 광고 이미지",
        "type": "image",
        "path": "/static/images/q2.jpg",
        "answer": "가짜",
        "technique": "GAN 기반 이미지 생성",
        "hints": [
            "손가락 모양/개수 비정상",
            "원근법이 깨진 배경",
            "액세서리 주변 픽셀 오류"
        ],
        "highlights": [{"x": 60, "y": 40, "w": 20, "h": 30}]
    },
    {
        "id": 3,
        "title": "유명 배우 C가 입을 벌려 말하는 장면",
        "type": "image",
        "path": "/static/images/q3.jpg",
        "answer": "가짜",
        "technique": "Lip Sync (입술 동기화)",
        "hints": [
            "치아/잇몸 경계가 인공적",
            "입 주변 픽셀 노이즈",
            "안경/머리카락 분리 문제"
        ],
        "highlights": [{"x": 42, "y": 48, "w": 18, "h": 18}]
    },
    {
        "id": 4,
        "title": "맑은 도시 하늘에 구름 이미지",
        "type": "image",
        "path": "/static/images/q4.jpg",
        "answer": "가짜",
        "technique": "Image Compositing (이미지 합성)",
        "hints": [
            "하늘/배경 색감 밝기 불일치",
            "그림자 방향 충돌",
            "노이즈 패턴 차이"
        ],
        "highlights": [{"x": 10, "y": 6, "w": 80, "h": 28}]
    },
    {
        "id": 5,
        "title": "자연광 아래 일반인 D의 평범한 사진",
        "type": "image",
        "path": "/static/images/q5.jpg",
        "answer": "진짜",
        "technique": "원본",
        "hints": [
            "자연스러운 피부 모공",
            "경계선에 픽셀 오류 없음",
            "표정과 근육 움직임 일관"
        ],
        "highlights": []
    },
    {
        "id": 6,
        "title": "고요한 아침, 집중하는 여성의 클로즈업 영상",
        "type": "video",
        "path": "/static/videos/veo3_deepfake1.mp4",
        "time_range": [0, 7.5],
        "answer": "가짜",
        "technique": "고해상도 뉴럴 렌더링 & 미세 표정 생성",
        "hints": [
            "햇빛에 비친 피부 질감과 투과 효과의 자연스러움",
            "카메라가 다가와도 얼굴 형태가 일그러지지 않음",
            "집중하는 표정의 미세한 근육 움직임 구현"
        ],
        "highlights": [{"x": 25, "y": 20, "w": 50, "h": 60}]
    },
    {
        "id": 7,
        "title": "활기찬 회의실, 동료들과 협업하는 영상",
        "type": "video",
        "path": "/static/videos/veo3_deepfake2.mp4",
        "time_range": [8, 15],
        "answer": "가짜",
        "technique": "다중 인물 립싱크 & 동작 생성",
        "hints": [
            "대화에 맞는 자연스러운 입모양과 턱 움직임",
            "여러 인물의 얼굴 특징이 섞이지 않고 유지됨",
            "설명하는 제스처와 신체 움직임이 어색하지 않음"
        ],
        "highlights": [{"x": 40, "y": 30, "w": 25, "h": 35}]
    },
    {
        "id": 8,
        "title": "늦은 밤, 고뇌하는 남성의 영상",
        "type": "video",
        "path": "/static/videos/veo3_deepfake3.mp4",
        "time_range": [15.5, 23],
        "answer": "가짜",
        "technique": "신체-객체 상호작용 & 동적 조명",
        "hints": [
            "손으로 머리를 넘길 때 손가락과 머리카락이 융합되지 않음",
            "모니터 불빛에 따라 얼굴의 그림자가 자연스럽게 변함",
            "좌절감이 느껴지는 고도화된 감정 표정 연기"
        ],
        "highlights": [{"x": 30, "y": 45, "w": 35, "h": 40}]
    }
];

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

function loadQuestions() {
  questions = QUESTIONS_DATA;
  showQuestion();
}

function clearHighlights() {
  highlightsContainer.innerHTML = "";
}

function renderHighlights(highlights = []) {
  clearHighlights();
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
    qVideo.currentTime = q.time_range[0];
    
    timeUpdateHandler = () => {
        if (qVideo.currentTime >= q.time_range[1]) {
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
  const delta = correct ? 10 : -5;
  const message = correct ? "정답! 🌟 날카로운 관찰력입니다!" : "아쉽습니다! 😥 시각적 단서를 더 살펴보세요.";

  score += delta;
  scoreValue.textContent = score;
  feedbackMsg.textContent = `${message} (정답: ${q.answer})`;
  feedbackTech.textContent = q.technique;
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
  document.getElementById("quiz-area").classList.add("hidden");
  finalArea.classList.remove("hidden");
  qVideo.pause();
  finalScore.textContent = `최종 점수: ${score}점`;
  if (score >= 60) {
    finalRemark.textContent = "딥페이크 탐지 전문가! 당신의 눈은 디지털 위변조를 꿰뚫어 봅니다. 👁️‍🗨️";
  } else if (score >= 25) {
    finalRemark.textContent = "좋은 판별 능력입니다! 이미지와 영상의 미세한 '오류'에 좀 더 주목해보세요. 👍";
  } else {
    finalRemark.textContent = "주의 깊은 관찰이 필요합니다. 미디어를 볼 때 비판적인 시각을 유지하는 연습을 해보세요. 🤔";
  }
}

trueBtn.addEventListener("click", () => submitAnswer("진짜"));
fakeBtn.addEventListener("click", () => submitAnswer("가짜"));

nextBtn.addEventListener("click", () => {
  idx += 1;
  showQuestion();
});

restartBtn.addEventListener("click", () => {
  idx = 0;
  score = 0;
  scoreValue.textContent = score;
  finalArea.classList.add("hidden");
  document.getElementById("quiz-area").classList.remove("hidden");
  showQuestion();
});

homeBtn.addEventListener("click", () => {
    window.location.href = "/";
});

loadQuestions();
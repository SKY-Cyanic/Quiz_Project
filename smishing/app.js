let questions = [];
let idx = 0;
let correctAnswers = 0;
let currentScore = 0;

const CRITERIA = [
    "출처가 불분명하거나 낯선 번호인가?",
    "내용과 상관없는 의심스러운 링크를 포함하는가?",
    "자극적인 문구로 링크 클릭을 유도하는가?",
    "정부 기관이나 기업을 사칭하고 있는가?",
    "어법이 어색하거나 오탈자가 있는가?"
];

const QUESTIONS_DATA = [
    {
        "id": 1,
        "sender": "010-9876-5432",
        "content": "[web발신]\n고객님 현재 주문하신 택배가\n배송 불가 상태로 즉시 주소 변경\n부탁드립니다.\n[doggura.kr/3GKJG90]",
        "answer": "스미싱",
        "technique": "의심스러운 링크, 낯선 번호, 클릭 유도",
        "hints": ["의심스러운 링크", "낯선 번호", "클릭 유도"]
    },
    {
        "id": 2,
        "sender": "02-1234-4321",
        "content": "[web발신]\n[긴급재난지원금]\n긴급재난지원금,\n모바일로 간편하게 신청하세요.\n[https://nuver.go/stsd]",
        "answer": "스미싱",
        "technique": "낯선 번호, 의심스러운 링크, 클릭 유도, 기관 사칭",
        "hints": ["낯선 번호", "의심스러운 링크", "클릭 유도", "기관 사칭"]
    },
    {
        "id": 3,
        "sender": "+1 415-2222-2222",
        "content": "[국제발신]\n[카카오페이]\n결제 내역이 확인되었습니다.\n미확인 시 사용 제한됩니다.\n[https://cocoa-pay-veri.com/]",
        "answer": "스미싱",
        "technique": "국제발신, 사칭, 클릭 유도",
        "hints": ["국제발신", "사칭 위험", "클릭 유도"]
    },
    {
        "id": 4,
        "sender": "1399",
        "content": "귀하는 인플루엔자 접종 3회차 대상입니다.\n기간내 사전예약에 참여하여 접종을 받으시길 바랍니다.\n\n-예약 안내\n<사전예약기간>거주지별,일자별로\n아래와 같이 사전예약을 받습니다.\n-12/9(화)13시~12/11(목)19시\n-12/13(토)14시~12/15(월)19시....",
        "answer": "진짜",
        "technique": "공식 기관 번호",
        "hints": ["공식 기관(질병관리청) 번호", "불필요한 링크 없음"]
    },
    {
        "id": 5,
        "sender": "4567-4567",
        "content": "[web발신]\n10주년을 맞은 OOO코드배틀 스폐설\n오프라인 이벤트에 참가할 분을 찾습니다!\n\n-일시:11/30(일)\n-장소:OO코리아 판교 사옥\n-참여 링크: https://codebattle.com/",
        "answer": "진짜",
        "technique": "일반적인 광고 (스팸일 수 있으나 스미싱은 아님)",
        "hints": ["이벤트 참여 목적의 정상 링크", "악성코드가 없는 일반 광고"]
    }
];


// DOM Elements
const scoreValue = document.getElementById("score-value");
const qTitle = document.getElementById("question-title");
const qContent = document.getElementById("quiz-content");
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
const criteriaList = document.getElementById("criteria-list");
const criteriaSidebarList = document.getElementById("criteria-sidebar-list");

function populateCriteriaLists() {
    criteriaList.innerHTML = '';
    criteriaSidebarList.innerHTML = '';
    CRITERIA.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        criteriaList.appendChild(li);
        criteriaSidebarList.appendChild(li.cloneNode(true));
    });
}

function loadQuestions() {
  questions = [...QUESTIONS_DATA].sort(() => Math.random() - 0.5); // 문제 섞기
  showQuestion();
}

function showQuestion() {
  if (idx >= questions.length) {
    finishQuiz();
    return;
  }

  const q = questions[idx];
  qTitle.textContent = `문제 ${idx + 1}. 다음 문자는 진짜일까, 스미싱일까?`;
  qContent.textContent = `발신번호: ${q.sender}\n\n${q.content}`;
  
  feedback.classList.add("hidden");
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
  }
  currentScore = Math.round((correctAnswers / (idx + 1)) * 100);
  scoreValue.textContent = currentScore;
  
  const message = correct ? "정답! 🌟 정확한 판단입니다!" : "아쉽습니다! 😥 다시 한번 확인해보세요.";
  
  feedbackMsg.textContent = `${message} (정답: ${q.answer})`;
  feedbackTech.textContent = q.technique;
  feedbackHints.innerHTML = "";
  q.hints.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    feedbackHints.appendChild(li);
  });
  
  feedback.classList.remove("hidden");
}

function finishQuiz() {
  quizContainer.classList.add("hidden");
  finalArea.classList.remove("hidden");
  
  const finalPercentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
  finalScore.textContent = `최종 정답률: ${finalPercentage}%`;

  if (finalPercentage >= 80) {
    finalRemark.textContent = "스미싱 탐지 전문가! 당신은 절대 속지 않겠네요. 🕵️‍♂️";
  } else if (finalPercentage >= 50) {
    finalRemark.textContent = "좋은 방어 능력! 조금만 더 주의하면 완벽해요. 👍";
  } else {
    finalRemark.textContent = "주의가 필요해요! 낯선 링크는 절대 클릭하지 마세요. 😥";
  }
}

// Event Listeners
startBtn.addEventListener("click", () => {
    startPage.classList.add("hidden");
    quizContainer.classList.remove("hidden");
    idx = 0;
    correctAnswers = 0;
    currentScore = 0;
    scoreValue.textContent = currentScore;
    loadQuestions();
});

trueBtn.addEventListener("click", () => submitAnswer("진짜"));
fakeBtn.addEventListener("click", () => submitAnswer("스미싱"));

nextBtn.addEventListener("click", () => {
  idx += 1;
  showQuestion();
});

restartBtn.addEventListener("click", () => {
  idx = 0;
  correctAnswers = 0;
  finalArea.classList.add("hidden");
  startPage.classList.remove("hidden");
});

homeBtn.addEventListener("click", () => {
    window.location.href = "/"; // 메인 페이지로 이동
});

// Initialize
populateCriteriaLists();
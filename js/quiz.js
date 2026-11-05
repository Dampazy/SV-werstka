'use strict';

const questionBank = [
  {
    text: 'А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.',
    answers: ['Пол деревни, за раз', 'Полдеревни, зараз', 'Пол-деревни, за раз'],
    correct: [1],
    explanation: 'Полдеревни пишется слитно. Зараз — наречие со значением «одним махом».',
  },
  {
    text: 'А эти слова как пишутся?',
    answers: ['Капуччино и эспрессо', 'Каппуччино и экспресо', 'Капучино и эспрессо'],
    correct: [2],
    explanation: 'Нормативное написание: «капучино» и «эспрессо».',
  },
  {
    text: 'Как нужно писать?',
    answers: ['Черезчур', 'Черес-чур', 'Чересчур'],
    correct: [2],
    explanation: 'Правильное написание — «чересчур». Это слово нужно запомнить.',
  },
  {
    text: 'Где допущена ошибка?',
    answers: ['Аккордеон', 'Белиберда', 'Эпелепсия'],
    correct: [2],
    explanation: 'Правильно: «эпилепсия», с буквой «и».',
  },
  {
    text: 'В каких предложениях слово «одевать» употреблено правильно?',
    answers: [
      'Мама одевает ребёнка перед прогулкой.',
      'Он одевает пальто и выходит на улицу.',
      'Стилист одевает клиента перед фотосессией.',
      'Она одевает шапку и бежит на работу.',
    ],
    correct: [0, 2],
    explanation: 'Одевают кого-то: ребёнка или клиента. Надевают что-то: пальто или шапку. Здесь нужно выбрать оба правильных предложения.',
  },
];

const startButton = document.querySelector('.test-start');
const restartButton = document.querySelector('.test-restart');
const questionsArea = document.querySelector('.questions');
const progressArea = document.querySelector('.quiz-progress');
const resultArea = document.querySelector('.quiz-result');

let questionOrder = [];
let questionButtons = [];
let reviewBlocks = [];
let answeredCount = 0;
let correctCount = 0;
let currentQuestion;
let currentAnswers;
let currentFeedback;
let checkButton;
let answerButtons = [];
let selectedAnswers = [];
let leavingButtons = [];
let leavingIndex = 0;
let busy = false;
let finished = false;

function mixItems(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const savedItem = copy[i];
    copy[i] = copy[randomIndex];
    copy[randomIndex] = savedItem;
  }
  return copy;
}

function updateProgress() {
  progressArea.textContent = answeredCount + ' из 5 · Верных: ' + correctCount;
}

function prepareTest() {
  questionOrder = mixItems(questionBank);
  questionButtons = [];
  reviewBlocks = [];
  answeredCount = 0;
  correctCount = 0;
  busy = false;
  finished = false;
  questionsArea.replaceChildren();
  resultArea.replaceChildren();
  resultArea.hidden = true;
  restartButton.hidden = true;
  startButton.hidden = false;
  startButton.disabled = false;
  startButton.textContent = 'Начать тест';
  updateProgress();
}

function showNextQuestion() {
  if (busy || finished || startButton.disabled) {
    return;
  }

  startButton.disabled = true;
  currentQuestion = questionOrder[answeredCount];
  selectedAnswers = [];
  answerButtons = [];
  checkButton = null;

  const card = document.createElement('section');
  card.className = 'question-card';
  const heading = document.createElement('h2');
  const title = document.createElement('button');
  title.type = 'button';
  title.className = 'question-title';
  title.textContent = (answeredCount + 1) + '. ' + currentQuestion.text;
  title.disabled = true;
  heading.append(title);
  card.append(heading);

  const hint = document.createElement('p');
  hint.className = 'question-hint';
  if (currentQuestion.correct.length === 1) {
    hint.textContent = 'Выберите один ответ — он будет проверен сразу.';
  } else {
    hint.textContent = 'Выберите два правильных ответа и нажмите «Проверить ответ».';
  }
  card.append(hint);

  currentAnswers = document.createElement('div');
  currentAnswers.className = 'answers';
  card.append(currentAnswers);

  const answerOrder = [];
  for (let i = 0; i < currentQuestion.answers.length; i++) {
    answerOrder.push(i);
  }
  const mixedAnswers = mixItems(answerOrder);

  for (let i = 0; i < mixedAnswers.length; i++) {
    const answerIndex = mixedAnswers[i];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    button.textContent = currentQuestion.answers[answerIndex];
    answerButtons[answerIndex] = button;
    currentAnswers.append(button);

    button.addEventListener('click', function () {
      if (busy) {
        return;
      }
      if (currentQuestion.correct.length === 1) {
        selectedAnswers = [answerIndex];
        button.classList.add('selected');
        checkAnswer();
      } else {
        const position = selectedAnswers.indexOf(answerIndex);
        if (position === -1) {
          selectedAnswers.push(answerIndex);
          button.classList.add('selected');
        } else {
          selectedAnswers.splice(position, 1);
          button.classList.remove('selected');
        }
        checkButton.disabled = selectedAnswers.length === 0;
      }
    });
  }

  if (currentQuestion.correct.length > 1) {
    checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'check-answer';
    checkButton.textContent = 'Проверить ответ';
    checkButton.disabled = true;
    checkButton.addEventListener('click', checkAnswer);
    card.append(checkButton);
  }

  currentFeedback = document.createElement('p');
  currentFeedback.className = 'answer-feedback';
  currentFeedback.setAttribute('role', 'status');
  card.append(currentFeedback);
  const review = document.createElement('div');
  review.className = 'review-answer';
  review.hidden = true;
  card.append(review);

  const questionIndex = answeredCount;
  title.addEventListener('click', function () {
    if (finished) {
      showReview(questionIndex);
    }
  });
  questionButtons.push(title);
  reviewBlocks.push(review);
  questionsArea.append(card);
  questionsArea.scrollTo({left: questionsArea.scrollWidth, behavior: 'smooth'});
}

function checkAnswer() {
  if (busy || selectedAnswers.length === 0) {
    return;
  }
  busy = true;
  let correct = selectedAnswers.length === currentQuestion.correct.length;
  for (let i = 0; i < selectedAnswers.length; i++) {
    if (!currentQuestion.correct.includes(selectedAnswers[i])) {
      correct = false;
    }
  }

  for (let i = 0; i < answerButtons.length; i++) {
    answerButtons[i].disabled = true;
  }
  if (checkButton !== null) {
    checkButton.disabled = true;
  }

  const marker = document.createElement('span');
  marker.className = 'answer-marker';
  leavingButtons = [];
  leavingIndex = 0;

  if (correct) {
    correctCount++;
    currentFeedback.textContent = 'Верно';
    marker.textContent = ' ✓';
    marker.classList.add('marker-correct');
    for (let i = 0; i < answerButtons.length; i++) {
      if (currentQuestion.correct.includes(i)) {
        answerButtons[i].classList.add('correct');
        const note = document.createElement('small');
        note.className = 'answer-explanation';
        note.textContent = currentQuestion.explanation;
        answerButtons[i].append(note);
      }
    }
    for (let i = 0; i < currentAnswers.children.length; i++) {
      const button = currentAnswers.children[i];
      if (!button.classList.contains('correct')) {
        leavingButtons.push(button);
      }
    }
    for (let i = 0; i < currentAnswers.children.length; i++) {
      const button = currentAnswers.children[i];
      if (button.classList.contains('correct')) {
        leavingButtons.push(button);
      }
    }
  } else {
    currentFeedback.textContent = 'Неверно';
    marker.textContent = ' ✗';
    marker.classList.add('marker-wrong');
    for (let i = 0; i < selectedAnswers.length; i++) {
      answerButtons[selectedAnswers[i]].classList.add('wrong');
    }
    for (let i = 0; i < currentAnswers.children.length; i++) {
      leavingButtons.push(currentAnswers.children[i]);
    }
  }

  setTimeout(function () {
    questionButtons[answeredCount].append(marker);
    removeNextAnswer();
  }, 2000);
}

function removeNextAnswer() {
  if (leavingIndex === leavingButtons.length) {
    if (checkButton !== null) {
      checkButton.hidden = true;
    }
    answeredCount++;
    busy = false;
    updateProgress();
    if (answeredCount === questionBank.length) {
      finishTest();
    } else {
      startButton.disabled = false;
      startButton.textContent = 'Следующий вопрос';
    }
    return;
  }

  const button = leavingButtons[leavingIndex];
  button.classList.add('leaving');
  setTimeout(function () {
    button.remove();
    leavingIndex++;
    removeNextAnswer();
  }, 500);
}

function finishTest() {
  finished = true;
  startButton.hidden = true;
  restartButton.hidden = false;
  resultArea.hidden = false;
  const heading = document.createElement('h2');
  heading.textContent = 'Вопросы закончились';
  const summary = document.createElement('p');
  summary.textContent = 'Правильных ответов: ' + correctCount + ' из 5.';
  resultArea.append(heading, summary);
  for (let i = 0; i < questionButtons.length; i++) {
    questionButtons[i].disabled = false;
  }
}

function showReview(index) {
  const wasOpen = !reviewBlocks[index].hidden;
  for (let i = 0; i < reviewBlocks.length; i++) {
    reviewBlocks[i].hidden = true;
  }
  if (wasOpen) {
    return;
  }
  const question = questionOrder[index];
  const block = reviewBlocks[index];
  block.replaceChildren();
  for (let i = 0; i < question.correct.length; i++) {
    const answer = document.createElement('p');
    answer.className = 'review-correct';
    answer.textContent = question.answers[question.correct[i]];
    block.append(answer);
  }
  const note = document.createElement('p');
  note.textContent = question.explanation;
  block.append(note);
  block.hidden = false;
}

startButton.addEventListener('click', showNextQuestion);
restartButton.addEventListener('click', prepareTest);
prepareTest();

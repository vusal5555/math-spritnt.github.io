// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

let questionAmount;
// Equations

let equationsArray = [];
let playerGuessedArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplayed = '0.0';

// Refresh Splash Page Best Scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
  });
}

// Check Local Storage for Best Scores, Set bestScoreArray
function getSavedBestScores() {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplayed },
      { questions: 25, bestScore: finalTimeDisplayed },
      { questions: 50, bestScore: finalTimeDisplayed },
      { questions: 99, bestScore: finalTimeDisplayed },
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// Update Best Score Array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select correct Best Score to update
    if (questionAmount == score.questions) {
      // Return Best Score as number with one decimal
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if the new final score is less or replacing zero
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplayed;
      }
    }
  });
  // Update Splash Page
  bestScoresToDOM();
  // Save to Local Storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

const playAgain = function () {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessedArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
};

const showScorePage = function () {
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  gamePage.hidden = true;
  scorePage.hidden = false;
};

const displayScore = function () {
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  finalTimeDisplayed = finalTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty Time: +${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplayed}s`;
  updateBestScore();
  itemContainer.scrollTo({
    top: 0,
    behavior: 'instant',
  });
  showScorePage();
};

const checkTimer = function () {
  if (playerGuessedArray.length == questionAmount) {
    clearInterval(timer);

    equationsArray.forEach((equation, index) => {
      if (equation.evaluated === playerGuessedArray[index]) {
      } else {
        penaltyTime += 0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;

    console.log(penaltyTime);
    displayScore();
  }
};

const setTimer = function () {
  timePlayed += 0.1;
  checkTimer();
};

const startTimer = function () {
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(setTimer, 100);
  gamePage.removeEventListener('click', startTimer);
};

// Scroll
let valueY = 0;

const select = function (guessedValue) {
  valueY += 80;
  itemContainer.scroll(0, valueY);
  return guessedValue
    ? playerGuessedArray.push('true')
    : playerGuessedArray.push('false');
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const equasionToDOM = function () {
  equationsArray.forEach(equation => {
    const item = document.createElement('div');
    item.classList.add('item');
    const itemText = document.createElement('h1');
    itemText.textContent = equation.value;

    item.appendChild(itemText);
    itemContainer.appendChild(item);
  });
};

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }

  shuffle(equationsArray);
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equasionToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

const showGamePage = function () {
  countdownPage.hidden = true;
  gamePage.hidden = false;
};

const getRadioValue = function () {
  let radioValue;
  radioInputs.forEach(radioEl => {
    if (radioEl.checked) {
      radioValue = radioEl.value;
    }
  });
  return radioValue;
};
const startCountdown = function () {
  countdown.textContent = '3';
  setTimeout(() => {
    countdown.textContent = '2';
  }, 1000);
  setTimeout(() => {
    countdown.textContent = '1';
  }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO!';
  }, 3000);
};

const showCountdown = function () {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  startCountdown();
  populateGamePage();
  setTimeout(showGamePage, 4000);
};

const selecQuestionAmount = function (e) {
  e.preventDefault();
  questionAmount = getRadioValue();
  if (questionAmount) {
    showCountdown();
  }
  console.log(questionAmount);
};

startForm.addEventListener('click', () => {
  radioContainers.forEach(radio => {
    radio.classList.remove('selected-label');

    if (radio.children[1].checked) {
      radio.classList.add('selected-label');
    }
  });
});

startForm.addEventListener('submit', selecQuestionAmount);
gamePage.addEventListener('click', startTimer);

getSavedBestScores();

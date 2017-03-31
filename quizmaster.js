
const quodyssey = require('./quodyssey')
const gameID = localStorage.getItem('roomcode')
const quiz = quodyssey('127.0.0.1', 3333, gameID)

initUI()
initQuiz()

function initUI() {
  document.querySelector('#roomcode-text').textContent = gameID
  document.querySelector('#next-round-btn').addEventListener('click', advanceRound)
}

function showRound(question) {
  quiz.getNextQuestion().then(showRound)
  document.querySelector('#server-round').textContent = question.round
}

function initQuiz () {
  quiz.start()
}

function advanceRound () {
  quiz.nextRound()
  quiz.getQuestion().then(showRound)
}

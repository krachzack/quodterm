//
// Entry point for question terminal logic
//

const path = require('path')
const quoddyssey = require('./quodyssey')
const ui = require('./ui')

let quiz

connectQuiz();

function initialize () {
  connectQuiz()
}

function connectQuiz () {
  let gameID = `23`;
  quoddyssey('127.0.0.1', 3333, gameID).then(function(quizObj) {
    quiz = quizObj

    ui.processAnswer = quiz.answer

    quiz.getQuestion().then(showQuestion)
  })
}

function showQuestion(question) {
  // Immediately sign up for newer questions
  quiz.getNextQuestion().then(showQuestion)
  ui.showQuestion(question)
}

function processMultipleChoiceAnswer (idx) {
  quiz.answerMultipleChoice(idx).then(function (wasRight) {
    document.querySelector('body').style.backgroundColor = (wasRight) ? 'green' : 'red'
  })
}

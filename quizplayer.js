//
// Entry point for question terminal logic
//

const path = require('path')
const quodyssey = require('./quodyssey')
const ui = require('./ui')
const gameID = localStorage.getItem('roomcode')
const username = localStorage.getItem('username')
const hostname = process.env.SERVER_HOSTNAME || 'quovadis.gienah.uberspace.de'
const port = process.env.SERVER_PORT || 80
const quiz = quodyssey(hostname, port, gameID, username)

connectQuiz()

function initialize () {
  connectQuiz()
}

function connectQuiz () {
  ui.showRoomcode(gameID)
  ui.processAnswer = quiz.answer

  quiz.getQuestion().then(function(question) {
    if(!question) {
      // If no question available yet, wait for next
      quiz.getNextQuestion().then(showQuestion)
    } else {
      showQuestion(question)
    }
  })
}

function showQuestion(question) {
  // Immediately sign up for newer questions
  quiz.getNextQuestion().then(showQuestion)
  ui.showQuestion(question)
}

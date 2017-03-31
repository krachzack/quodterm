
const quodyssey = require('./quodyssey')
const gameID = localStorage.getItem('roomcode')
const quiz = quodyssey('127.0.0.1', 3333, gameID)
let lastPrintedRound = -1

initUI()
initQuiz()

function initUI() {
  document.querySelector('#roomcode-text').textContent = gameID
  document.querySelector('#next-round-btn').addEventListener('click', advanceRound)
}

function showRound(question) {
  const round = question.round
  quiz.getNextQuestion().then(showRound)
  document.querySelector('#server-round').textContent = round

  setTimeout(function() {
    if(round > lastPrintedRound) {
      quiz.getResultForQuiz(round).then(function (result) {
        console.log("Result visible for quiz terminal:")
        console.log(result)

        const par = document.createElement('p')
        par.textContent = `Round ${round} result for quiz player: ${JSON.stringify(result)}`
        document.querySelector('body').appendChild(par)
      })
      quiz.getResultForNonQuiz(round).then(function (result) {
        console.log("Result visible for action player:")
        console.log(result)

        const par = document.createElement('p')
        par.textContent = `Round ${round} result for action player: ${JSON.stringify(result)}`
        document.querySelector('body').appendChild(par)
      })

      lastPrintedRound = round
    }
  }, Math.max(0, (question.end - (new Date()).getTime())))
}

function initQuiz () {
  quiz.start()
}

function advanceRound () {
  quiz.nextRound()
  quiz.getQuestion().then(showRound)
}

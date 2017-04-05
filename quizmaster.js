
const quodyssey = require('./quodyssey')
const hostname = process.env.SERVER_HOSTNAME || 'quovadis.gienah.uberspace.de'
const port = process.env.SERVER_PORT || 80
const quiz = quodyssey(hostname, port)
let lastPrintedRound = -1
const nextRoundBtn = document.querySelector('#next-round-btn')

initUI()
initQuiz()

function initUI() {
  nextRoundBtn.addEventListener('click', advanceRound)
}

function showRound(question) {
  console.log(question)
  const round = question.round
  quiz.getNextQuestion().then(showRound)
  document.querySelector('#server-round').textContent = round

  const timeoutMs = Math.max(100, question.end.getTime() - (new Date()).getTime())

  console.log("Showing result after: " + timeoutMs)

  setTimeout(function() {
    if(round > lastPrintedRound) {
      quiz.getResultForQuiz(round).then(function (result) {
        const par = document.createElement('p')
        par.textContent = `Round ${round} result for quiz player: ${JSON.stringify(result)}`
        document.querySelector('body').appendChild(par)
      })
      quiz.getResultForNonQuiz(round).then(function (result) {
        const par = document.createElement('p')
        par.textContent = `Round ${round} result for action player: ${JSON.stringify(result)}`
        document.querySelector('body').appendChild(par)
      })

      lastPrintedRound = round

      nextRoundBtn.disabled = false
    }
  }, timeoutMs + 100)
}

function initQuiz () {
  quiz.start().then(function(res) {
    document.querySelector('#roomcode-text').textContent = res.gameId
    nextRoundBtn.disabled = false
  })
}

function advanceRound () {
  quiz.nextRound()

  setTimeout(function() {
    quiz.getQuestion().then(showRound)
  }, 50);

  nextRoundBtn.disabled = true
}

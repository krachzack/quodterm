//
// Entry point for question terminal logic
//

const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')
const quoddyssey = require('./quodyssey')

let win
let questionElement
let multipleChoiceElements
let quiz

(function () {
  win = new BrowserWindow({ width: 400, height: 275 })

  win.on('close', function () { win = null })

  initialize()

  win.show()
})()

function initialize () {
  obtainElements()
  wireEvents()

  // TODO Currently, we just show a multiple choice question and do nothing with
  // answers. We can do better than that!
  showDebugQuestion()

  let gameID = `23`;
  quoddyssey('127.0.0.1', 3333, gameID).then(function(theQuiz) {
    quiz = theQuiz

    showQuestion(quiz.currentQuestion())
  })
}

function showDebugQuestion () {
  showQuestion({
    prompt: 'Can I ask you a personal question?',
    options: [
      '?',
      '…',
      '?!',
      '🚀',
    ],
  })
}

//
// Finds interface elements in the document and stores them in module variables
//
function obtainElements () {
  const questionSel = '#question-prompt-text'
  const multipleChoiceSels = [
    '#question-answer-a',
    '#question-answer-b',
    '#question-answer-c',
    '#question-answer-d',
  ]

  questionElement = document.querySelector(questionSel)
  multipleChoiceElements = multipleChoiceSels.map(sel => document.querySelector(sel))
}

function wireEvents () {
  multipleChoiceElements.forEach(
    (el, idx) => el.addEventListener(
      'click',
      () => processMultipleChoiceAnswer(idx)
    )
  )
}

//
// Takes an object with at least a 'question' property, holding a string with
// the question text and an 'options' property with something as an answer,
// e.g. an array of four options.
//
function showQuestion (question) {
  const { prompt, options } = question

  showPrompt(prompt)
  showOptions(options)
}

function showPrompt (prompt) {
  if(typeof prompt === "string") {
      questionElement.innerText = prompt
  } else {
    throw `Dunno how to show this prompt: ${prompt}`
  }
}

function showOptions (options) {
  if(isArrayLike(options)) {
    let firstOption = options[0]

    if(typeof firstOption === "string") {
      showMultipleChoiceOptions(options)
    }
  } else {
    throw `Dunno what these options are ${options}`
  }
}

function showMultipleChoiceOptions (options) {
  multipleChoiceElements.forEach((elem, idx) => {
    const optionText = options[idx]
    elem.innerText =  optionText
  })
}

function processMultipleChoiceAnswer (idx) {
  // TODO this should somehow be handled
  console.log(`User picked ${idx} of multiple choice question`)
}

// see if it looks and smells like an iterable object, and do accept length === 0
// See: http://stackoverflow.com/a/24048615
function isArrayLike (item) {
    return (
        Array.isArray(item) ||
        (!!item &&
          typeof item === "object" &&
          typeof (item.length) === "number" &&
          (item.length === 0 ||
             (item.length > 0 &&
             (item.length - 1) in item)
          )
        )
    );
}

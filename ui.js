
const isArrayLike = require('./arraylike')

let questionElement
let multipleChoiceElements
let answeredLastShown = true

// Publicly visible functions
const mod = {
  processAnswer (answerObj) { return Promise.reject(new Error('No answer processing connected to UI')) },

  //
  // Takes an object with at least a 'question' property, holding a string with
  // the question text and an 'options' property with something as an answer,
  // e.g. an array of four options.
  //
  showQuestion (question) {
    const { type, prompt, options } = question

    showPrompt(type, prompt)
    showOptions(type, options)

    answeredLastShown = false
  },
}

obtainElements()
wireEvents()

module.exports = mod

function processMultipleChoiceAnswer (idx) {
  if(answeredLastShown) { return }
  answeredLastShown = true

  mod.processAnswer({
    type: "choice",
    idx
  }).then(function (wasRight) {
    multipleChoiceElements[idx].classList.add(wasRight ? 'is-correct' : 'is-wrong')
  })
}

function showPrompt (type, prompt) {
  if(type === "choice") {
      questionElement.innerText = prompt
  } else {
    throw `Dunno how to show prompt for type: ${type}`
  }
}

function showOptions (type, options) {
  if(type === "choice") {
    showMultipleChoiceOptions(options)
  } else {
    throw `Dunno how to show options for type ${type}`
  }
}

function showMultipleChoiceOptions (options) {
  multipleChoiceElements.forEach((elem, idx) => {
    elem.classList.remove('is-correct')
    elem.classList.remove('is-wrong')

    const optionText = options[idx]
    elem.innerText =  optionText
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

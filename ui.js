
let currentQuestion

let questionElem

let questionPromptElem

let multipleChoiceElements

let estimateInputElem
let estimateConfirmElem

let timerElement
let originalTimerWidth
let timerNumber

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

    questionElem.classList.remove('is-waiting')
    timerElement.classList.remove('is-correct')
    timerElement.classList.remove('is-wrong')

    showPrompt(type, prompt)
    showOptions(type, options)
    setQuestionClass(type)

    answeredLastShown = false
    currentQuestion = question
  },

  showRoomcode (roomcode) {
    document.querySelector('#roomcode-text').textContent = roomcode
  },
}

obtainElements()
wireEvents()

module.exports = mod

function tryAnswer() {
  if(answeredLastShown) { return false }
  answeredLastShown = true
  return true
}

function processMultipleChoiceAnswer (idx) {
  if(tryAnswer()) {
    const pickedElement = multipleChoiceElements[idx]
    const nonPickedElements = multipleChoiceElements.filter((el, elIdx) => elIdx != idx)
    const pickedElementClasses = pickedElement.classList

    pickedElementClasses.add('is-pending')
    pickedElementClasses.add('is-picked')
    nonPickedElements.forEach(el => el.classList.add('is-non-picked'))

    mod.processAnswer({
      type: "choice",
      idx
    }).then(function (result) {
      pickedElementClasses.remove('is-pending')
      multipleChoiceElements.forEach(
        (el, idx) => el.classList.add((idx == result.solution) ? 'is-correct' : 'is-wrong')
      )
      timerElement.classList.add(result.success ? 'is-correct' : 'is-wrong')
    })

  }
}

function processEstimateAnswer (estimateVal) {
  if(tryAnswer()) {

    estimateInputElem.classList.add('is-pending')
    estimateConfirmElem.classList.add('is-pending')

    mod.processAnswer({
      type: "estimate",
      estimate: estimateVal
    }).then(function (result) {
      estimateInputElem.classList.remove('is-pending')
      estimateConfirmElem.classList.remove('is-pending')
      estimateInputElem.classList.add(result.success ? 'is-correct' : 'is-wrong')
      estimateConfirmElem.classList.add(result.success ? 'is-correct' : 'is-wrong')
      timerElement.classList.add(result.success ? 'is-correct' : 'is-wrong')
    })

  }
}

function showPrompt (type, prompt) {
  switch(type) {
    case "choice":
    case "estimate":
      questionPromptElem.innerText = prompt
      break

    default:
      throw new Error(`Dunno how to show prompt for type: ${type}`)
  }
}

function showOptions (type, options) {
  switch(type) {
    case "choice":
      showMultipleChoiceOptions(options)
      break

    case "estimate":
      showEstimateInput()
      break

    default:
      throw new Error(`Dunno how to show options for type: ${type}`)
  }
}

function showMultipleChoiceOptions (options) {
  multipleChoiceElements.forEach((elem, idx) => {
    elem.classList.remove('is-correct')
    elem.classList.remove('is-wrong')
    elem.classList.remove('is-picked')
    elem.classList.remove('is-non-picked')

    const optionText = options[idx]
    elem.innerText =  optionText
  })
}

function showEstimateInput() {
  estimateInputElem.value = 0
  estimateInputElem.classList.remove('is-correct')
  estimateInputElem.classList.remove('is-wrong')

  estimateConfirmElem.classList.remove('is-correct')
  estimateConfirmElem.classList.remove('is-wrong')
}

function setQuestionClass (type) {
  questionElem.classList.remove('is-choice')
  questionElem.classList.remove('is-estimate')

  questionElem.classList.add(`is-${type}`)
}

function updateTimebar () {
  if(currentQuestion) {
    const nowMs = new Date().getTime()
    const alpha = (nowMs - currentQuestion.start.getTime()) /
                  (currentQuestion.end.getTime() - currentQuestion.start.getTime())

    if(alpha > 0.0 && alpha < 1.0) {
        const remainingSecs = Math.ceil((currentQuestion.end.getTime() - nowMs) / 1000)
        timerNumber.textContent = remainingSecs

        const timerWidth = (originalTimerWidth * (1-alpha)) + "px"
        timerElement.style.width = timerWidth
    }
  }
}

//
// Finds interface elements in the document and stores them in module variables
//
function obtainElements () {
  const questionSel = '#question'
  const questionPromptSel = '#question-prompt-text'
  const multipleChoiceSels = [
    '#question-answer-a',
    '#question-answer-b',
    '#question-answer-c',
    '#question-answer-d',
  ]
  const estimateInputSel = '#question-answer-estimate'
  const estimateConfirmSel = '#question-answer-estimate-confirm'

  questionElem = document.querySelector(questionSel)

  questionPromptElem = document.querySelector(questionPromptSel)
  multipleChoiceElements = multipleChoiceSels.map(sel => document.querySelector(sel))

  estimateInputElem = document.querySelector(estimateInputSel)
  estimateConfirmElem = document.querySelector(estimateConfirmSel)

  timerElement = document.querySelector("#timer")
  originalTimerWidth = timerElement.offsetWidth
  timerNumber = document.querySelector("#timer_number")
}

function wireEvents () {
  multipleChoiceElements.forEach(
    (el, idx) => el.addEventListener(
      'click',
      () => processMultipleChoiceAnswer(idx)
    )
  )

  estimateConfirmElem.addEventListener(
    'click',
    () => processEstimateAnswer(Number.parseFloat(estimateInputElem.value))
  )

  setInterval(updateTimebar, 16)
}

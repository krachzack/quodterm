
const requestPromise = require('minimal-request-promise')

const questionPollingIntervalMs = 500

module.exports = function (hostname, port, gameID) {

  let currentQuestion

  return get(`game/start/${gameID}`).then(function (result) {
    // This should be done from the action game
    return get(`quiz/set/${gameID}`)
  }).then(function (result) {
    return {
      getQuestion() {
        return get(`quiz/get/${gameID}`).then(function (result) {
          currentQuestion = {
            id: result.question.id,
            prompt: result.question.question,
            options: [
              result.question.a,
              result.question.b,
              result.question.c,
              result.question.d
            ]
          }

          return currentQuestion
        })
      },

      answerMultipleChoice(answerIdx) {
        if (currentQuestion) {
          if(answerIdx < 0 || answerIdx > 3) { throw new Error(`Invalid answer idx ${answerIdx}`) }
          let answerLetter = ['a', 'b', 'c', 'd'][answerIdx]
          return get(`quiz/result/${currentQuestion.id}/${answerLetter}`).then(function (result) {
            return result.result
          })
        } else {
          return Promise.reject(new Error('Did not get a question before answering'))
        }
      }
    }
  })

  function get (path) {
    return requestPromise.get(`http://${hostname}:${port}/${path}`, {}).then(function (res) {
      return JSON.parse(res.body)
    })
  }
}

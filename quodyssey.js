
const requestPromise = require('minimal-request-promise')

const questionPollingIntervalMs = 250

module.exports = function (hostname, port, gameID) {

  let currentQuestion
  let currentQuestionPoll

  return get(`game/start/${gameID}`).then(function (result) {
    // This should be done from the action game
    return get(`quiz/set/${gameID}`)
  }).then(function (result) {
    return {
      /**
       * Returns a promise for the current question that fulfills as soon as
       * possible. If a question is already there, no request to the server will
       * be made
       */
      getQuestion() {
        if(currentQuestion) {
          return Promise.resolve(currentQuestion)
        } else {
          return obtainCurrentQuestion()
        }
      },

      /**
       * Gets a promise for the next question after this question is over. This
       * works by polling for new questions 4 times a second in the background
       * and fulfilling the promise when a question with different ID is available
       */
      getNextQuestion() {
        return pollNextQuestion()
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

  function obtainCurrentQuestion() {
    if(!currentQuestionPoll) {
      currentQuestionPoll = get(`quiz/get/${gameID}`).then(function (result) {
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

        currentQuestionPoll = undefined;

        return currentQuestion
      })
    }
    return currentQuestionPoll
  }

  function pollNextQuestion () {
    return new Promise(function (resolve, reject) {
      const oldId = currentQuestion ? currentQuestion.id : "-1"
      let activePoll

      setInterval(callback, questionPollingIntervalMs)

      function callback () {
        if(activePoll) { return; }

        activePoll = obtainCurrentQuestion()

        activePoll.then(function(question) {
          if(question.id !== oldId) {
            clearInterval(callback)
            resolve(question);
          } else {
            activePoll = undefined
          }
        }).catch(function(err) {
          reject(err)
        })
      }
    })
  }

  function get (path) {
    return requestPromise.get(`http://${hostname}:${port}/${path}`, {}).then(function (res) {
      return JSON.parse(res.body)
    })
  }
}

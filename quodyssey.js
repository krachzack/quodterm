
const requestPromise = require('minimal-request-promise')

const questionPollingIntervalMs = 500

module.exports = function (hostname, port, gameID) {

  return get(`game/start/${gameID}`).then(function (result) {
    // This should be done from the action game
    return get(`quiz/set/${gameID}`)
  }).then(function (result) {
    console.log('Game started and quiz set')

    return {
      getQuestion() {
        return get(`quiz/get/${gameID}`).then(function (result) {
          return {
            prompt: result.question.question,
            options: [
              result.question.a,
              result.question.b,
              result.question.c,
              result.question.d
            ]
          }
        })
      },

      answer(questionIdx) {
        console.log(`Got answer ${questionIdx}`)
      }
    }
  })

  function get (path) {
    return requestPromise.get(`http://${hostname}:${port}/${path}`, {}).then(function (res) {
      return JSON.parse(res.body)
    })
  }
}

/*console.log('Setting off start request')
let question = {prompt: 'NOT LOADED'};
return requestPromise.get(`http://${hostname}:${port}/game/start/${gameID}`, {}).then(function (res) {
  return requestPromise.get(`http://${hostname}:${port}/quiz/set/${gameID}`, {}).then(function (res) {
      return requestPromise.get(`http://${hostname}:${port}/quiz/get/${gameID}`, {}).then(function (res) {
          json = JSON.parse(res.body);
          question = {
        prompt: json.question.question,
        options: [
          json.question.a,
          json.question.b,
          json.question.c,
          json.question.d
        ]
        }
        return question;
    })
    })
})*/

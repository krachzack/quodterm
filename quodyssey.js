
const requestPromise = require('axios')

const questionPollingIntervalMs = 250

module.exports = function (hostname, port, gameID) {

    let currentQuestion
    let currentQuestionPoll
    let username

    return {
        start() {
            if (!gameID) {
                return post(`start`).then(function (res) {
                    gameID = res.gameId
                    return res
                });
            } else {
                return post(`start`, {gameId: gameID, cssUrl: undefined})
            }
        },

        join(newUsername) {
          return post('/join', {gameId: gameID, username: newUsername}).then(function(res) {
            if(res.success) {
              username = newUsername
              return res.success
            } else {
              return Promise.reject(`Join failed: ${JSON.stringify(res)}`)
            }
          })
        },

        nextRound() {
            return post(`ask`, {gameId: gameID})
        },

        //
        // Returns a promise for the current question that fulfills as soon as
        // possible. If a question is already there, no request to the server will
        // be made
        //
        getQuestion() {
            if (currentQuestion) {
                return Promise.resolve(currentQuestion)
            } else {
                return obtainCurrentQuestion()
            }
        },

        //
        // Gets a promise for the next question after this question is over. This
        // works by polling for new questions 4 times a second in the background
        // and fulfilling the promise when a question with different ID is available
        // in contrast to getQuestion, which most likely resolves immediately,
        // the polling mechanism takes at least 250ms to complete.
        //
        getNextQuestion() {
            return pollNextQuestion()
        },

        answer(answerObj) {
            let wasRight

            if (!currentQuestion) {
                wasRight = Promise.reject(new Error('Tried to answer but no question was get before'))
            } else if (currentQuestion.type != answerObj.type) {
                wasRight = Promise.reject(new Error(`Current question has type ${currentQuestion.type}, but given answer is ${answerObj.type}`))
            } else {

                switch (answerObj.type) {
                    case "choice":
                        wasRight = answerMultipleChoice(answerObj.idx)
                        break

                    case "estimate":
                        wasRight = answerEstimate(answerObj.estimate)
                        break

                    default:
                        wasRight = Promise.reject(new Error(`Unknown answer type ${answerObj.type}`))
                        break
                }

            }

            return wasRight
        },

        getResultForQuiz(round) {
            return get(`resultQ/${gameID}/${round}`)
        },

        getResultForNonQuiz(round) {
            return get(`resultA/${gameID}/${round}`)
        },

        getCurrentQuestionRemainingTime: currentQuestionRemainingTime,
    }

    function answerMultipleChoice(answerIdx) {
        const answerLetters = ['a', 'b', 'c', 'd']
        const answerLetter = answerLetters[answerIdx]
        const round = currentQuestion.round

        if (currentQuestion) {
            if (answerIdx < 0 || answerIdx > 3) { throw new Error(`Invalid answer idx ${answerIdx}`) }

            return post(
              'answer',
              { gameId: gameID, roundId: round, answer: answerLetter, username }
            ).then(function (result) {
                return new Promise(function (resolve, reject) {
                    const msLeft = currentQuestionRemainingTime()
                    setTimeout(function () {
                        get(`resultQ/${gameID}/${round}`).then(function (result) {
                            const correctAnswerLetter = result.answer
                            const correctAnswerIndex = answerLetters.indexOf(correctAnswerLetter)
                            resolve({ success: (correctAnswerLetter === answerLetter), solution: correctAnswerIndex })
                        })
                    }, msLeft)
                })
            })
        } else {
            return Promise.reject(new Error('Did not get a question before answering'))
        }
    }

    function answerEstimate(estimateVal) {
        if (typeof estimateVal !== "number") {
            return Promise.reject(new Error('Estimation questions need to be answered with numbers'))
        }

        const round = currentQuestion.round

        return post(
          'answer',
          { gameId: gameID, roundId: round, answer: estimateVal, username }
        ).then(function (result) {
            return new Promise(function (resolve, reject) {
                const msLeft = currentQuestionRemainingTime()
                setTimeout(function () {
                    get(`resultQ/${gameID}/${round}`).then(function (result) {
                        const exactVal = result.answer
                        // If less than 10% off, show as correct
                        const goodEnough = Math.abs(exactVal - estimateVal) < (exactVal * 0.1)
                        resolve({ success: goodEnough, solution: exactVal })
                    })
                }, Math.max(msLeft, 0))
            })
        })
    }

    function currentQuestionRemainingTime() {
        return currentQuestion.end.getTime() - (new Date()).getTime()
    }

    function obtainCurrentQuestion() {
        if (!currentQuestionPoll) {
            currentQuestionPoll = get(`getq/${gameID}`).then(function (result) {

                if (result.success) {
                    currentQuestion = {
                        id: result.question.id,
                        round: result.round,
                        type: result.question.type,
                        prompt: result.question.question,
                        options: [
                            result.question.a,
                            result.question.b,
                            result.question.c,
                            result.question.d
                        ],
                        duration: result.end,
                        end: new Date((new Date()).getTime() + result.end),
                        start: new Date(),
                    }
                }

                currentQuestionPoll = undefined

                return currentQuestion
            })
        }
        return currentQuestionPoll
    }

    function pollNextQuestion() {
        return new Promise(function (resolve, reject) {
            const oldRound = currentQuestion ? currentQuestion.round : -1
            let activePoll

            setInterval(callback, questionPollingIntervalMs)

            function callback() {
                if (activePoll) { return; }

                activePoll = obtainCurrentQuestion()

                activePoll.then(function (question) {
                    if (question && question.round !== oldRound) {
                        clearInterval(callback)
                        resolve(question);
                    } else {
                        activePoll = undefined
                    }
                }).catch(function (err) {
                    reject(err)
                })
            }
        })
    }

    function get(path) {
        return requestPromise.get(`http://${hostname}:${port}/${path}`).then(function (res) {
            return res.data
        })
    }

    function post(path, data) {
        return requestPromise.post(`http://${hostname}:${port}/${path}`, data).then(function (res) {
            return res.data
        })
    }
}

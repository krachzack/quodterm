
const requestPromise = require('minimal-request-promise')

const questionPollingIntervalMs = 500

module.exports = function (hostname, port, gameID) {
	console.log('Setting off start request')
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
	})
}
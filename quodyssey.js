
const requestPromise = require('minimal-request-promise')

const questionPollingIntervalMs = 500

module.exports = function (hostname, port, gameID) {
  console.log('Setting off start request')

  return get(`/game/start/${gameID}`).then(function (res) {
    console.log('Started')

    if(res.success !== true) {
      return Promise.reject(new Error('The server communicated failure in starting a game'))
    }

    // Sets initial question, after that, the game has really started
    return get(`/quiz/set/${gameID}`);
  }).then(function (res) {
    return {
      currentQuestion () {
        return get(`/quiz/get/${gameID}`).then(function (res) {
          return {
            prompt: res.question.question,
            options: [
              res.question.a,
              res.question.b,
              res.question.c,
              res.question.d,
            ]
          }
        })
      }
    }
  })

  function get(path, args) {
    return requestPromise(
      opts(
        {
          method: 'GET',
          hostname,
          port,
          path
        },
        args
      )
    ).then(function(resultString) {
      return JSON.parse(resultString)
    });
  }

}

function opts(overrides, args) {
  const baseOpts = {
    method: 'GET',
    hostname: 'abc.xyz',
    port: 9898,
    path: '/v2.6/me/messages?access_token=',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 1000,
  }
  const requiredOverrides = ['method', 'hostname', 'port', 'path']
  const missingOverrides = requiredOverrides.filter(prop => !(prop in overrides))

  if(missingOverrides.length) { throw new Error(`Missing properties ${missingOverrides} to make request`) }

  const opts = Object.assign({}, baseOpts, overrides)

  if(args) {
    if(opts.method === 'GET' || opts.method === 'HEAD') {
      // No request body, add URL parameters to path
      opts.path = opts.path + queryString(args)
    } else {
      // Assume POST, PUT, PATCH or something like that and put arguments as
      // JSON in request body
      opts.body = JSON.stringify(args)
    }
  }

  console.log(opts)

  return opts
}

function queryString(obj, prefix) {
  var str = [], p;
  for(p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        queryString(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return '?' + str.join("&");
}

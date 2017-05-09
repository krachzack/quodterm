const roomInput = document.querySelector('#input-roomcode')
const usernameInput = document.querySelector('#username')

const quodyssey = require('./quodyssey')
const hostname = process.env.SERVER_HOSTNAME || 'quovadis.gienah.uberspace.de'
const port = process.env.SERVER_PORT || 80

wireEvents();

function wireEvents() {
  roomInput.addEventListener('input', function() {
    localStorage.setItem('roomcode', roomInput.value)
  })

  document.querySelector('#bottom-right-arrow > a').addEventListener(
    'click',
    function (evt) {
      evt.preventDefault();
      if(roomInput.value && usernameInput.value) {
        join();
      }
    }
  )
}

function join() {
  const room = roomInput.value
  const username = usernameInput.value

  const quiz = quodyssey(hostname, port, room)
  quiz.join(username).then(function() {
    console.log(`${username} just joined`)
    window.location = 'quizplayer.html'
  })
}

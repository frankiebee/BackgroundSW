const SwController = require('client-sw-ready-event/lib/sw-client.js')
const SwStream = require('sw-stream/lib/sw-stream.js')

var serviceWorkerController
window.onload = function () {
  let intervalDelay =  Math.floor(Math.random() * (30000 - 1000)) + 1000
  serviceWorkerController = new SwController({
    fileName: '/sw-bundle.js',
    letBeIdle: false,
    intervalDelay,
    wakeUpInterval: 30000
  })
  serviceWorkerController.on('ready', (readSw) => {
    let connectionStream = SwStream({
      serviceWorker: serviceWorkerController.controller,
      context: name,
    })
  })
  serviceWorkerController.on('error', showError)
  serviceWorkerController.on('message', showMessage)
  serviceWorkerController.on('data', showData)
  serviceWorkerController.startWorker()
  setupButton(serviceWorkerController)
}
function setupButton (sw) {
  var get = document.getElementById('get')
  var put = document.getElementById('put')
  // test some action some action you want button to do
  get.addEventListener('click', () => {
    serviceWorkerController.sendMessage('get')
  })
  put.addEventListener('click', () => {
    serviceWorkerController.sendMessage('put')
  })
}


function showError (message) {
  var errContainer = document.getElementById('err')
  errContainer.style.background = ' #ffd6cc'
  errContainer.style.color = '#ff471a'
  errContainer.innerText = message
}

function showMessage (message) {
  var messageContainer = document.getElementById('message')
  messageContainer.innerText = message
}


function showData (data) {
  var dataContainer = document.getElementById('data')
  dataContainer.innerText = data
}

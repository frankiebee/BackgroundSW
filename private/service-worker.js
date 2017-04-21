const EventEmitter = require('events')
var id = Math.random()
const SwStream = require('sw-stream/lib/sw-stream.js')
const SwGlobalListener = require('sw-stream/lib/sw-global-listener.js')

const connectionListener = new SwGlobalListener(self)
const IDB = require('../level-db')
const idb = new IDB({
  key: 'TEST',
  version: 2,
})
idb.once('opened', (data) => {
  // idb.put({test: data.test++})
  idb.get()
  .then((data) => {
    console.log('non issue@1?', data)
    return Promise.resolve(data)
  })
  .catch((err) => console.error('PUT 3', err))

})
let counter = 0
idb.initialState = {test: counter}
idb.open()
.then((data) => {
  console.log(data)
})
.catch(console.error)

self.addEventListener('message', function (messageEvent) {
  if (messageEvent.data === 'get'){
    return idb.get()
    .then((data) => {
      console.log('non issue@get?', data)
    })
    .catch(console.error)
  } else if (messageEvent.data === 'put') {
      counter += 1
      return idb.put({test: counter}).then((data) => console.log('non issue@put?', data))
      .catch(console.error)
    }

})


sendMessageToAllClients('The service worker just started up.')

connectionListener.on('remote', (portStream, messageEvent) => {
    console.log('REMOTE CONECTION FOUND***********')
  })

self.addEventListener('activate', function(event) {
  console.log(id, 'activate')
  event.waitUntil(self.clients.claim())
})

self.oninstall = function (event) {
  // cache the state of the app and ui so that
  // you can restart
  // in the right place
  console.log(id, 'oninstall')
  event.waitUntil(self.skipWaiting())
  // where you could posibly hault all things so
  // that the service worker can update
}

self.onsync = function (syncEvent) {
// What is done when a sync even is fired
// some things could be like:
/*
what is the current state
or just be all like hay data changed
"i'm responsible for passing data back and forth"

things achieved here:
*/
  var focused
  self.clients.matchAll()
  .then(clients => {
    clients.forEach(function(client) {
      if (client.focused) {
        focused = true
        return sendMessageToClient(client, 'sync Received')
        .then(clientInfo => {
          debugger
        })
      } else {
        sendMessageToClient(client, 'not focused')
      }
    })
    if (!focused) {sendMessageToAllClients('no focus')}
  })
}

function sendMessageToClient(client, msg, data){
    return new Promise(function(resolve, reject){
        var msgChan = new MessageChannel()
        msgChan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error)
            }else{
                resolve(event.data)
            }
        }

        client.postMessage({
          message: 'SW Says',
          full: `${id}SW Says: ${msg}`,
          data: data,
        }, [msgChan.port2])
    })
}
function sendMessageToAllVisibleClients (message, data) {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      if (client.visibilityState === 'visible') {
        client.postMessage({message, data})
      }
    })
  })
}

function sendMessageToAllClients (message) {
  self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage(message)
    })
  })
}



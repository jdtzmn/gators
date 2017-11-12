const auth = require('../auth.js')
const gator = require('../index.js')(auth)

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // info object contains message data
  const text = info.texts[0].value

  // send reply
  if (text === 'ping') sendReply('pong')
})

gator.on('error', (err) => console.log(err))

gator.connect()

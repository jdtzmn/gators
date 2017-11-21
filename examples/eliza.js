const auth = require('../auth.js')
const gator = require('../index.js')(auth)

const ElizaBot = require('elizabot')
const eliza = new ElizaBot()

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // ask ELIZA [http://bit.ly/2ySPGEe] for a reply based on the text
  const text = info.text
  const elizaReply = eliza.transform(text)

  // send eliza's reply
  sendReply(elizaReply)
})

gator.on('error', (err) => console.log(err))

gator.connect()

import auth from '../auth'
import Gator from '../src/gators'
const gator = new Gator(auth)

const ElizaBot = require('elizabot')
const eliza = new ElizaBot()

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // ask ELIZA [http://bit.ly/2ySPGEe] for a reply based on the text
  const text = info.text
  console.log(`received message: ${text}`)
  const elizaReply = eliza.transform(text)
  console.log(`responding with: ${elizaReply}`)

  // send eliza's reply
  sendReply(elizaReply)
})

gator.on('error', (err) => console.log(err))

gator.connect()

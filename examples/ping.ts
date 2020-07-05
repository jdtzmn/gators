import auth from '../auth'
import Gator from '../src/gators'

const gator = new Gator(auth)

gator.on('connected', () => console.log('connected!'))

gator.on('message', async (details, sendReply) => {
  if (details.text) {
    // info object contains message data
    const text = details.text.toLowerCase()
    console.log(`> Received message: ${text}`)

    // send reply
    if (text === 'ping') await sendReply('pong')
  }
})

gator.on('error', (err: any) => console.log(err))

gator.connect()

# Coming soon... stay tuned

 An example:

```js
const auth = require('../auth.js')
const gator = require('gators')(auth)

// example gator separator names
const text = require('gators-text')
const images = require('gators-images')

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // info object contains message data
  const text = info.texts[0].value
  const images = info.texts[0].value

  // send reply
  if (text === 'ping') sendReply('pong')
})

gator.on('error', (err) => console.log(err))

gator
  .separate(text)
  .separate(images)
  .connect()
```

> adapted from [examples/ping.js](https://github.com/jdtzmn/gators/blob/master/examples/ping.js)

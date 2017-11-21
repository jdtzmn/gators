const auth = require('../auth.js')
const gator = require('../index.js')(auth)

const request = require('superagent')

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // test to see if there is an image
  if (!info.images) {
    sendReply({
      title: 'Image Recognition',
      body: 'Try sending an image!'
    })
  } else {
    const image = info.images[0]

    // ask API [http://bit.ly/2id60bo] what it "sees"
    request
      .post('https://einstein-vision.herokuapp.com/file-upload')
      .attach('file', image.raw, image.name)
      .end((err, res) => {
        if (err) return console.log(err)

        // parse the response text
        const probabilities = JSON.parse(res.text).probabilities

        // reformat the JSON
        const reformatted = probabilities.map((prob) => {
          const name = prob.label.split(',')[0]
          const percentage = Math.round(prob.probability * 100)
          return name + ' - ' + percentage + '%'
        })

        // send reply
        sendReply({
          title: 'Image Recognition',
          body: reformatted.join('\n')
        })
      })
  }
})

gator.on('error', (err) => console.log(err))

gator.connect()

# Gators

Free and easy texting framework for node using [SMS gateways](https://en.wikipedia.org/wiki/SMS_gateway#Email_clients).

[![NPM](https://nodei.co/npm/gators.png)](https://nodei.co/npm/gators/)

```js
// see below for auth template
const auth = require('../auth.js')
const gator = require('gators')(auth)

gator.on('connected', () => console.log('connected!'))

gator.on('message', (info, sendReply) => {
  // info object contains message data
  const text = info.texts[0].value
  const images = info.texts[0].value

  // send reply
  if (text === 'ping') sendReply('pong')
})

gator.on('error', (err) => console.log(err))

gator.connect()
```

## Getting Started

> DISCLAIMER: This package has not been tested with all SMS gateway providers nor phone operating systems.

> For a list of supported providers, see [SUPPORT.md](https://github.com/gators/blob/master/SUPPORT.md).

> For instructions on how you can contribute, see [CONTRIBUTE.md](https://github.com/gators/blob/master/CONTRIBUTE.md).

This is a module from npm.

Before installing, download and install [node.js](https://nodejs.org/) and [npm](https://npmjs.com).

### Install gators

```bash
$ npm i -s gators
```

### Create auth file from template

```bash
$ touch auth.js
```

auth.js

```js
module.exports = {
  account: {
    user: '****@****.com',
    pass: '$!J$#LK#K'
  },
  smtp: {
    host: 'smtp.*****.com',
    port: 465,
    secure: true
  },
  imap: {
    host: 'imap.*****.com',
    port: 993,
    secure: true
  }
}
```

### Manually test with one of the included examples

Automated tests coming soon...

```bash
$ cp ./node_modules/gators/examples/ping.js ./examples

$ node ./examples/ping.js
```

## Built With

* [node-imap](https://github.com/mscdex/node-imap) - IMAP Client
* [Nodemailer](https://nodemailer.com/) - SMTP Client
* [Mailparser](https://nodemailer.com/extras/mailparser/) - Elegantly parse emails

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jdtzmn/gators/tags).

## Coding Style

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## Authors

* **jdtzmn** - *Initial work* - [jdtzmn](https://github.com/jdtzmn)

See also the list of [contributors](https://github.com/jdtzmn/gators/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/gators/blob/master/LICENSE.md) file for details

## Acknowledgments

* This amazing [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2).
* [NodeICO](https://nodei.co) for the npm badge.
* [gitignore.io](https://gitignore.io) for .gitignore

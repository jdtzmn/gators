const util = require('util')
const EventEmitter = require('events').EventEmitter
const Email = require('./lib/email.js')
const carriers = require('./lib/carriers.js')
const separators = require('./separators/index.js')

// construct a list of carrier domains
const getDomain = (email) => email.split('@')[email.split('@').length - 1]
const carrierDomains = Object.values(carriers).map((email) => getDomain(email))

const Gators = function (auth) {
  // make this a constructor if it is not
  if (!(this instanceof Gators)) {
    return new Gators(auth)
  }

  // declare email property
  this.email = null

  // set default separators
  this._separators = separators

  // ==============================
  // =========== CONNECT ==========
  // ==============================

  this.connect = () => {
    // declare email constructor
    const email = new Email(auth)
    this.email = email

    // handle email events
    email.on('imap:connected', () => this.emit('connected'))
    email.on('imap:disconnected', () => this.emit('disconnected'))
    email.on('error', (err) => this.emit('error', err))

    // handle incoming emails
    email.on('mail', separate)
  }

  // ==============================
  // =========== SEPERATE =========
  // ==============================

  const separate = (mail) => {
    // only continue if the email is from an sms gateway
    const from = mail.from.value[0]
    const carrierIndex = carrierDomains.indexOf(getDomain(from.address))

    if (carrierIndex >= 0) {
      // define carrier
      const carrier = Object.keys(carriers)[carrierIndex]

      // define the default info
      const info = { from }

      // define data provided to separators
      const separatorData = {
        attachments: mail.attachments,
        text: mail.text
      }

      // declare counter
      let i = 0

      // check if the test passes
      const check = (i) => {
        const test = this._separators[i]

        // if there is a separator, run it
        if (test) {
          const separator = test(carrier, separatorData, handleSeparator)
          handleSeparator(separator)
        } else {
          // emit 'message' event with info and reply function
          this.emit('message', info, generateReply(from.address))
        }
      }

      // if there is a separator, then handle it
      const handleSeparator = (separator) => {
        // if it passes, run it
        if (separator) {
          separator(info, separatorData, next, this.emit)
        } else if (typeof separator !== 'undefined') {
          // otherwise test the next separator
          check(i++)
        }
      }

      // set values and check the next separator
      const next = (key, value) => {
        if (typeof key === 'string' && typeof value !== 'undefined') {
          info[key] = value
        }
        check(i++)
      }

      // LET'S GO!
      check(0)
    } else {
      // if the email isn't from an sms gateway, emit an 'email' event
      this.emit('email', mail)
    }
  }

  // ==============================
  // ======== ADD SEPARATOR =======
  // ==============================

  this.separate = (test) => {
    // make sure fn is a function
    if (typeof test === 'undefined' || typeof test !== 'function') {
      throw new Error('fn must be a function')
    }

    // add fn to the list of functions
    this._separators.push(test)
    return this
  }

  // ==============================
  // ========= SEND EMAILS ========
  // ==============================

  // -------- SEND TO EMAIL -------
  this.send = (options, cb) => {
    // make sure the required parameters are present
    if (!options.to || !options.body) {
      let err = new Error('to and body parameters are required')
      return cb ? cb(err, null) : err
    // make sure that 'gator.connect()' has been called
    } else if (!this.email) {
      let err = new Error("you must call the 'start' method before sending messages")
      return cb ? cb(err, null) : err
    }

    // send email
    this.email.sendMail({
      to: options.to,
      subject: options.title || '',
      text: options.body,
      html: '<div dir="ltr"></div>'
    }, cb)
  }

  // ------- SEND TO CARRIER ------
  this.sendText = (number, carrier, options, cb) => {
    // accept string instead of object
    if (typeof options === 'string') {
      options = { body: options }
    }

    // generate email from number and carrier
    let email = carriers[carrier].replace('[number]', number)
    options.to = email

    this.send(options, cb)
  }

  // ==============================
  // ===== GENERATE REPLY FN ======
  // ==============================

  const generateReply = (address) => (options, cb) => {
    // accept string instead of object
    if (typeof options === 'string') {
      options = { body: options }
    }

    // set the 'to' address to the sender of the message
    options.to = address

    // send the message
    this.send(options, cb)
  }

  // ==============================
  // ========= DISCONNECT =========
  // ==============================

  this.disconnect = () => this.email ? this.email.end() : new Error("can't end without being started")
}

// extend the EventEmitter class to the Email class
util.inherits(Gators, EventEmitter)

module.exports = Gators

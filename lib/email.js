const util = require('util')
const EventEmitter = require('events').EventEmitter
const MailListener = require('./MailListener.js')
const nodemailer = require('nodemailer')

const Email = function (auth) {
  // make this a constructor if it is not
  if (!(this instanceof Email)) {
    return new Email(auth)
  }

  // define 'this' to 'self' so that it may be referenced in callbacks
  const self = this

  const account = auth.account
  const smtpSettings = auth.smtp
  const imapSettings = auth.imap

  // ==============================
  // =========== OUTPUT ===========
  // ==============================

  // create smtp transport
  const smtp = nodemailer.createTransport(Object.assign(smtpSettings, { auth: account }), auth.defaults)

  // define the 'sendEmail' method
  this.sendMail = (options, cb) => smtp.sendMail(options, cb)

  // =============================
  // =========== INPUT ===========
  // =============================

  // create imap transport
  const imap = new MailListener(Object.assign(imapSettings, account))

  // setup mail events
  imap.on('imap:connected', () => self.emit('imap:connected'))
  imap.on('imap:disconnected', () => self.emit('imap:disconnected'))
  imap.on('incoming', (id) => self.emit('arrived', id))
  imap.on('mail', (mail) => self.emit('mail', mail))

  // define 'end' method
  this.end = () => {
    imap.end()
  }
}

// extend the EventEmitter class to the Email class
util.inherits(Email, EventEmitter)

module.exports = Email

const util = require('util')
const EventEmitter = require('events').EventEmitter
const Imap = require('imap')
const parseBuffer = require('mailparser').simpleParser

/*
    Inspired by:
     * https://github.com/circuithub/mail-listener
     * https://gist.github.com/bergie/1226809
*/

const MailListener = function (auth) {
  // setup imap authentication
  const imap = new Imap({
    user: auth.user,
    password: auth.pass,
    host: auth.host,
    port: auth.port,
    tls: auth.secure
  })

  // handle imap events
  imap.once('error', (err) => this.emit('error', err))
  imap.once('end', () => this.emit('imap:disconnected'))

  // setup ready event
  imap.once('ready', () => {
    this.emit('imap:connected')

    // open the inbox
    imap.openBox('INBOX', false, (err, box) => {
      if (err) return this.emit('error', err)

      // check for new emails
      this.parseEmails()

      // listen for new emails
      imap.on('mail', (id) => this.emit('incoming', id) && this.parseEmails())
    })
  })

  // connect to the server
  imap.connect()

  // declare parseEmails method
  this.parseEmails = () => {
    // search the inbox for new mail
    imap.search(['UNSEEN'], (err, results) => {
      if (err) return this.emit('error', err)

      // check if there is new mail
      if (Array.isArray(results) && results.length === 0) return

      // fetch the new mail
      const fetch = imap.fetch(results, { bodies: '', markSeen: true })
      fetch.on('message', (msg, id) => {
        let buffer = ''

        // handle message data
        msg.on('body', (stream, info) => stream.on('data', (chunk) => { buffer += chunk }))

        msg.once('end', () => {
          parseBuffer(buffer, (err, mail) => {
            if (err) return this.emit('error', err)
            this.emit('mail', mail)
          })
        })
      })
    })
  }

  // declare 'end' method
  this.end = () => {
    imap.end()
  }
}

// extend the EventEmitter class to the MailListener class
util.inherits(MailListener, EventEmitter)

module.exports = MailListener

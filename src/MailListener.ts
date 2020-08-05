import { EventEmitter } from 'events'
import Imap from 'imap'
import { simpleParser as parseBuffer } from 'mailparser'
import * as htmlToText from 'html-to-text'

export interface ImapAuth {
  user: string,
  pass: string,
  host: string,
  port: number,
  secure: boolean
}

/*
    Inspired by:
     * https://github.com/circuithub/mail-listener
     * https://gist.github.com/bergie/1226809
*/

export default class MailListener extends EventEmitter {
  private imap: Imap

  constructor (auth: ImapAuth) {
    super()

    this.imap = new Imap({
      user: auth.user,
      password: auth.pass,
      host: auth.host,
      port: auth.port,
      tls: auth.secure
    })
    const imap = this.imap

    // Setup ready event
    imap.once('ready', () => {
      this.emit('imap:connected')

      // Open the inbox
      imap.openBox('INBOX', false, (err, box) => {
        if (err) return this.emit('error', err)

        // Check for new emails
        this.parseEmails()

        // Listen for new emails
        imap.on('mail', (id: string) => {
          this.emit('incoming', id)
          this.parseEmails()
        })
      })
    })

    // Handle imap events
    imap.once('error', (err: Error) => this.emit('error', err))
    imap.once('end', () => this.emit('imap:disconnected'))

    // Connect to the server
    imap.connect()
  }

  private parseEmails () {
    // Search the inbox for new mail
    const imap = this.imap
    imap.search(['UNSEEN'], (err, results) => {
      if (err) return this.emit('error', err)

      // End if there is no new mail
      if (Array.isArray(results) && results.length === 0) return

      // Fetch the new mail
      const fetch = imap.fetch(results, { bodies: '', markSeen: true })
      fetch.on('message', (msg, id) => {
        let buffer = ''

        // Handle message data
        msg.on('body', (stream, info) => {
          stream.on('data', (chunk) => { buffer += chunk })
        })

        // Parse message data
        msg.once('end', () => {
          // Parse email buffer
          parseBuffer(buffer, (err, mail) => {
            if (err) return this.emit('error', err)

            // Parse email html
            if (mail.html) {
              mail.html = htmlToText.fromString(mail.html)
            }

            // Emit mail event
            this.emit('mail', mail)
          })
        })
      })
    })
  }

  public end () {
    this.imap.end()
  }
}

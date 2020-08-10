import { EventEmitter } from 'events'
import { createTransport, Transporter, SendMailOptions } from 'nodemailer'
import { ParsedMail } from 'mailparser'
import { promisify } from 'util'
import MailListener from './MailListener'
import { Auth, AuthWithSmtp, AuthWithTransporter } from './gators'

export default class Email extends EventEmitter {
  private mailer: Transporter
  private listener?: MailListener

  constructor (private auth: Auth) {
    super()

    const { account, defaults } = this.auth
    const transport = (this.auth as AuthWithTransporter).transport
    const smtp = (this.auth as AuthWithSmtp).smtp

    if (transport) {
      this.mailer = transport
    } else if (smtp) {
      this.mailer = createTransport({ ...smtp, auth: account }, defaults)
    } else {
      throw new Error('Either `smtp` or `transport` option must be set in `auth` object.')
    }
  }

  public connect () {
    const { imap, account } = this.auth
    this.listener = new MailListener({ ...imap, ...account })
    const { listener } = this

    listener.on('imap:connected', () => this.emit('imap:connected'))
    listener.on('imap:disconnected', () => this.emit('imap:disconnected'))
    listener.on('incoming', (id: string) => this.emit('arrived', id))
    listener.on('mail', (mail: ParsedMail) => this.emit('mail', mail))
  }

  public sendMail (options: SendMailOptions): Promise<any> {
    const sendMailPromise = promisify(this.mailer.sendMail.bind(this.mailer))
    return sendMailPromise(options)
  }

  public end () {
    if (this.listener) {
      this.listener.end()
    }
  }
}

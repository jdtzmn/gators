import { EventEmitter } from 'events'
import merge from 'lodash/merge'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { ImapAuth } from './MailListener'
import { getCarrier, generateEmail } from './carriers'
import Email from './Email'
import { Separator, SeparatorData, MessageDetails, Mail } from './Separator'
import separators from '../separators'
import { SendMailOptions } from 'nodemailer'

// ==============================
// ============ TYPES ===========
// ==============================

interface Account {
  user: string
  pass: string
}

export interface Auth {
  account: Account
  smtp: Omit<ImapAuth, 'user' | 'pass'>
  imap: Omit<ImapAuth, 'user' | 'pass'>
  defaults?: SMTPTransport.Options
}

interface SendEmailOptions extends SendMailOptions {
  to: string
}

interface SendTextOptions extends SendEmailOptions {
  body: string
}

type ReplyFunction = (options: string | SendEmailOptions) => Promise<void>

// ==============================
// =========== GATORS ===========
// ==============================

declare interface Gators {
  on (event: 'connected', listener: () => void): this
  on (event: 'message', listener: (details: MessageDetails, sendReply: ReplyFunction) => void): this
  on (event: 'email', listener: (mail: Mail) => void): this
  on (event: 'error', listener: (err: Error) => void): this
  on (event: string, listener: Function): this
}

class Gators extends EventEmitter {
  private email: Email
  private separators: Separator[]

  constructor (auth: Auth, customSeparators: Separator[] = []) {
    super()

    this.email = new Email(auth)
    this.separators = separators.concat(customSeparators)
  }

  public connect () {
    this.email.connect()

    this.email.on('imap:connected', () => this.emit('connected'))
    this.email.on('imap:disconnected', () => this.emit('disconnected'))
    this.email.on('error', (err: Error) => this.emit('error', err))

    this.email.on('mail', (mail: Mail) => this.handleMail(mail))
  }

  private async passAlongMail (mail: Mail) {
    // Emit an 'email' event because it isn't from an SMS gateway
    return this.emit('email', mail)
  }

  private async handleMail (mail: Mail) {
    const from = mail.from
    if (typeof from === 'undefined') {
      await this.passAlongMail(mail)
    }

    const firstFromValue = from!.value[0]
    const carrier = getCarrier(firstFromValue.address)

    if (carrier === null) {
      await this.passAlongMail(mail)
    }

    const separatorData: SeparatorData = {
      from: firstFromValue,
      text: mail.text,
      attachments: mail.attachments
    }

    // Generate message details by using separators on email data
    const separatedMessage = await this.runSeparators(carrier!, separatorData)

    // Emit a message event
    this.emit('message', separatedMessage, this.constructReplyFn(separatedMessage.from.address))
  }

  private async runSeparators (carrier: string, separatorData: SeparatorData): Promise<MessageDetails> {
    const details: MessageDetails = { from: separatorData.from }

    for (let separator of this.separators) {
      const isApplicable = await separator.test(carrier, separatorData)
      if (isApplicable) {
        const detailsUpdate = await separator.execute(separatorData)
        merge(details, detailsUpdate)
      }
    }

    return details
  }

  private constructReplyFn (address: string): ReplyFunction {
    return async (options: string | SendEmailOptions): Promise<void> => {
      const emailOptions: SendEmailOptions = {
        to: address
      }

      if (typeof options === 'string') {
        emailOptions.text = options
      } else {
        merge(emailOptions, options)
        emailOptions.to = address
      }

      await this.send(emailOptions)
    }
  }

  // ==============================
  // ======== ADD SEPARATOR =======
  // ==============================

  public separate (separator: Separator) {
    // Add the separator to the list of separators
    this.separators.push(separator)

    // Return 'this' so that this command can be chained
    return this
  }

  // ==============================
  // ========= SEND EMAILS ========
  // ==============================

  public async send (options: SendEmailOptions): Promise<void> {
    if (!this.email) {
      throw new Error("The 'start' method was not called prior to sending messages")
    }

    await this.email.sendMail({
      to: options.to,
      subject: options.subject || '',
      text: options.text,
      html: `<div dir="ltf">${options.text}</div>`
    })
  }

  public async sendText (phone: string | number, carrier: string, options: string | SendTextOptions): Promise<void> {
    let emailOptions: SendEmailOptions

    // Handle options being a string
    if (typeof options === 'string') {
      emailOptions = { to: '', text: options }
    } else {
      emailOptions = options
      emailOptions.text = options.body
    }

    // Generate an email from the number and carrier
    const email = generateEmail(carrier, String(phone))
    emailOptions.to = email

    // Send the text
    return this.send(emailOptions)
  }
}

export default Gators

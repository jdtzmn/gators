import { ParsedMail as Mail, EmailAddress } from 'mailparser'

export interface SeparatorData {
  from: EmailAddress,
  text: Mail['text'],
  attachments: Mail['attachments']
}

export interface MessageDetailsFragment {
  [key: string]: any
}

export interface MessageDetails extends MessageDetailsFragment {
  from: EmailAddress
}

/**
 * Separator functions take details from the email and separate them into their own keys
 * on the object. For example, a separator might read email attachments and 
 */
export interface Separator {
  test (carrier: string, message: SeparatorData): Promise<boolean>
  execute (message: SeparatorData): Promise<MessageDetailsFragment>
}

export { ParsedMail as Mail } from 'mailparser'
export default Separator

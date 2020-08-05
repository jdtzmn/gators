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
export abstract class Separator {
  abstract test (carrier: string, message: SeparatorData): Promise<boolean>
  abstract execute (message: SeparatorData): Promise<MessageDetailsFragment>

  public filterAttachments(attachments: SeparatorData['attachments'], contentType: string) {
    return attachments.filter(({ contentType: attachmentContentType }) => {
      return attachmentContentType === contentType
    })
  }

  public hasAttachmentsOfType(attachments: SeparatorData['attachments'], contentType: string) {
    return this.filterAttachments(attachments, contentType).length > 0
  }
}

export interface Attachment {
  name: string
  raw: Buffer
}

export interface ImageAttachment extends Attachment {
  base64: string
}

export { ParsedMail as Mail } from 'mailparser'
export default Separator

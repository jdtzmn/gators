import { Separator, SeparatorData, MessageDetailsFragment, Mail } from '../src/Separator'

class TMobileTextSeparator implements Separator {
  private getTextAttachments = (attachments: Mail['attachments']) => attachments
    .filter(({ contentType }) => contentType === 'text/plain')

  public async test (carrier: string, { attachments }: SeparatorData) {
    const carrierIsTMobile = carrier === 'T-Mobile'
    const isText = this.getTextAttachments(attachments).length > 0

    return carrierIsTMobile && isText
  }

  public async execute ({ attachments }: SeparatorData) {
    const texts = this.getTextAttachments(attachments)
    const text = texts[0].content.toString()

    const detailsFragment: MessageDetailsFragment = { text }
    return detailsFragment
  }
}

export default [ new TMobileTextSeparator() ]

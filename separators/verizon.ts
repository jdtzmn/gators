import { Separator, SeparatorData, MessageDetailsFragment, Mail } from '../src/Separator'

class VerizonTextSeparator implements Separator {
  private getTextAttachments = (attachments: Mail['attachments']) => attachments
    .filter(({ contentType }) => contentType === 'text/plain')

  public async test (carrier: string, { attachments }: SeparatorData) {
    const carrierIsVerizon = carrier === 'Verizon'
    const isText = this.getTextAttachments(attachments).length > 0

    return carrierIsVerizon && isText
  }

  public async execute ({ attachments }: SeparatorData) {
    const texts = this.getTextAttachments(attachments)
    const text = texts[0].content.toString()

    const detailsFragment: MessageDetailsFragment = { text }
    return detailsFragment
  }
}

export default [ new VerizonTextSeparator() ]

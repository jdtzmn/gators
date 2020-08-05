import { Separator, SeparatorData, MessageDetailsFragment, Mail, ImageAttachment } from '../Separator'

// ==============================
// ======== TEXT SEPARATOR ======
// ==============================

class AttTextSeparator extends Separator {
  public async test (carrier: string, message: SeparatorData) {
    const carrierIsTMobile = carrier === 'AT&T'

    return carrierIsTMobile && typeof message.text !== 'undefined'
  }

  public async execute ({ text }: SeparatorData) {
    const detailsFragment: MessageDetailsFragment = { text }
    return detailsFragment
  }
}

export default [ new AttTextSeparator() ]

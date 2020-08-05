import { Separator, SeparatorData, MessageDetailsFragment, Mail, ImageAttachment } from '../Separator'

// ==============================
// ======== TEXT SEPARATOR ======
// ==============================

class DefaultTextSeparator extends Separator {
  public async test (_carrier: string, { attachments }: SeparatorData) {
    const hasText = this.hasAttachmentsOfType(attachments, 'text/plain')
    return hasText
  }

  public async execute ({ attachments }: SeparatorData) {
    const texts = this.filterAttachments(attachments, 'text/plain')
    const text = texts[0].content.toString()

    const detailsFragment: MessageDetailsFragment = { text }
    return detailsFragment
  }
}

// ==============================
// ======= IMAGE SEPARATOR ======
// ==============================

class DefaultImageSeparator extends Separator {
  public async test (_carrier: string, { attachments }: SeparatorData) {
    const hasImages = this.hasAttachmentsOfType(attachments, 'image/jpeg')
    return hasImages
  }

  public async execute ({ attachments }: SeparatorData) {
    const images = this.filterAttachments(attachments, 'image/jpeg')

    // decode images
    const decodedImages: ImageAttachment[] = images.map((image) => ({
      name: image.filename || '',
      base64: 'data:image/jpeg;base64,' + image.content.toString('base64'),
      raw: image.content
    }))

    const detailsFragment: MessageDetailsFragment = { images: decodedImages }
    return detailsFragment
  }
}

export default [
  new DefaultTextSeparator(),
  new DefaultImageSeparator()
]

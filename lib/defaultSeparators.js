// ==============================
// ======== TEXT SEPARATER ======
// ==============================

const separateText = (prev, attachments, next) => {
  const texts = attachments.filter((e) => e.contentType === 'text/plain')

  // decode text
  const data = texts.map((text) => ({
    value: text.content.toString(),
    raw: text.content
  }))

  // send back data
  next('texts', data)
}

// ==============================
// ======= IMAGE SEPARATOR ======
// ==============================

const separateImages = (prev, attachments, next) => {
  const images = attachments.filter((e) => e.contentType === 'image/jpeg')

  // decode images
  const data = images.map((image) => ({
    value: 'data:image/jpeg;base64,' + image.content.toString('base64'),
    raw: image.content,
    name: image.filename
  }))

  // send back data
  next('images', data)
}

// ==============================
// ======= SEPARATER TESTS ======
// ==============================

// ------- TEXT SEPARATER -------
const testTextSeparator = (carrier, attachments) => {
  // test to see if this separator applies
  if (attachments.filter((e) => e.contentType === 'text/plain').length > 0) {
    // return separator function if the separator passes the test
    return separateText
  } else {
    // otherwise return false
    return false
  }
}

// ------ IMAGE SEPARATER ------
const testImageSeparator = (carrier, attachments) => {
  // test to see if this separator applies
  if (attachments.filter((e) => e.contentType === 'image/jpeg').length > 0) {
    // return separator function if the separator passes the test
    return separateImages
  } else {
    // otherwise return false
    return false
  }
}

module.exports = [
  testTextSeparator,
  testImageSeparator
]

// ==============================
// ======== TEXT SEPARATOR ======
// ==============================

const separateText = (prev, mail, next) => {
  // send back data
  next('text', mail.text)
}

// ==============================
// ======= IMAGE SEPARATOR ======
// ==============================

const separateImages = (prev, mail, next) => {
  const images = mail.attachments.filter((e) => e.contentType === 'image/jpeg')

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
// ======= SEPARATOR TESTS ======
// ==============================

// ------- TEXT SEPARATOR -------
const testTextSeparator = (carrier, mail) => {
  // test to see if this separator applies
  if (carrier === 'AT&T' && mail.text) {
    // return separator function if the separator passes the test
    return separateText
  } else {
    // otherwise return false
    return false
  }
}

// ------ IMAGE SEPARATOR ------
const testImageSeparator = (carrier, mail) => {
  // test to see if this separator applies
  if (carrier === 'AT&T' && mail.attachments.filter((e) => e.contentType === 'image/jpeg').length > 0) {
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

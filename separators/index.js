const tmobile = require('./t-mobile.js')
const att = require('./at&t.js')

const separators = []
  .concat(tmobile)
  .concat(att)

module.exports = separators

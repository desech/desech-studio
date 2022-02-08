import { nanoid, customAlphabet } from 'nanoid'

export default {
  generateID () {
    // we don't use node.js crypto.randomUUID() because we need this in the browser too
    return nanoid()
  },

  generateAlphaNumID (length) {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    return customAlphabet(alphabet, length)()
  },

  generateSmallID () {
    return this.generateAlphaNumID(6)
  },

  generateMediumID () {
    return this.generateAlphaNumID(32)
  }
}

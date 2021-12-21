import { nanoid, customAlphabet } from 'nanoid'

export default {
  generateID () {
    // we don't use node.js crypto.randomUUID() because we need this in the browser too
    return nanoid()
  },

  generateSmallID () {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    return customAlphabet(alphabet, 6)()
  }
}

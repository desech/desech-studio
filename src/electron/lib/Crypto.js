import { nanoid, customAlphabet } from 'nanoid'

export default {
  generateID () {
    // we don't use crypto.randomUUID() because this is used in browser too
    return nanoid()
  },

  generateSmallID () {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    return customAlphabet(alphabet, 6)()
  }
}

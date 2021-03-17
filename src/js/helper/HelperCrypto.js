export default {
  generateSmallHash () {
    let firstPart = (Math.random() * 46656) | 0
    let secondPart = (Math.random() * 46656) | 0
    firstPart = ('000' + firstPart.toString(36)).slice(-3)
    secondPart = ('000' + secondPart.toString(36)).slice(-3)
    return firstPart + secondPart
  },

  generateHash (length = null) {
    const array = new Uint8Array((length || 64) / 2)
    window.crypto.getRandomValues(array)
    return Array.from(array, dec => {
      return dec.toString(16).padStart(2, '0')
    }).join('')
  }
}

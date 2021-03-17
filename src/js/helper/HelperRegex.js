export default {
  getMatchingGroups (string, regex) {
    const matches = string.matchAll(regex)
    const results = []
    for (const match of matches) {
      const data = {}
      for (const [name, val] of Object.entries(match.groups)) {
        data[name] = val || ''
      }
      results.push(data)
    }
    return results
  },

  splitByCharacter (string, delimiter) {
    // regex is /(?![^(]*\))/gi
    const regex = new RegExp(`${delimiter}(?![^(]*\\))`, 'gi')
    return string.split(regex)
  }
}

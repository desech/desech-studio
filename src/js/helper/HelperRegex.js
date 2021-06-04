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
  },

  // https://stackoverflow.com/a/25060605/13817884
  splitNoParenthesis (value) {
    let left = 0
    let right = 0
    let array = []
    const match = value.match(/([^()]+)|([()])/g)
    const length = match.length
    let next = null
    let str = ''
    for (let i = 0; i < length; i++) {
      next = match[i]
      if (next === '(') {
        ++left
      } else if (next === ')') {
        ++right
      }
      if (left !== 0) {
        str += next
        if (left === right) {
          array[array.length - 1] += str
          left = right = 0
          str = ''
        }
      } else {
        array = array.concat(next.match(/([^ ]+)/g))
      }
    }
    return array
  }
}

export default {
  startsNumeric (string) {
    return /^-?[0-9]([0-9.,]+)?/.test(string)
  },

  isNumeric (string) {
    return !isNaN(parseFloat(string)) && isFinite(string)
  },

  roundToTwo (num) {
    return +(Math.round(parseFloat(num) + 'e+2') + 'e-2')
  },

  capitalize (string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  },

  toKebab (string) {
    return string.replace(/\s+/g, '-').toLowerCase()
  },

  toCamelCase (string) {
    return string.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ''
      return (index === 0) ? match.toLowerCase() : match.toUpperCase()
    }).replace(/\W/g, '')
  },

  camelCaseToKebab (string) {
    return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  },

  unique (array) {
    return [...new Set(array)]
  },

  countBy (array, check) {
    const counts = {}
    for (const num of array) {
      if (num === check) {
        counts[check] = counts[check] ? counts[check] + 1 : 1
      }
    }
    return counts[check]
  },

  parseJsonNoError (string) {
    try {
      return JSON.parse(string)
    } catch (error) {
      return string
    }
  },

  insertAndShift (array, from, to) {
    const cutOut = array.splice(from, 1)[0]
    array.splice(to, 0, cutOut)
    return array
  },

  isEmpty (obj) {
    return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object)
  },

  clearEmptyObjects (obj) {
    for (const prop in obj) {
      if (!obj[prop] || typeof obj[prop] !== 'object') {
        continue
      }
      this.clearEmptyObjects(obj[prop])
      if (this.isEmpty(obj[prop])) {
        delete obj[prop]
      }
    }
  },

  objectsEqual (obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
  },

  arraysEqual (a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; ++i) {
      // this doesn't deal with same but unsorted array elements
      if (a[i] !== b[i]) return false
    }
    return true
  },

  arrayDifference (a, b) {
    return a.filter(x => !b.includes(x))
  },

  arrayIntersect (a, b) {
    return a.filter(x => b.includes(x))
  },

  countMatches (string, search) {
    return (string.match(new RegExp(search, 'gi')) || []).length
  },

  cloneData (data) {
    return JSON.parse(JSON.stringify(data))
  },

  escapeRegExp (string) {
    // $& means the whole matched string
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  },

  // we presume all versions are of this format "1.4" or "1.10.2.3", without letters
  // returns: 1 (bigger), 0 (same), -1 (smaller)
  versionCompare (v1, v2) {
    const v1Parts = v1.split('.')
    const v2Parts = v2.split('.')
    const length = Math.max(v1Parts.length, v2Parts.length)
    for (let i = 0; i < length; i++) {
      const value = (parseInt(v1Parts[i]) || 0) - (parseInt(v2Parts[i]) || 0)
      if (value < 0) return -1
      if (value > 0) return 1
    }
    return 0
  },

  mergeDeep (target, ...sources) {
    if (!sources.length) return target
    const source = sources.shift()
    if (typeof target === 'object' && typeof source === 'object') {
      for (const key in source) {
        if (typeof source[key] === 'object') {
          if (!target[key]) Object.assign(target, { [key]: {} })
          this.mergeDeep(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      }
    }
    return this.mergeDeep(target, ...sources)
  }
}

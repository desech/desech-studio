import HelperRegex from '../HelperRegex.js'

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient
 * https://drafts.csswg.org/css-images-3/#typedef-color-stop-list
 *
 * linear-gradient(
 * [ <angle> | to <side-or-corner> ,]? <color-stop-list> )
 * \---------------------------------/ \----------------------------/
 * Definition of the gradient line        List of color stops
 *
 * where <side-or-corner> = [ left | right ] || [ top | bottom ]
 * and <color-stop-list> =
 * <linear-color-stop> , [ <linear-color-hint>? , <linear-color-stop> ]#
 * <linear-color-stop> = <color> && <length-percentage>?
 * <linear-color-hint> = <length-percentage>
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/radial-gradient
 *
 * radial-gradient(
 *  [ [ circle || <length> ]                         [ at <position> ]? , |
 *    [ ellipse || [ <length> | <percentage> ]{2} ]  [ at <position> ]? , |
 *    [ [ circle | ellipse ] || <extent-keyword> ] [at <position> ]? , |
 *    at <position> ,
 *  ]?
 *  <color-stop-list> [ , <color-stop-list> ]+
 * )
 * where <extent-keyword> = closest-corner | closest-side | farthest-corner | farthest-side
 * and <color-stop-list> = [ <linear-color-stop> [, <color-hint>? ]? ]#, <linear-color-stop>
 * and <linear-color-stop> = <color> [ <color-stop-length> ]?
 * and <color-stop-length> = [ <percentage> | <length> ]{1,2}
 * and <color-hint> = [ <percentage> | <length> ]
 */
export default {
  parse (string) {
    const main = this.getBackgrounds(string)
    const results = []
    for (const val of main) {
      const value = (val.type === 'url') ? this.getImageObject(val) : this.getGradientObject(val)
      results.push(value)
    }
    return results
  },

  getGradientObject (val) {
    return {
      type: val.type,
      repeating: val.repeating === 'repeating',
      line: this.getGradientLine(val.value, val.type),
      colors: this.getColors(val.value)
    }
  },

  getImageObject (val) {
    return {
      type: 'image',
      url: val.value
    }
  },

  getBackgrounds (string) {
    return HelperRegex.getMatchingGroups(string, /((?<repeating>repeating)-)?(?<type>(linear)?(radial)?-gradient|url)\((?<value>.*?(%|\.jpg|\.png|\.gif|\.svg))\)/gi)
  },

  getBackgroundValues (string) {
    const backgrounds = HelperRegex.getMatchingGroups(string, /(?<value>(repeating-)?((linear)?(radial)?-gradient|url)\(.*?(%|\.jpg|\.png|\.gif|\.svg)(")?\))/gi)
    const result = []
    for (const val of backgrounds) {
      result.push(val.value)
    }
    return result
  },

  getColors (string) {
    return HelperRegex.getMatchingGroups(string, /((?<rgb>rgb(a)?\(.*?\)) (?<position>(.*?%)))/gi)
  },

  getGradientLine (string, type) {
    const value = this.getGradientLineValue(string)
    if (type === 'linear-gradient') {
      return this.getLinearGradientLine(value)
    } else if (type === 'radial-gradient') {
      return this.getRadialGradientLine(value)
    } else {
      throw new Error('Unknown type')
    }
  },

  getGradientLineValue (string) {
    return string.substring(0, 3) !== 'rgb' ? string.substring(0, string.indexOf(',')) : ''
  },

  getLinearGradientLine (value) {
    return value ? { angle: value } : {}
  },

  getRadialGradientLine (value) {
    const sides = value.split('at ')
    const first = sides[0] ? sides[0].trim() : ''
    const second = sides[1] ? sides[1].trim() : ''
    return { ...this.getRadialGradientFirstLine(first), ...this.getRadialGradientSecondLine(second) }
  },

  getRadialGradientFirstLine (value) {
    const data = {}
    if (value) {
      if (['closest-side', 'farthest-side', 'closest-corner', 'farthest-corner'].includes(value)) {
        data.size = value
      } else {
        data.size = 'length'
        const chunks = value.split(' ')
        data.width = chunks[0]
        data.height = chunks[1] || chunks[0]
      }
    }
    return data
  },

  getRadialGradientSecondLine (value) {
    const data = {}
    if (value) {
      const chunks = value.split(' ')
      data.x = chunks[0]
      data.y = chunks[1] || chunks[0]
    }
    return data
  },

  convertBgToColor (string) {
    const colors = this.getColors(string)
    if (colors.length === 2 && colors[0].rgb === colors[1].rgb && colors[0].position === '0%' && colors[1].position === '100%') {
      return colors[0].rgb
    } else {
      return string
    }
  }
}

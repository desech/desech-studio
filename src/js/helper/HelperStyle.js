import HelperRegex from './HelperRegex.js'
import HelperProject from './HelperProject.js'
import ExtendJS from './ExtendJS.js'

export default {
  buildRefSelector (ref) {
    return '.' + ref
  },

  buildClassSelector (className) {
    return '._ss_' + className
  },

  buildRule (selector, property = '', value = '', responsive = null) {
    const declaration = this.buildDeclaration(property, value)
    const responsiveCls = this.buildResponsiveClass(responsive)
    return `@media { ${responsiveCls}${selector} { ${declaration} } }`
  },

  buildDeclaration (property, value) {
    return (property && value) ? `${property}: ${value};` : ''
  },

  buildResponsiveClass (data) {
    if (!data || (!data['min-width'] && !data['max-width'])) return ''
    const value = data['min-width'] || data['max-width']
    const cls = this.getResponsiveClass(value)
    return `.${cls} `
  },

  getResponsiveClass (value) {
    return `responsive-${value}`
  },

  getSelectorResponsive (selector) {
    if (!selector.startsWith('.responsive-')) return ''
    const responsiveType = HelperProject.getProjectSettings().responsiveType
    const widthType = (responsiveType === 'desktop') ? 'max-width' : 'min-width'
    const value = selector.match(/.responsive-(.*?) /)[1]
    return { [widthType]: value }
  },

  getSelectorLabel (selector, ref, type = null) {
    let label = (type === 'variant')
      ? this.getVariantSelectorLabel(selector, ref)
      : selector.replace(/\.e0[a-z0-9]+\[data-variant.*?]/g, '')
    label = ExtendJS.removeExtraSpace(label.replace('.' + ref, ''))
    return this.sanitizeSelector(label)
  },

  getVariantSelectorLabel (selector, ref) {
    const first = this.extractVariantSelector(selector)
    const last = selector.substring(selector.indexOf(ref) + ref.length)
    return first + last
  },

  sanitizeSelector (value) {
    return this.removeResponsive(value).replaceAll('._ss_', '.')
  },

  removeResponsive (value) {
    return value.replace(/.responsive-(.*?) /, '')
  },

  extractComponentSelector (selector) {
    const match = /\.(cmp-[a-z0-9-]+\[data-variant~=".*?"\])/gi.exec(selector)
    return match ? match[1] : null
  },

  extractVariantSelector (selector) {
    const match = /data-variant~="(.*?)"/g.exec(selector)
    return match ? match[1] : null
  },

  extractComponentVariant (selector) {
    const match = /\.(cmp-.*?)\[data-variant~="(.*?)"\]/g.exec(selector)
    if (!match) return null
    const [varName, varValue] = match[2].split('=')
    return { name: match[1], varName, varValue }
  },

  extractRefSelector (selector) {
    const match = /\.(e0[a-z0-9]+)/g.exec(selector)
    return match ? match[1] : null
  },

  extractClassSelector (selector) {
    if (selector === ':root') return ''
    const match = /^\.(_ss_[a-z0-9-_]+)/gi.exec(selector)
    return match && match[1] ? match[1] : ''
  },

  getViewableClass (name) {
    return name ? name.replace('_ss_', '') : ''
  },

  equalsSelector (selector, part, ends = true) {
    const endPart = ends ? '$' : ''
    const query = `^(\\.responsive-[0-9]+px )?${ExtendJS.escapeRegExp(part)}${endPart}`
    const regex = new RegExp(query, 'gi')
    return regex.test(selector)
  },

  selectorStartsWith (selector, part) {
    return this.equalsSelector(selector, part, false)
  },

  isSelectorRefComponent (selector, ref) {
    const regex = new RegExp(`^(\\.responsive-[0-9]+px )?\\.${ref}`, 'g')
    return regex.test(selector)
  },

  isClassSelector (selector) {
    // can have a responsive class in front
    return selector.includes('._ss_')
  },

  isVariantSelector (selector) {
    return /\.(cmp-[a-z0-9-]+\[data-variant~=".*?"\])/gi.test(selector)
  },

  isCssComponentClass (cls) {
    return cls.startsWith('_ss_')
  },

  hasSelectorClass (element) {
    const className = element.getAttributeNS(null, 'class')
    return className.includes('_ss_')
  },

  classBelongsToElement (selector, classes) {
    const name = this.extractClassSelector(selector)
    return classes.includes(name)
  },

  get4SidesValue (side, fullValue) {
    const chunks = this.split4SidesValue(fullValue)
    return this.extract4SidesValue(chunks, side)
  },

  extract4SidesValue (chunks, side) {
    return (side === 'all') ? chunks.top : chunks[side]
  },

  set4SidesValue (side, value, fullValue) {
    const chunks = this.split4SidesValue(fullValue)
    this.insert4SidesValue(chunks, side, value)
    return this.join4SidesChunks(chunks)
  },

  split4SidesValue (value) {
    const chunks = value.split(' ')
    switch (chunks.length) {
      case 4:
        return {
          top: chunks[0],
          right: chunks[1],
          bottom: chunks[2],
          left: chunks[3]
        }
      case 3:
        return {
          top: chunks[0],
          right: chunks[1],
          bottom: chunks[2],
          left: chunks[1]
        }
      case 2:
        return {
          top: chunks[0],
          right: chunks[1],
          bottom: chunks[0],
          left: chunks[1]
        }
      case 1:
        return {
          top: chunks[0],
          right: chunks[0],
          bottom: chunks[0],
          left: chunks[0]
        }
    }
  },

  insert4SidesValue (chunks, side, value) {
    if (side === 'all') {
      chunks.top = chunks.right = chunks.bottom = chunks.left = value
    } else {
      chunks[side] = value
    }
  },

  join4SidesChunks (chunks) {
    if (chunks.top === chunks.right && chunks.right === chunks.bottom &&
      chunks.bottom === chunks.left) {
      // one value
      return chunks.top
    } else if (chunks.top === chunks.bottom && chunks.left === chunks.right) {
      // 2 values
      return chunks.top + ' ' + chunks.right
    } else if (chunks.left === chunks.right) {
      // 3 values
      return chunks.top + ' ' + chunks.right + ' ' + chunks.bottom
    } else {
      // 4 values
      return chunks.top + ' ' + chunks.right + ' ' + chunks.bottom + ' ' + chunks.left
    }
  },

  getBackgroundType (string) {
    if (string.includes('linear-gradient')) {
      return 'linear-gradient'
    } else if (string.includes('radial-gradient')) {
      return 'radial-gradient'
    } else if (string.includes('url(')) {
      return 'image'
    } else {
      return 'solid-color'
    }
  },

  parseCSSValues (string, options) {
    if (!string || !string.trim()) return []
    const values = HelperRegex.splitByCharacter(string, options.valuesDelimiter)
    const result = []
    for (const val of values) {
      result.push(this.parseCSSValue(val, options))
    }
    return result
  },

  parseCSSValue (string, options) {
    const obj = { value: string }
    const extract = this.extractFunctionParams(string) || {}
    if (extract.function) {
      obj.function = extract.function
      obj.paramsString = extract.params
    }
    obj.params = this.parseCSSParams(extract.params || string, options)
    return obj
  },

  parseCSSParams (string, options) {
    const params = HelperRegex.splitByCharacter(string, options.paramsDelimiter)
    const result = []
    for (const param of params) {
      const obj = { value: param }
      const extract = this.extractFunctionParams(param) || {}
      if (extract.function) {
        obj.function = extract.function
        obj.paramsString = extract.params
      }
      if (options.subParamsDelimiter) {
        obj.params = HelperRegex.splitByCharacter(extract.params || param,
          options.subParamsDelimiter)
      }
      result.push(obj)
    }
    return result
  },

  extractFunctionParams (string) {
    return HelperRegex.getMatchingGroups(string, /^(?<function>\b[^( )]+)\((?<params>.*)\)$/gi)[0]
  },

  getParsedCSSParam (data, index, property = 'value') {
    return (data && data.params && data.params[index]) ? data.params[index][property] : ''
  },

  getParsedCSSSubParam (data, index, subIndex) {
    if (data && data.params && data.params[index] && data.params[index].params[subIndex]) {
      return data.params[index].params[subIndex]
    } else {
      return ''
    }
  },

  addSelectorClass (selector, classes) {
    const matches = selector.matchAll(/\._ss_([a-z0-9-_]+)/g)
    for (const match of matches) {
      classes.push(match[1])
    }
  },

  getInlineStyle (element, ignoreZeroValues = false) {
    return Array.from(element.style).reduce((style, name) => {
      const value = element.style[name]
      style[name] = (ignoreZeroValues && this.isEmptyValue(value)) ? '' : value
      return style
    }, {})
  },

  isEmptyValue (value) {
    return !value || value === '0' || value === '0px'
  },

  getDefaultProperty (property) {
    switch (property) {
      case 'background-size':
        return 'auto'
      case 'background-position':
        return '0% 0%'
      case 'background-repeat':
        return 'repeat'
      case 'background-attachment':
        return 'scroll'
      case 'background-origin':
        return 'padding-box'
      case 'background-blend-mode':
        return 'normal'
    }
  },

  sanitizeClass (name) {
    // only allow alphanumeric, dashes and underscore
    // material design uses BEM, so we need to allow weirdness like -- and __
    return name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  },

  isValidCssClass (cls) {
    return (cls !== 'block' && cls !== 'text' && !cls.startsWith('e0') && !cls.startsWith('cmp-'))
  }
}

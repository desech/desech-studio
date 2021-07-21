import SketchCommon from './SketchCommon.js'
import ParseCommon from '../ParseCommon.js'

export default {
  getCssText (type, style, css) {
    if (type !== 'text' && type !== 'inline') return
    return {
      ...this.getAutoWidth(style),
      ...this.getAlignment(style),
      ...ParseCommon.getFontFamily(this.getFontFamily(style), css),
      ...ParseCommon.getPropValue('font-weight', this.getFontWeight(style),
        this.getFontWeight(style) !== 400),
      ...ParseCommon.getPropValue('font-style', 'italic', this.isItalic(style)),
      ...ParseCommon.getPropValue('font-size', this.getFontSize(style) + 'px',
        this.getFontSize(style)),
      ...ParseCommon.getPropValue('line-height', this.getLineHeight(style) + 'px',
        this.getLineHeight(style)),
      ...ParseCommon.getPropValue('text-transform', this.getTransform(style),
        this.getTransform(style)),
      ...ParseCommon.getPropValue('text-decoration-line', this.getDecoration(style),
        this.getDecoration(style)),
      ...ParseCommon.getPropValue('vertical-align', this.getVerticalAlign(style),
        this.getVerticalAlign(style)),
      ...ParseCommon.getPropValue('letter-spacing', style.kerning, style.kerning),
      ...this.getColor(style)
    }
  },

  getAutoWidth (style) {
    // sizeType can be 0 (default / horizontal), 1 (vertical), 2 (fixed)
    if (style.sizeType) return { width: 'auto' }
  },

  getAlignment (style) {
    const css = {}
    const horizAlign = this.getTextAlign(style)
    if (horizAlign !== 'left') css['text-align'] = horizAlign
    // const vertAlign = this.getAlignSelf(style)
    // if (vertAlign !== 'start') css['align-self'] = vertAlign
    return css
  },

  getTextAlign (style) {
    if (!style.paragraphStyle) return
    const value = style.paragraphStyle.alignment
    const aligns = { 0: 'left', 1: 'right', 2: 'center', 3: 'justify' }
    return aligns[value]
  },

  // we don't import the height, so vertical aligning has no value
  // getAlignSelf (style) {
  //   const value = style.textStyleVerticalAlignmentKey
  //   const aligns = { 0: 'start', 1: 'center', 2: 'end' }
  //   return aligns[value]
  // },

  getFontFamily (style) {
    const name = this.getFontName(style)
    if (!name) return
    // example = ShadowsIntoLightTwo-Regular
    const font = name.substring(0, name.indexOf('-'))
    return font.replace(/([A-Z]+)/g, ' $1').trim()
  },

  getFontName (style) {
    if (style.MSAttributedStringFontAttribute.attributes) {
      return style.MSAttributedStringFontAttribute.attributes.name
    }
  },

  getFontWeight (style) {
    const name = this.getFontName(style)
    if (!name) return
    // example = ShadowsIntoLightTwo-ExtraLightItalic
    const weight = name.substring(name.indexOf('-') + 1).replace('Italic', '')
    return this.getWeights()[weight]
  },

  getWeights () {
    return {
      Thin: 100,
      ExtraLight: 200,
      Light: 300,
      Regular: 400,
      Medium: 500,
      SemiBold: 600,
      Bold: 700,
      ExtraBold: 800,
      Black: 900
    }
  },

  isItalic (style) {
    const name = this.getFontFamily(style)
    if (name) return name.indexOf('Italic') > 0
  },

  getFontSize (style) {
    if (style.MSAttributedStringFontAttribute.attributes) {
      return Math.round(style.MSAttributedStringFontAttribute.attributes.size)
    }
  },

  getLineHeight (style) {
    if (style.paragraphStyle) {
      return Math.round(style.paragraphStyle.maximumLineHeight)
    }
  },

  getTransform (style) {
    const value = style.MSAttributedStringTextTransformAttribute
    // title case is only supported by lunacy with "com.icons8.lunacy" and "isTitleCase"
    const transforms = { 1: 'uppercase', 2: 'lowercase' }
    return value ? transforms[value] : null
  },

  getDecoration (style) {
    let line = ''
    if (style.underlineStyle) line += 'underline'
    if (style.strikethroughStyle) line += ' line-through'
    return line.trim()
  },

  getVerticalAlign (style) {
    switch (style.NSSuperScript) {
      case 1:
        return 'super'
      case -1:
        return 'sub'
    }
  },

  getColor (style) {
    if (style.fills && style.fills.length) {
      if (style.fills.length > 1 || SketchCommon.getFillType(style.fills[0]) !== 'Solid') {
        return ParseCommon.getTextBackgroundCss()
      } else {
        return { color: SketchCommon.getColor(style.fills[0].color) }
      }
    } else if (style.MSAttributedStringColorAttribute) {
      return { color: SketchCommon.getColor(style.MSAttributedStringColorAttribute) }
    }
  }
}

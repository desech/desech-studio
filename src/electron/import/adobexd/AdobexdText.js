import ParseCommon from '../ParseCommon.js'
import AdobexdCommon from './AdobexdCommon.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getCssText (type, style, css) {
    if (type !== 'text' && type !== 'inline') return
    return {
      ...this.getAutoWidth(style),
      ...this.getAlignment(style),
      ...ParseCommon.getFontFamily(style.fontFamily, css),
      ...ParseCommon.getPropValue('font-weight', '700', style.fontStyle.includes('Bold')),
      ...ParseCommon.getPropValue('font-style', 'italic', style.fontStyle.includes('Italic')),
      ...ParseCommon.getPropValue('font-size', Math.round(style.fontSize) + 'px', style.fontSize),
      ...ParseCommon.getPropValue('text-transform', this.getTransform(style.textTransform),
        style.textTransform),
      ...ParseCommon.getPropValue('text-decoration-line', this.getDecoration(style),
        this.getDecoration(style)),
      ...ParseCommon.getPropValue('letter-spacing', ExtendJS.roundToTwo(style.charSpacing) + 'px',
        style.charSpacing),
      ...ParseCommon.getPropValue('vertical-align', this.getAlign(style.textScript),
        style.textScript),
      ...ParseCommon.getPropValue('line-height', Math.round(style.lineHeight) + 'px',
        style.lineHeight),
      ...ParseCommon.getPropValue('color', AdobexdCommon.getColor(style.color), style.color)
    }
  },

  getAutoWidth (style) {
    if (style.sizeType && style.sizeType !== 'positioned') {
      return { width: 'auto' }
    }
  },

  getAlignment (style) {
    const css = {}
    if (style.paragraphAlign) {
      // can be "center" or "right"; the "left" option doesn't exist
      css['text-align'] = style.paragraphAlign
    }
    return css
  },

  getTransform (transform) {
    switch (transform) {
      case 'uppercase':
      case 'lowercase':
        return transform
      case 'titlecase':
        return 'capitalize'
    }
  },

  getDecoration (style) {
    let line = ''
    if (style.underline) line += 'underline'
    if (style.strikethrough) line += ' line-through'
    return line.trim()
  },

  getAlign (type) {
    switch (type) {
      case 'superscript':
        return 'super'
      case 'subscript':
        return 'sub'
    }
  }
}

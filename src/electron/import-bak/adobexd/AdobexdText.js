import ParseCommon from '../ParseCommon.js'
import AdobexdCommon from './AdobexdCommon.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  getCssText (type, style, css) {
    if (type !== 'text' && type !== 'inline') return
    return {
      ...this.getAutoWidth(style),
      ...ParseCommon.getFontFamily(style.font?.family, css),
      ...ParseCommon.getPropValue('font-weight', '700', style.font?.style?.includes('Bold')),
      ...ParseCommon.getPropValue('font-style', 'italic', style.font?.style?.includes('Italic')),
      ...ParseCommon.getPropValue('font-size', Math.round(style.font?.size) + 'px',
        style.font?.size),
      ...ParseCommon.getPropValue('text-align', style.textAttributes?.paragraphAlign,
        style.textAttributes?.paragraphAlign),
      // ...ParseCommon.getPropValue('text-transform', this.getTransform(style), style),
      ...ParseCommon.getPropValue('text-decoration-line', this.getDecoration(style),
        style.textAttributes?.decoration?.length),
      ...ParseCommon.getPropValue('letter-spacing', this.getLetterSpacing(style),
        this.getLetterSpacing(style)),
      ...ParseCommon.getPropValue('vertical-align', this.getVerticalAlign(style),
        style.textAttributes?.verticalAlign),
      ...ParseCommon.getPropValue('line-height',
        Math.round(style.textAttributes?.lineHeight) + 'px', style.textAttributes?.lineHeight),
      ...ParseCommon.getPropValue('color', AdobexdCommon.getColor(style.fill?.color),
        style.fill?.color)
    }
  },

  getAutoWidth (style) {
    if (style.sizeType && style.sizeType !== 'positioned') {
      return { width: 'auto' }
    }
  },

  // @todo wait for adobe to add text transform to `style`
  // getTransform (transform) {
  //   switch (transform) {
  //     case 'uppercase':
  //     case 'lowercase':
  //       return transform
  //     case 'titlecase':
  //       return 'capitalize'
  //   }
  // },

  getDecoration (style) {
    const values = style.textAttributes?.decoration
    return values ? values.join(' ') : null
  },

  getLetterSpacing (style) {
    const value = style.textAttributes?.letterSpacing
    const number = ExtendJS.roundToTwo(value / 1000)
    return number ? number + 'em' : null
  },

  getVerticalAlign (style) {
    const value = style.textAttributes?.verticalAlign
    if (!value) return null
    return (parseInt(value) < 0) ? 'sub' : 'sup'
  }
}

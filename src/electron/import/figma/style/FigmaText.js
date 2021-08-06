import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getText (style, data) {
    if (data.designType !== 'text') return
    const record = {}
    if (style.fontFamily) record.fontFamily = style.fontFamily
    if (style.fontWeight) record.fontWeight = style.fontWeight
    if (style.fontSize) record.fontSize = Math.round(style.fontSize)
    if (style.italic) record.fontStyle = 'italic'
    this.addTextAlign(style, record)
    this.addAlignSelf(style, record)
    this.addLineHeight(style, record)
    this.addTextTransform(style, record)
    this.addTextDecoration(style, record)
    this.addLetterSpacing(style, record)
    return record
  },

  addTextAlign (style, record) {
    const textAlign = style.textAlignHorizontal ? style.textAlignHorizontal.toLowerCase() : null
    if (textAlign && textAlign !== 'left') record.textAlign = textAlign
  },

  addAlignSelf (style, record) {
    if (style.textAlignVertical === 'CENTER') {
      record.alignSelf = 'center'
    } else if (style.textAlignVertical === 'BOTTOM') {
      record.alignSelf = 'end'
    }
  },

  addLineHeight (style, record) {
    if (style.lineHeightPx && style.lineHeightPercent !== 100) {
      record.lineHeight = Math.round(style.lineHeightPx)
    }
  },

  addTextTransform (style, record) {
    switch (style.textCase) {
      case 'UPPER':
        record.textTransform = 'uppercase'
        break
      case 'LOWER':
        record.textTransform = 'lowercase'
        break
      case 'TITLE':
        record.textTransform = 'capitalize'
        break
    }
  },

  addTextDecoration (style, record) {
    if (style.textDecoration === 'UNDERLINE') {
      record.textDecoration = 'underline'
    } else if (style.textDecoration === 'STRIKETHROUGH') {
      record.textDecoration = 'line-through'
    }
  },

  addLetterSpacing (style, record) {
    if (style.letterSpacing) {
      record.letterSpacing = ExtendJS.roundToTwo(style.letterSpacing)
    }
  }
}

import ExtendJS from '../../../../js/helper/ExtendJS.js'

export default {
  getText (style, data) {
    if (data.designType !== 'text') return
    const record = {}
    if (style.fontFamily) record.fontFamily = style.fontFamily
    if (style.fontSize) record.fontSize = Math.round(style.fontSize)
    if (style.fontWeight) record.fontWeight = style.fontWeight
    if (style.italic) record.fontStyle = 'italic'
    this.addLineHeight(style, record)
    if (style.letterSpacing) record.letterSpacing = Math.round(style.letterSpacing)
    this.addTextAlign(style, record)
    this.addAlignSelf(style, record)
    this.addTextTransform(style, record)
    this.addTextDecoration(style, record)
    if (!ExtendJS.isEmpty(record)) return record
  },

  addLineHeight (style, record) {
    if (style.lineHeightPx && style.lineHeightPercent !== 100) {
      record.lineHeight = Math.round(style.lineHeightPx)
    }
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
  }
}

import HelperElement from '../../../js/helper/HelperElement.js'
import AdobexdText from './AdobexdText.js'
import ParseCommon from '../ParseCommon.js'

export default {
  processTextContent (element, type, css) {
    if (type !== 'text') return
    const inline = this.processInlineText(element, css)
    const content = ParseCommon.injectInlineElements(element.text.rawText, inline)
    return { content: content.replace(/\n/g, '\n<br>') }
  },

  processInlineText (element, css) {
    const data = []
    if (element.meta.ux.rangedStyles[0].length === 0) return data
    const tmp = { index: 0, last: null }
    for (const paragraph of element.text.paragraphs) {
      for (const line of paragraph.lines) {
        for (const string of line) {
          const inline = this.processInlineTextElem(string, element.meta.ux.rangedStyles, element.text.rawText, tmp, css)
          if (inline) data.push(inline)
        }
      }
    }
    return data
  },

  processInlineTextElem (string, styles, text, tmp, css) {
    // @todo \n are ignored, so when present, the `string.to` value is reduced by 1 which breaks the entire code
    const start = (tmp.last !== null) ? tmp.last : string.from // ignore the incremental `from` and use our stored value
    if (string.to - start === styles[tmp.index].length || string.to === text.length) {
      const inline = this.processInlineElement(string, start, styles[tmp.index], text, css)
      tmp.last = null
      tmp.index++
      return inline
    } else if (tmp.last === null) {
      tmp.last = string.from
    }
  },

  processInlineElement (string, start, style, text, css) {
    if (start === 0 && string.to === text.length) return // skip inline elements that cover the whole text
    const elemId = HelperElement.generateElementRef()
    const data = this.getInlineData(string, start, style, text, elemId)
    if (data) {
      css.element[elemId] = AdobexdText.getCssText('inline', {
        ...style,
        color: (string.style && string.style.fill) ? string.style.fill.color : null
      }, css)
    }
    return data
  },

  getInlineData (string, start, style, text, elemId) {
    const html = text.substring(start, string.to)
    return {
      start,
      end: string.to,
      html: `<span class="${elemId}">${html}</span>`
    }
  }
}

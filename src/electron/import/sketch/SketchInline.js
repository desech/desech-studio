import HelperElement from '../../../js/helper/HelperElement.js'
import SketchText from './SketchText.js'
import ParseCommon from '../ParseCommon.js'

export default {
  processTextContent (element, type, css) {
    if (type !== 'text' || !element.attributedString.string) return
    const inline = this.processInlineText(element, css)
    const content = ParseCommon.injectInlineElements(element.attributedString.string, inline)
    return { content: content.replace(/\n/g, '\n<br>') }
  },

  processInlineText (element, css) {
    const data = []
    const elemString = element.attributedString.string
    for (const text of element.attributedString.attributes) {
      if (text.location === 0 && text.length === elemString.length) {
        continue
      }
      const inline = this.processInlineElement(elemString, text, css)
      if (inline) data.push(inline)
    }
    return data
  },

  processInlineElement (string, text, css) {
    const elemId = HelperElement.generateElementRef()
    const data = this.getInlineHtml(string, elemId, text)
    if (data) {
      css.element[elemId] = SketchText.getCssText('inline', text.attributes, css)
    }
    return data
  },

  getInlineHtml (string, elemId, text) {
    const end = text.location + text.length
    const html = string.substring(text.location, end)
    return {
      start: text.location,
      end,
      html: `<em class="${elemId}">${html}</em>`
    }
  }
}

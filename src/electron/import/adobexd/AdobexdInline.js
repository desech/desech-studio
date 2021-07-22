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

  // don't use meta.ux.rangedStyles because it's buggy as hell
  processInlineText (element, css) {
    const data = []
    for (const paragraph of element.text.paragraphs) {
      for (const line of paragraph.lines) {
        for (const block of line) {
          const inline = this.processInlineElement(block, element.text.rawText, css)
          if (inline) data.push(inline)
        }
      }
    }
    return data
  },

  processInlineElement (block, text, css) {
    // skip inline elements that cover the whole text
    if (block.from === 0 && block.to === text.length) {
      return
    }
    const elemId = HelperElement.generateElementRef()
    const data = this.getInlineData(block, text, elemId)
    if (data && block.style) {
      css.element[elemId] = AdobexdText.getCssText('inline', block.style, css)
    }
    return data
  },

  getInlineData (block, text, elemId) {
    const html = text.substring(block.from, block.to)
    return {
      start: block.from,
      end: block.to,
      html: `<em class="${elemId}">${html}</em>`
    }
  }
}

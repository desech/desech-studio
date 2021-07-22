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
    if (block.from === 0 && block.to === text.length) return
    return {
      start: block.from,
      end: block.to,
      html: this.processHtmlCss(block, text, css)
    }
  },

  processHtmlCss (block, text, css) {
    let html = text.substring(block.from, block.to)
    if (block.style) {
      const elemId = HelperElement.generateElementRef()
      css.element[elemId] = AdobexdText.getCssText('inline', block.style, css)
      html = `<em class="${elemId}">${html}</em>`
    }
    return html
  }
}

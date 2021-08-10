import ImportCommon from '../ImportCommon.js'
import AdobexdText from './style/AdobexdText.js'
import AdobexdFillStroke from './style/AdobexdFillStroke.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  async addInlineText (data, node) {
    if (data.designType !== 'text') return
    const inline = await this.processInlineText(data, node)
    data.content = ImportCommon.injectInlineElements(node.text.rawText, inline)
  },

  // don't use meta.ux.rangedStyles because it's buggy as hell
  async processInlineText (data, node) {
    const info = []
    for (const paragraph of node.text.paragraphs) {
      for (const line of paragraph.lines) {
        for (const block of line) {
          const inline = await this.processInlineElement(block, node.text.rawText, data)
          if (inline) info.push(inline)
        }
      }
    }
    return info
  },

  async processInlineElement (block, text, data) {
    // skip inline elements that cover the whole text
    if (block.from === 0 && block.to === text.length) return
    return {
      start: block.from,
      end: block.to,
      html: await this.processHtmlCss(block, text, data)
    }
  },

  async processHtmlCss (block, text, data) {
    let html = text.substring(block.from, block.to)
    if (block.style) {
      const style = await this.getElementStyle(block)
      if (style.text || style.fills) {
        const ref = HelperElement.generateElementRef()
        data.inlineChildren.push({ desechType: 'text', ref, style })
        html = `<em class="${ref}">${html}</em>`
      }
    }
    return html
  },

  async getElementStyle (block) {
    return {
      text: AdobexdText.getText(block.style, { designType: 'text' }),
      // we don't have the settings parameter because images are ignored for text elements
      fills: await AdobexdFillStroke.getFills({ designType: 'text' }, block)
    }
  }
}

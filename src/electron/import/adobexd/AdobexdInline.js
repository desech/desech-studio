import ImportCommon from '../ImportCommon.js'
import AdobexdText from './style/AdobexdText.js'
import AdobexdFillStroke from './style/AdobexdFillStroke.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  async addInlineText (data, node) {
    if (data.desechType !== 'text') return
    // @todo fix it; we might have an error here complaining about undefined on `substring`
    if (!node.text?.rawText) {
      data.content = ''
      return
    }
    const inline = await this.processInlineText(data, node)
    // because of the imprecise width/height of our text, we can't have new lines
    const text = node.text.rawText.replaceAll('\n', ' ')
    data.content = ImportCommon.injectInlineElements(text, inline)
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
        data.inlineChildren.push({ desechType: 'text', inline: true, ref, style })
        html = `<em class="${ref}">${html}</em>`
      }
    }
    return html
  },

  async getElementStyle (block) {
    return {
      text: AdobexdText.getText(block.style, { desechType: 'text' }),
      // we don't have the settings parameter because images are ignored for text elements
      fills: await AdobexdFillStroke.getFills({ desechType: 'text' }, block)
    }
  }
}

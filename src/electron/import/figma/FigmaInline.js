import HelperElement from '../../../js/helper/HelperElement.js'
import FigmaText from './style/FigmaText.js'
import FigmaFillStroke from './style/FigmaFillStroke.js'
import ImportCommon from '../ImportCommon.js'

export default {
  async addInlineText (data, node) {
    if (data.designType !== 'text') return
    const inline = await this.processInlineText(data, node)
    data.content = ImportCommon.injectInlineElements(node.characters, inline)
    if (node.style?.hyperlink?.url) data.href = node.style.hyperlink.url
  },

  async processInlineText (data, node) {
    const info = []
    let lastId, startPos
    for (let i = 0; i < node.characterStyleOverrides.length; i++) {
      const id = node.characterStyleOverrides[i]
      // id = 0 refers to the parent text
      if (!id && !lastId) continue
      if (!lastId) {
        lastId = id
        startPos = i
      } else if (lastId !== id || i === node.characterStyleOverrides.length - 1) {
        const lastPos = (i === node.characterStyleOverrides.length - 1) ? i + 1 : i
        const inline = await this.processInlineElement(data, node, lastId, startPos, lastPos,
          node.styleOverrideTable[lastId])
        if (inline) info.push(inline)
        lastId = id
        startPos = i
      }
    }
    return info
  },

  async processInlineElement (data, node, charId, start, end, override) {
    const ref = HelperElement.generateElementRef()
    const hasStyle = await this.addInlineStyle(data, ref, override)
    if (!hasStyle) return
    const html = this.getInlineHtml(start, end, node, ref, override)
    return { start, end, html }
  },

  async addInlineStyle (data, ref, override) {
    const style = await this.getElementStyle(override)
    if (!style.text && !style.fills) return false
    data.inlineChildren.push({ desechType: 'text', inline: true, ref, style })
    return true
  },

  async getElementStyle (override) {
    return {
      text: FigmaText.getText(override, { designType: 'text' }),
      // we don't have the settings parameter because images are ignored for text elements
      fills: await FigmaFillStroke.getFills({ designType: 'text' }, {
        fills: override.fills || []
      })
    }
  },

  getInlineHtml (start, end, node, ref, override) {
    const html = node.characters.substring(start, end)
    if (override.hyperlink) {
      return `<a class="${ref}" href="${override.hyperlink.url}">${html}</a>`
    } else {
      return `<em class="${ref}">${html}</em>`
    }
  }
}

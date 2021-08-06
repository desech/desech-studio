import HelperElement from '../../../js/helper/HelperElement.js'
import FigmaText from './style/FigmaText.js'
import FigmaFill from './style/FigmaFill.js'
import ImportCommon from '../ImportCommon.js'

export default {
  async addInlineText (data, node, settings) {
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
        info.push(inline)
        lastId = id
        startPos = i
      }
    }
    return info
  },

  async processInlineElement (data, node, charId, start, end, style) {
    const elemId = HelperElement.generateElementRef()
    const info = {
      start,
      end,
      html: this.getInlineHtml(start, end, node, elemId, style)
    }
    data.styleChildren[elemId] = {
      text: FigmaText.getText(style, { designType: 'text' }),
      fills: await FigmaFill.getFills({ designType: 'text' }, { fills: style.fills || [] })
    }
    return info
  },

  getInlineHtml (start, end, node, elemId, style) {
    const html = node.characters.substring(start, end)
    if (style.hyperlink) {
      return `<a class="${elemId}" href="${style.hyperlink.url}">${html}</a>`
    } else {
      return `<em class="${elemId}">${html}</em>`
    }
  }
}

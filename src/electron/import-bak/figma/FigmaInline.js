import HelperElement from '../../../js/helper/HelperElement.js'
import FigmaText from './FigmaText.js'
import ParseCommon from '../ParseCommon.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'

export default {
  async processTextContent (element, extra, css) {
    if (extra.data.type !== 'text') return
    const extra2 = ExtendJS.cloneData(extra)
    extra2.data.type = 'inline'
    const inline = await this.processInlineText(element, extra2, css)
    const content = ParseCommon.injectInlineElements(element.characters, inline)
    return {
      content: content.replace(/\n/g, '\n<br>'),
      ...this.processTextLink(element.style)
    }
  },

  async processInlineText (element, extra2, css) {
    const data = []
    let lastId, startPos
    for (let i = 0; i < element.characterStyleOverrides.length; i++) {
      const id = element.characterStyleOverrides[i]
      // id = 0 refers to the parent text
      if (!id && !lastId) continue
      if (!lastId) {
        lastId = id
        startPos = i
      } else if (lastId !== id || i === element.characterStyleOverrides.length - 1) {
        const lastPos = (i === element.characterStyleOverrides.length - 1) ? i + 1 : i
        const inline = await this.processInlineElement(element, extra2, lastId, startPos, lastPos,
          element.styleOverrideTable[lastId], css)
        data.push(inline)
        lastId = id
        startPos = i
      }
    }
    return data
  },

  async processInlineElement (element, extra2, charId, start, end, style, css) {
    const elemId = HelperElement.generateElementRef()
    const data = {
      start,
      end,
      html: this.getInlineHtml(start, end, element, elemId, style)
    }
    css.element[elemId] = await FigmaText.getCssText({
      style,
      fills: style.fills || []
    }, extra2, css)
    return data
  },

  getInlineHtml (start, end, element, elemId, style) {
    const html = element.characters.substring(start, end)
    if (style.hyperlink) {
      return `<a class="${elemId}" href="${style.hyperlink.url}">${html}</a>`
    } else {
      return `<em class="${elemId}">${html}</em>`
    }
  },

  processTextLink (style) {
    if (style.hyperlink) {
      return {
        tag: 'a',
        href: style.hyperlink.url
      }
    }
  }
}

import HelperElement from '../../../js/helper/HelperElement.js'
import FigmaText from './FigmaText.js'
import ParseCommon from '../ParseCommon.js'

export default {
  processTextContent (element, type, css) {
    if (type !== 'text') return
    const inline = this.processInlineText(element, css)
    const content = ParseCommon.injectInlineElements(element.characters, inline)
    return {
      content: content.replace(/\n/g, '\n<br>'),
      ...this.processTextLink(element.style)
    }
  },

  processInlineText (element, css) {
    const data = []
    let lastId, startPos
    for (let i = 0; i < element.characterStyleOverrides.length; i++) {
      const id = element.characterStyleOverrides[i]
      // id = 0 refers to the parent text
      if (!id) continue
      if (!lastId) {
        lastId = id
        startPos = i
      } else if (lastId !== id || i === element.characterStyleOverrides.length - 1) {
        const lastPos = (i === element.characterStyleOverrides.length - 1) ? i + 1 : i
        const inline = this.processInlineElement(element, lastId, startPos, lastPos,
          element.styleOverrideTable[lastId], css)
        data.push(inline)
        lastId = id
        startPos = i
      }
    }
    return data
  },

  processInlineElement (element, charId, start, end, style, css) {
    const elemId = HelperElement.generateElementRef()
    const data = {
      start,
      end,
      html: this.getInlineHtml(start, end, element, elemId, style)
    }
    css.element[elemId] = FigmaText.getCssText('inline', {
      style,
      fills: style.fills || []
    }, css)
    return data
  },

  getInlineHtml (start, end, element, elemId, style) {
    const html = element.characters.substring(start, end)
    if (style.hyperlink) {
      return `<a class="${elemId}" href="${style.hyperlink.url}">${html}</a>`
    } else {
      return `<span class="${elemId}">${html}</span>`
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

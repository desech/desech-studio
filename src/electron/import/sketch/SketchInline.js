import ImportCommon from '../ImportCommon.js'
import SketchText from './style/SketchText.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  addInlineText (data, node) {
    if (data.desechType !== 'text') return
    const inline = this.processInlineText(data, node)
    data.content = ImportCommon.injectInlineElements(node.attributedString.string, inline)
  },

  processInlineText (data, node) {
    const info = []
    const elemString = node.attributedString.string
    for (const text of node.attributedString.attributes) {
      if (text.location === 0 && text.length === elemString.length) {
        continue
      }
      const inline = this.processInlineElement(elemString, text, data)
      if (inline) info.push(inline)
    }
    return info
  },

  processInlineElement (string, text, data) {
    const end = text.location + text.length
    const html = string.substring(text.location, end)
    return {
      start: text.location,
      end,
      html: this.processHtmlCss(html, text, data)
    }
  },

  processHtmlCss (html, text, data) {
    const ref = HelperElement.generateElementRef()
    const style = this.getElementStyle(text, data)
    if (style) {
      data.inlineChildren.push({ desechType: 'text', inline: true, ref, style })
      return `<em class="${ref}">${html}</em>`
    } else {
      return html
    }
  },

  getElementStyle (elem, data) {
    // can't have fills here, only the text color will work
    const text = SketchText.getText(elem.attributes, { desechType: 'text' })
    for (const [name, value] of Object.entries(text)) {
      // remove the style that we already have in the parent
      if (data.style.text[name] === value) delete text[name]
    }
    if (!ExtendJS.isEmpty(text)) return { text }
  }
}

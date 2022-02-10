import HelperElement from '../../../helper/HelperElement.js'
import StateStyleSheet from '../../../state/StateStyleSheet.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperDOM from '../../../helper/HelperDOM.js'

export default {
  createElement (type, selection) {
    const ref = this.insertElementInSelection(type, selection)
    StateStyleSheet.initElementStyle(ref)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['element'] })
  },

  insertElementInSelection (type, selection) {
    const ref = HelperElement.generateElementRef()
    const html = this.getHtmlForTag(type, selection, ref)
    document.execCommand('insertHTML', false, html)
    return ref
  },

  getHtmlForTag (type, selection, ref) {
    let attributes = `class="${ref} element inline"`
    if (type === 'a') attributes += ' href=""'
    return `<${type} ${attributes}>${HelperDOM.escapeHtml(selection)}</${type}>`
  },

  deleteElement (selection) {
    const node = selection.anchorNode
    if (node.parentNode.classList.contains('editable')) return
    // @todo fix it when we have nested formattings
    node.parentNode.replaceWith(node)
    HelperTrigger.triggerReload('sidebar-left-panel', { panels: ['element'] })
  }
}

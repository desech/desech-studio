import LeftVariableCommon from './LeftVariableCommon.js'
import LeftCommon from '../LeftCommon.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'

export default {
  async buildList (container, type, list, options) {
    const items = LeftVariableCommon.getVariables()
    if (items.length) LeftCommon.removeEmptyPrompt(list)
    this.injectItems(items, list)
    LeftCommon.finishPanelLoad(container, type)
  },

  injectItems (items, list) {
    for (const item of items) {
      this.injectItem(item, list)
    }
  },

  injectItem (data, list) {
    const template = HelperDOM.getTemplate('template-variable-item')
    this.injectItemData(template, data)
    list.appendChild(template)
  },

  injectItemData (li, data) {
    li.dataset.ref = data.ref
    li.dataset.search = [data.name, data.type, data.value].join('-')
    this.injectSelection(li, data)
    this.injectTitle(li, data)
  },

  injectSelection (li, data) {
    const selected = StateSelectedVariable.getRef()
    if (selected === data.ref) li.classList.add('active')
  },

  injectTitle (li, data) {
    const title = li.getElementsByClassName('panel-item-name')[0]
    title.textContent = data.name
  }
}

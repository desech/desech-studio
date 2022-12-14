import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'

export default {
  async setOptions (list) {
    const type = list.closest('.style-html-options').dataset.type
    const select = this.buildSelectOptions(list.getElementsByClassName('style-html-li-form'))
    const element = StateSelectedElement.getElement()
    await RightHtmlCommon.setListHtmlCommand('setOptions', element, select, type)
  },

  buildSelectOptions (forms) {
    const select = document.createElement('select')
    let lastGroup = null
    for (const form of forms) {
      if (form.dataset.type === 'optgroup') {
        lastGroup = this.addOptgroupNode(form.elements, select)
      } else {
        this.addOptionNode(form.elements, select, lastGroup)
      }
    }
    return select
  },

  addOptgroupNode (fields, select) {
    const group = this.getOptgroupNode(fields)
    select.appendChild(group)
    return group
  },

  getOptgroupNode (fields) {
    const node = document.createElement('optgroup')
    node.setAttributeNS(null, 'label', fields.label.value)
    this.addAttributesToOptionNode(node, fields)
    return node
  },

  addOptionNode (fields, select, lastGroup) {
    const option = this.getOptionNode(fields)
    if (lastGroup) {
      lastGroup.appendChild(option)
    } else {
      select.appendChild(option)
    }
  },

  getOptionNode (fields) {
    const node = document.createElement('option')
    node.textContent = fields.text.value
    node.setAttributeNS(null, 'value', fields.value.value)
    this.addAttributesToOptionNode(node, fields)
    return node
  },

  addAttributesToOptionNode (node, fields) {
    for (const field of ['disabled', 'selected']) {
      if (fields[field] && fields[field].classList.contains('selected')) {
        node.setAttributeNS(null, field, '')
      }
    }
  },

  injectOptions (container, element) {
    const list = container.getElementsByClassName('style-html-option-list')[0]
    for (const child of element.children) {
      const data = this.getOptionData(child)
      RightHtmlCommon.addSelectOptionToList(list, data)
      if (data.type === 'optgroup') this.addOptgroupOptions(list, child.children)
    }
  },

  getOptionData (node) {
    return {
      type: HelperDOM.getTag(node),
      text: node.tagName === 'OPTION' ? node.textContent : '',
      value: node.getAttributeNS(null, 'value') || '',
      label: node.getAttributeNS(null, 'label') || '',
      selected: node.hasAttributeNS(null, 'selected'),
      disabled: node.hasAttributeNS(null, 'disabled')
    }
  },

  addOptgroupOptions (list, children) {
    for (const child of children) {
      const data = this.getOptionData(child)
      RightHtmlCommon.addSelectOptionToList(list, data)
    }
  }
}

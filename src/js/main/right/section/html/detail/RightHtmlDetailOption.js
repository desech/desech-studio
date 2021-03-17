import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../../helper/HelperElement.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'

export default {
  setOptions (list) {
    const type = list.closest('.style-html-options').dataset.type
    const select = this.buildSelectOptions(list.getElementsByClassName('style-html-li-form'))
    RightHtmlCommon.setListHtmlCommand('setOptions', StateSelectedElement.getElement(), select, type)
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
    for (const child of this.getOptions(element)) {
      const data = this.getOptionData(child)
      RightHtmlCommon.addSelectOptionToList(list, data)
      if (data.type === 'optgroup') this.addOptgroupOptions(list, child.children)
    }
  },

  getOptions (element) {
    if (element.hasAttributeNS(null, 'list')) {
      // 2 inputs can use the same datalist after copy/paste attributes
      // @todo the datalists will be duplicated in the exported html file, using the same id
      return element.list ? element.list.children : [] // input
    } else {
      return element.children // select
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
  },

  initDatalist () {
    const element = StateSelectedElement.getElement()
    if (!element.getAttributeNS(null, 'list')) this.addDatalist(element)
  },

  addDatalist (element) {
    const listId = `datalist-${HelperElement.getRef(element)}`
    this.createDatalist(listId)
    element.setAttributeNS(null, 'list', listId)
  },

  createDatalist (listId) {
    const datalist = document.createElement('datalist')
    datalist.id = listId
    document.getElementById('datalist').appendChild(datalist)
  }
}

export default {
  show (node) {
    if (this.isNodeList(node)) {
      for (const elem of node) {
        if (elem) elem.removeAttributeNS(null, 'hidden')
      }
    } else if (node) {
      node.removeAttributeNS(null, 'hidden')
    }
  },

  hide (node) {
    if (this.isNodeList(node)) {
      for (const elem of node) {
        if (elem) elem.setAttributeNS(null, 'hidden', '')
      }
    } else if (node) {
      node.setAttributeNS(null, 'hidden', '')
    }
  },

  isNodeList (node) {
    return (Array.isArray(node) || node instanceof HTMLCollection || node instanceof NodeList)
  },

  isHidden (node, deep = false) {
    return this.hasAttributeDeep(node, 'hidden', deep)
  },

  hasAttributeDeep (node, attribute, deep = false) {
    if (deep) {
      return node.closest(`[${attribute}]`)
    } else {
      return node.hasAttributeNS(null, attribute)
    }
  },

  // use node.toggleAttribute() for attributes
  toggle (node, visible = null) {
    if (visible === null) {
      visible = this.isHidden(node)
    }
    visible ? this.show(node) : this.hide(node)
  },

  toggleChild (parent, child) {
    if (parent.children.length) {
      this.deleteChildren(parent)
    } else {
      parent.appendChild(child)
    }
  },

  addClasses (node, classes) {
    for (const cls of classes) {
      node.classList.add(cls)
    }
  },

  prependClass (node, cls) {
    const classes = cls + ' ' + node.getAttributeNS(null, 'class')
    node.setAttributeNS(null, 'class', classes)
  },

  getVisibleChildren (parent) {
    const children = []
    for (const child of parent.children) {
      if (!this.isHidden(child)) {
        children.push(child)
      }
    }
    return children
  },

  getTemplate (id) {
    const element = document.getElementById(id)
    if (!element) return
    return document.importNode(element.content, true).firstElementChild
  },

  deleteChildren (node) {
    if (this.isNodeList(node)) {
      for (const elem of node) {
        this.deleteOneParentChildren(elem)
      }
    } else {
      this.deleteOneParentChildren(node)
    }
  },

  deleteOneParentChildren (parent) {
    while (parent.firstElementChild) {
      parent.removeChild(parent.firstElementChild)
    }
  },

  deleteNodes (nodes) {
    // for querySelectorAll use `.forEach(el => el.remove())`
    while (nodes.length > 0) {
      nodes[0].remove()
    }
  },

  deleteAllDataset (node) {
    for (const name of Object.keys(node.dataset)) {
      delete node.dataset[name]
    }
  },

  replaceOnlyChild (parent, newElement) {
    if (parent.children[0]) {
      parent.replaceChild(newElement, parent.children[0])
    } else {
      parent.appendChild(newElement)
    }
  },

  insertBefore (newElem, elem) {
    elem.parentNode.insertBefore(newElem, elem)
  },

  insertAfter (newElem, elem) {
    elem.parentNode.insertBefore(newElem, elem.nextElementSibling)
  },

  getElementIndex (element) {
    return [...element.parentNode.children].indexOf(element)
  },

  isNode (element) {
    return element instanceof HTMLElement
  },

  optionExists (select, value) {
    const options = Object.values(select.options).map(option => option.value)
    return options.includes(value)
  },

  furthest (node, findSelector, stopSelector = null) {
    let found = null
    while (node !== null) {
      if (stopSelector && node.matches(stopSelector)) return found || node
      if (node.matches(findSelector)) found = node
      node = node.parentElement
    }
    return found
  },

  getAttributes (node) {
    const result = {}
    for (const attr of node.attributes) {
      result[attr.name] = attr.value
    }
    return result
  },

  removeAttributes (element) {
    while (element.attributes.length > 0) {
      element.removeAttributeNS(null, element.attributes[0].name)
    }
  },

  isInView (x, y, container) {
    const posX = Math.round(x - container.offsetLeft - container.scrollLeft)
    const posY = Math.round(y - container.offsetTop - container.scrollTop)
    return (posY >= 0 && posY <= container.offsetHeight && posX >= 0 &&
      posX <= container.offsetWidth)
  },

  // HelperElement.getTag() is more complete
  getTag (node) {
    return node.tagName.toLowerCase()
  },

  changeTag (node, tag, document) {
    const clone = this.createElement(tag, document)
    for (const attr of node.attributes) {
      clone.setAttributeNS(null, attr.name, attr.value)
    }
    this.transferChildren(node, clone)
    node.replaceWith(clone)
    return clone
  },

  transferChildren (from, to) {
    // JSDOM's inneHTML is bad because:
    //    - it changes case sensitive tags
    //    - doesn't handle self closing tags correctly
    // JSDOM's while loop appendChild is bad because:
    //    - it doesn't extract the insides of <template>
    to.innerHTML = from.innerHTML
    // while (from.firstChild) {
    //   to.appendChild(from.firstChild)
    // }
  },

  createElement (tag, document) {
    if (tag === 'svg') {
      return document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    } else {
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag)
    }
  },

  getChildren (node) {
    if (node.content && node.content.children && node.content.children.length) {
      // only used by the `template` node
      return node.content.children
    } else if (node.children && node.children.length) {
      return node.children
    }
    return null
  },

  escapeHtml (html) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return html.replace(/[&<>"']/g, m => map[m])
  },

  addRemoveAttribute (node, name, value) {
    if (value) {
      node.setAttributeNS(null, name, value)
    } else {
      node.removeAttributeNS(null, name)
    }
  },

  getChildIndex (node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node)
  },

  clearStyle (node) {
    // sometimes it still leaves a style="" attribute, which we remove on save
    // check StateHtmlFile.formatHtmlString(), RightHtmlCommon.getIgnoredAttributes()
    node.style = ''
    delete node.style
    node.removeAttributeNS(null, 'style')
  },

  reflow () {
    // @todo we need to reflow the dom when we reorder css classes
    // const canvas = document.getElementById('canvas')
    // const height = canvas.offsetHeight
    // canvas.style.height = 0
    // setTimeout(() => {
    //   canvas.style.height = height + 'px'
    // }, 1000)
  }
}

export default {
  show (node) {
    if (this.isNodeList(node)) {
      for (const elem of node) {
        elem.removeAttributeNS(null, 'hidden')
      }
    } else {
      node.removeAttributeNS(null, 'hidden')
    }
  },

  hide (node) {
    if (this.isNodeList(node)) {
      for (const elem of node) {
        elem.setAttributeNS(null, 'hidden', '')
      }
    } else {
      node.setAttributeNS(null, 'hidden', '')
    }
  },

  isNodeList (node) {
    return (Array.isArray(node) || node instanceof HTMLCollection || node instanceof NodeList)
  },

  isVisible (node, deep = false) {
    let visible = !node.hasAttributeNS(null, 'hidden')
    if (visible && deep && node.closest('[hidden]')) {
      visible = false
    }
    return visible
  },

  toggle (node, visible) {
    if (visible === null) {
      visible = !this.isVisible(node)
    }
    visible ? this.show(node) : this.hide(node)
  },

  toggleClass (node, cls, add) {
    if (add) {
      node.classList.add(cls)
    } else {
      node.classList.remove(cls)
    }
  },

  toggleAttribute (node, add, name, value = '') {
    if (add) {
      node.setAttributeNS(null, name, value)
    } else {
      node.removeAttributeNS(null, name)
    }
  },

  addClasses (node, classes) {
    for (const cls of classes) {
      node.classList.add(cls)
    }
  },

  getVisibleChildren (parent) {
    const children = []
    for (const child of parent.children) {
      if (this.isVisible(child)) {
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

  getTag (node) {
    return node.tagName.toLowerCase()
  },

  createElement (tag, document) {
    if (tag === 'svg') {
      return document.createElementNS('http://www.w3.org/2000/svg', tag)
    } else {
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag)
    }
  },

  changeTag (node, tag, document) {
    const clone = this.createElement(tag, document)
    for (const attr of node.attributes) {
      clone.setAttributeNS(null, attr.name, attr.value)
    }
    clone.innerHTML = node.innerHTML
    node.replaceWith(clone)
    return clone
  },

  getChildren (node) {
    if (node.content && node.content.children && node.content.children.length) {
      // only used by the `template`` node
      return node.content.children
    } else if (node.children && node.children.length) {
      return node.children
    }
    return null
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

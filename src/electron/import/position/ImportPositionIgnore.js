import ImportPositionCommon from './ImportPositionCommon.js'
import ImportPositionDebug from './ImportPositionDebug.js'
import ExtendJS from '../../../js/helper/ExtendJS.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  positionIgnoredNodes (elements, body) {
    if (!elements.length) return
    ImportPositionDebug.debugIgnoreStart(elements)
    for (let i = elements.length - 1; i >= 0; i--) {
      const positioned = this.positionIgnoredNode(elements[i], body)
      if (positioned) elements.splice(i, 1)
    }
  },

  positionIgnoredNode (element, body) {
    ImportPositionDebug.debugIgnoreNode(element)
    const found = this.findElementContainer(element, body.children)
    if (!found) {
      ImportPositionDebug.debugMsg('No container found', 4)
      return false
    }
    ImportPositionDebug.debugIgnoreContainer(found)
    this.replaceNode(found, element)
    this.positionSecondElement(found.children[0], found.children[1])
    return true
  },

  findElementContainer (element, children, found = null) {
    // the further we go inside the nesting tree, the closer we are to our node
    for (const node of children) {
      if (ImportPositionCommon.isNodeTopLeftInsideBoundaries(element, node)) {
        found = node
      }
      if (node.children?.length) {
        const check = this.findElementContainer(element, node.children, found)
        if (check !== found) found = check
      }
    }
    return found
  },

  replaceNode (found, element) {
    // replace the found node with a container with 2 children (first + second)
    const first = ExtendJS.cloneData(found)
    const second = ExtendJS.cloneData(element)
    for (const name of Object.keys(found)) {
      delete found[name]
    }
    this.addContainerData(found, first, second)
  },

  addContainerData (container, first, second) {
    container.desechType = 'block'
    container.name = 'ignore-container'
    container.ref = HelperElement.generateElementRef()
    this.addContainerStyle(container, first)
    container.children = [first, second]
  },

  addContainerStyle (container, first) {
    container.style = { layout: { margin: {} } }
    if (first.style.layout?.margin?.top) {
      container.style.layout.margin.top = first.style.layout.margin.top
      delete first.style.layout.margin.top
    }
    if (first.style.layout?.margin?.left) {
      container.style.layout.margin.left = first.style.layout.margin.left
      delete first.style.layout.margin.left
    }
  },

  positionSecondElement (first, second) {
    const top = second.y - first.y - first.height
    const left = second.x - first.x
    if (top !== 0 || left !== 0) {
      if (!second.style.layout) second.style.layout = { margin: {} }
      if (!second.style.layout.margin) second.style.layout.margin = {}
      if (top !== 0) second.style.layout.margin.top = top
      if (left !== 0) second.style.layout.margin.left = left
    }
  }
}

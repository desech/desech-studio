import HelperDOM from '../../../helper/HelperDOM.js'
import StateStyleSheet from '../../../state/StateStyleSheet.js'
import CanvasElement from '../CanvasElement.js'
import CanvasElementSelect from './CanvasElementSelect.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import HelperCanvas from '../../../helper/HelperCanvas.js'
import HelperElement from '../../../helper/HelperElement.js'
import CanvasCommon from '../CanvasCommon.js'
import HelperTrigger from '../../../helper/HelperTrigger.js'
import HelperFile from '../../../helper/HelperFile.js'
import CanvasOverlayResize from '../overlay/CanvasOverlayResize.js'

export default {
  _start: false,
  _startX: null,
  _startY: null,
  _moving: false,
  _create: false,

  getEvents () {
    return {
      mousedown: ['mousedownPrepareCreateElementEvent'],
      mousemove: ['mousemoveAddMarkerEvent', 'mousemoveCreateResizeBlockEvent'],
      click: ['clickEndCreateElementEvent'],
      mouseout: ['mouseoutRemoveMarkerEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  mousemoveAddMarkerEvent (event) {
    if (event.target.closest('#canvas') && !event.target.closest('.element.inline') &&
      HelperCanvas.isCreateTool() && HelperCanvas.getOperation() !== 'panning') {
      this.addPlacementMarker(event.target, event.clientX, event.clientY)
    }
  },

  mouseoutRemoveMarkerEvent (event) {
    if (event.target.closest('#canvas')) {
      CanvasCommon.removePlacementMarker()
    }
  },

  mousedownPrepareCreateElementEvent (event) {
    if (event.target.closest('#canvas') && HelperCanvas.getTool() === 'block' &&
      event.detail === 1) {
      this.prepareCreateElement(event.clientX, event.clientY)
    }
  },

  mousemoveCreateResizeBlockEvent (event) {
    if (this._start && !this._create && event.buttons) {
      if (!this._moving) {
        this._moving = this.hasMoved(event.clientX, event.clientY)
      }
      if (this._moving) {
        this.createResizeBlock(event.clientX, event.clientY)
      }
      // the resize event will be handled by CanvasOverlayResize after init
    }
  },

  clickEndCreateElementEvent (event) {
    this.reset()
    if (!this._create && event.target.closest('#canvas') && HelperCanvas.isCreateTool()) {
      this.createElement(HelperCanvas.getTool())
      // stop reaching the selection logic, because it will deselect the element
      event.preventDefault()
    }
  },

  prepareCreateElement (clientX, clientY) {
    this._start = true
    this._startX = clientX
    this._startY = clientY
    this._moving = false
    this._create = false
  },

  hasMoved (clientX, clientY) {
    // only start moving when there's an X pixels movement difference
    const delta = 10
    const diffX = Math.abs(this._startX - clientX)
    const diffY = Math.abs(this._startY - clientY)
    return (diffX > delta || diffY > delta)
  },

  createResizeBlock (clientX, clientY) {
    this._create = true
    const element = this.createElement('block')
    this.setBlockDimensions(element, clientX, clientY)
    const resizeButton = document.querySelector('#element-overlay .resize-se')
    CanvasOverlayResize.prepareResize(resizeButton, clientX, clientY)
  },

  setBlockDimensions (element, clientX, clientY) {
    const pos = HelperElement.getPosition(element)
    element.style.width = (clientX - pos.left) + 'px'
    element.style.height = (clientY - pos.top) + 'px'
  },

  reset () {
    this._start = false
    this._startX = null
    this._startY = null
    this._moving = false
    this._create = false
  },

  addPlacementMarker (node, clientX, clientY) {
    CanvasCommon.removePlacementMarker()
    const mouseX = CanvasElement.getMouseY(clientX)
    const mouseY = CanvasElement.getMouseY(clientY)
    const element = this.getMarkerElement(node, mouseX, mouseY)
    if (element) this.addCanvasElementMarker(element, mouseY)
  },

  getMarkerElement (node, mouseX, mouseY) {
    if (node.id === 'canvas') return
    const element = CanvasCommon.getClosestElementOrComponentOrChildren(node)
    if (this.isValidMarkerElement(element)) return element
  },

  isValidMarkerElement (element) {
    return (HelperElement.isCanvasElement(element) && !element.classList.contains('moving'))
  },

  addCanvasElementMarker (element, mouseY) {
    if (HelperElement.getType(element) === 'component-children') {
      if (element.closest('.component')) {
        this.addContainerMarkerInside(element, mouseY)
      } else {
        this.addElementMarker(element, mouseY)
      }
    } else if (HelperElement.isContainer(element)) {
      this.addContainerMarker(element, mouseY)
    } else {
      this.addElementMarker(element, mouseY)
    }
  },

  addContainerMarker (element, mouseY) {
    const pos = HelperElement.getPosition(element)
    const threshold = this.getTopBottomThreshold(pos.height)
    if (mouseY <= pos.topWithScroll + threshold) {
      element.classList.add('placement', 'top')
    } else if (mouseY >= pos.topWithScroll + (pos.height - threshold)) {
      element.classList.add('placement', 'bottom')
    } else {
      // inside
      this.addContainerMarkerInside(element, mouseY)
    }
  },

  getTopBottomThreshold (height) {
    const threshold = height * 0.2
    // 20%, but no more than 100px
    return (threshold <= 100) ? threshold : 100
  },

  addContainerMarkerInside (element, mouseY) {
    let placed = false
    if (element.children.length) placed = this.addChildrenContainerMarker(element, mouseY)
    if (!placed) element.classList.add('placement', 'inside')
  },

  addChildrenContainerMarker (parent, mouseY) {
    for (const element of parent.children) {
      if (!this.isValidMarkerElement(element)) continue
      const pos = HelperElement.getPosition(element)
      if (mouseY < pos.topWithScroll) {
        element.classList.add('placement', 'top')
        return true
      }
    }
    return false
  },

  addElementMarker (element, mouseY) {
    const pos = HelperElement.getPosition(element)
    if (mouseY <= pos.topWithScroll + pos.height * 0.5) {
      element.classList.add('placement', 'top')
    } else {
      element.classList.add('placement', 'bottom')
    }
  },

  getPlacementContainer () {
    const canvas = HelperCanvas.getCanvas()
    const placement = canvas.getElementsByClassName('placement')[0]
    if (!placement) return canvas
    if (placement.classList.contains('inside')) {
      return placement
    } else {
      // top, bottom
      return placement.parentNode
    }
  },

  createElement (type) {
    const element = this.getElementTemplate(type)
    const ref = HelperElement.getRef(element)
    this.createElementForPlacement(element)
    StateStyleSheet.initElementStyle(ref)
    CanvasElement.addRemoveElementCommand(ref, 'addElement', 'removeElement', false)
    this.finishCreateElement(element)
    return element
  },

  finishCreateElement (element) {
    CanvasElementSelect.selectElement(element)
    // go back to the selection tool
    CanvasCommon.enablePanelButton('select')
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
  },

  getElementTemplate (type) {
    const template = HelperDOM.getTemplate(`template-canvas-${type}`)
    const ref = HelperElement.generateElementRef()
    template.classList.add(ref)
    return template
  },

  createElementForPlacement (element) {
    const canvas = HelperCanvas.getCanvas()
    const placement = canvas.getElementsByClassName('placement')[0]
    placement ? this.insertElementInCanvas(element, placement) : canvas.appendChild(element)
    this.addSourceFile(element)
    // remove the marker to fix the element selection
    CanvasCommon.removePlacementMarker()
  },

  insertElementInCanvas (element, placement) {
    if (placement.classList.contains('top')) {
      HelperDOM.insertBefore(element, placement)
    } else if (placement.classList.contains('bottom')) {
      HelperDOM.insertAfter(element, placement)
    } else {
      // inside
      placement.appendChild(element)
    }
  },

  addSourceFile (element) {
    const type = HelperElement.getType(element)
    switch (type) {
      case 'image':
        if (!element.srcset) element.srcset = encodeURI(HelperFile.getDefaultImage()) + ' 1x'
        break
      case 'video':
        if (!element.src) element.src = HelperFile.getDefaultVideo()
        break
      case 'audio':
        if (!element.src) element.src = HelperFile.getDefaultAudio()
        break
    }
  }
}

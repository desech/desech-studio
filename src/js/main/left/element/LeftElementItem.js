import HelperElement from '../../../helper/HelperElement.js'
import LeftCommon from '../LeftCommon.js'
import CanvasElementMove from '../../canvas/element/CanvasElementMove.js'
import HelperComponent from '../../../helper/HelperComponent.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'

export default {
  getEvents () {
    return {
      // order matters
      click: ['clickCollapseExpandEvent', 'clickSelectItemEvent', 'clickDeselectItemEvent'],
      dblclick: ['dblclickCollapseExpandEvent'],
      dragstart: ['dragstartSortItemEvent'],
      dragdropbefore: ['dragdropbeforeSortItemEvent']
    }
  },

  clickCollapseExpandEvent (event) {
    if (event.target.closest('.panel-item-expand-button[data-type="element"]')) {
      LeftCommon.collapseExpandItem(event.target.closest('.panel-item-expand-button'))
      // stop selecting the element
      event.preventDefault()
    }
  },

  dblclickCollapseExpandEvent (event) {
    if (event.target.closest('.panel-element-item')) {
      const li = event.target.closest('li')
      LeftCommon.collapseExpandItem(li.getElementsByClassName('panel-item-expand-button')[0])
    }
  },

  clickSelectItemEvent (event) {
    if (event.target.closest('.panel-element-item')) {
      this.selectItem(event)
    }
  },

  clickDeselectItemEvent (event) {
    if (event.target.classList.contains('panel-list-elements-box')) {
      StateSelectedElement.deselectElement()
    }
  },

  dragstartSortItemEvent (event) {
    if (event.target.nodeType !== Node.TEXT_NODE && event.target.closest('.panel-element-item')) {
      LeftCommon.startSortItem(event.target.closest('.panel-element-item'))
    }
  },

  async dragdropbeforeSortItemEvent (event) {
    if (event.target.classList.contains('panel-element-list')) {
      await this.sortItem(event.detail)
    }
  },

  selectItem (event) {
    const li = event.target.closest('.panel-element-item')
    const element = HelperElement.getElement(li.dataset.ref)
    StateSelectedElement.selectElement(element)
  },

  async sortItem (data) {
    this.placeItem(data.to.element.dataset.ref, data.direction)
    const currentElement = HelperElement.getElement(data.from.element.dataset.ref)
    await CanvasElementMove.moveElementInCanvas(currentElement)
  },

  placeItem (ref, direction) {
    const element = HelperElement.getElement(ref)
    const hole = HelperComponent.getInstanceHole(element)
    if (direction === 'inside' && HelperComponent.isComponent(element) && hole) {
      hole.classList.add('placement', 'inside')
    } else {
      element.classList.add('placement', direction)
    }
  }
}

import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightFillForm from './RightFillForm.js'
import RightFillProperty from './RightFillProperty.js'
import RightFillImage from './RightFillImage.js'
import RightFillCommon from './RightFillCommon.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      click: ['clickAddElementEvent', 'clickDeleteElementEvent', 'clickEditElementEvent'],
      dragdropbefore: ['dragdropbeforeElementEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddElementEvent (event) {
    if (event.target.closest('.add-fill-button')) {
      this.addElement(event.target.closest('.add-fill-button'))
    }
  },

  clickDeleteElementEvent (event) {
    if (event.target.closest('.delete-fill-button')) {
      this.deleteElement(event.target.closest('li'))
      event.preventDefault() // don't let the edit button trigger
    }
  },

  clickEditElementEvent (event) {
    if (event.target.closest('.fill-element')) {
      this.editElement(event.target.closest('li'))
    }
  },

  dragdropbeforeElementEvent (event) {
    if (event.target.classList.contains('fill-list')) {
      this.dragdropElement(event.detail)
    }
  },

  addElement (button) {
    const form = button.closest('form#fill-section')
    const list = form.getElementsByClassName('panel-list')[0]
    this.addElementLi(list)
    RightFillProperty.updateBackgroundImage(form)
    RightFillImage.incrementBackgroundProperties()
    this.showColorPicker(form)
    RightCommon.enableToggle(form)
  },

  showColorPicker (container) {
    this.hideColorPicker(container)
    this.addColorPicker(container)
  },

  hideColorPicker (container) {
    this.deselectAddButton(container.getElementsByClassName('add-fill-button')[0])
    const fill = this.getFillContainer(container)
    this.clearContainer(fill)
  },

  deselectAddButton (button) {
    button.classList.remove('selected')
  },

  getFillContainer (container) {
    return container.getElementsByClassName('background-fill-container')[0]
  },

  clearContainer (container) {
    HelperDOM.deleteChildren(container)
  },

  addColorPicker (container) {
    const form = HelperDOM.getTemplate('template-fill-form')
    const fill = this.getFillContainer(container)
    this.addFormToContainer(form, fill)
    const index = RightFillCommon.getActiveElementIndex(container)
    RightFillForm.buildForm(form, index) // the color picker needs the dom to be updated before we do any color changes
  },

  addFormToContainer (form, container) {
    container.appendChild(form)
  },

  addElementLi (list) {
    const li = this.insertElement(list)
    this.activateElement(li)
  },

  insertElement (list, background = '') {
    const template = HelperDOM.getTemplate('template-fill-element')
    list.appendChild(template)
    if (background) RightFillCommon.setElementData(template, background)
    return template
  },

  activateElement (li) {
    this.clearActiveElement(li.parentNode)
    li.classList.add('active')
  },

  clearActiveElement (list) {
    const active = list.getElementsByClassName('active')[0]
    if (active) active.classList.remove('active')
  },

  deleteElement (li) {
    const container = li.closest('.sidebar-section')
    this.deleteBackgroundFill(li)
    this.deleteListElement(li)
    RightCommon.enableToggle(container)
  },

  deleteBackgroundFill (li) {
    const index = HelperDOM.getElementIndex(li)
    RightFillProperty.deleteBackgroundFill(index)
  },

  deleteListElement (li) {
    this.clearActiveElement(li.parentNode)
    this.hideColorPicker(li.closest('#fill-section'))
    li.remove()
  },

  editElement (li) {
    if (!li.classList.contains('active')) {
      this.enableEditElement(li)
    } else {
      this.disableEditElement(li)
    }
  },

  enableEditElement (li) {
    this.activateElement(li)
    this.showColorPicker(li.closest('form'))
  },

  disableEditElement (li) {
    this.clearActiveElement(li.parentNode)
    this.hideColorPicker(li.closest('form'))
  },

  dragdropElement (data) {
    RightFillProperty.sortBackgroundFill(data.from.index, data.to.index)
  },

  countElements (container) {
    return container.getElementsByClassName('panel-list')[0].children.length
  },

  injectList (container) {
    const list = container.getElementsByClassName('fill-list')[0]
    const backgrounds = RightFillProperty.getBackgrounds()
    for (const background of backgrounds) {
      this.insertElement(list, background)
    }
  }
}

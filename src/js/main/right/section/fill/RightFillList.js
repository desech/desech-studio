import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightFillForm from './RightFillForm.js'
import RightFillProperty from './RightFillProperty.js'
import RightFillImage from './RightFillImage.js'
import RightFillCommon from './RightFillCommon.js'
import RightCommon from '../../RightCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

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

  async clickAddElementEvent (event) {
    if (event.target.closest('.add-fill-button')) {
      await this.addElement(event.target.closest('.add-fill-button'))
    }
  },

  async clickDeleteElementEvent (event) {
    if (event.target.closest('.delete-fill-button')) {
      await this.deleteElement(event.target.closest('li'))
      // don't let the edit button trigger
      event.preventDefault()
    }
  },

  clickEditElementEvent (event) {
    if (event.target.closest('.fill-element')) {
      this.editElement(event.target.closest('li'))
    }
  },

  async dragdropbeforeElementEvent (event) {
    if (event.target.classList.contains('fill-list')) {
      await this.dragdropElement(event.detail)
    }
  },

  async addElement (button) {
    if (this.fillIsNone()) return
    const form = button.closest('form#fill-section')
    const list = form.getElementsByClassName('panel-list')[0]
    this.hideColorPicker(form)
    this.addElementLi(list)
    await RightFillProperty.updateBackgroundImage(form)
    RightFillImage.incrementBackgroundProperties()
    this.addColorPicker(form)
    RightCommon.toggleSidebarSection(form)
  },

  fillIsNone (style = null) {
    // don't allow other backgrounds when we have set it to none
    // you will have to delete this one before adding other backgrounds
    const bg = style
      ? style['background-image']
      : StateStyleSheet.getPropertyValue('background-image')
    return (bg === 'none')
  },

  showColorPicker (container) {
    this.hideColorPicker(container)
    this.addColorPicker(container)
  },

  hideColorPicker (container) {
    const fill = container.getElementsByClassName('background-fill-container')[0]
    HelperDOM.deleteChildren(fill)
  },

  addColorPicker (container) {
    const form = HelperDOM.getTemplate('template-fill-form')
    const fill = container.getElementsByClassName('background-fill-container')[0]
    this.addFormToContainer(form, fill)
    const index = RightFillCommon.getActiveElementIndex(container)
    // the color picker needs the dom to be updated before we do any color changes
    RightFillForm.buildForm(form, index)
  },

  addFormToContainer (form, container) {
    container.appendChild(form)
  },

  addElementLi (list) {
    const li = RightFillCommon.insertElement(list)
    this.activateElement(li)
  },

  activateElement (li) {
    this.clearActiveElement(li.parentNode)
    li.classList.add('active')
  },

  clearActiveElement (list) {
    const active = list.getElementsByClassName('active')[0]
    if (active) active.classList.remove('active')
  },

  async deleteElement (li) {
    const container = li.closest('.sidebar-section')
    const index = HelperDOM.getElementIndex(li)
    await RightFillProperty.deleteBackgroundFill(index, li.parentNode.children.length === 1)
    this.deleteListElement(li)
    RightCommon.toggleSidebarSection(container)
  },

  deleteListElement (li) {
    this.clearActiveElement(li.parentNode)
    this.hideColorPicker(li.closest('#fill-section'))
    li.remove()
  },

  editElement (li) {
    if (this.fillIsNone()) return
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

  async dragdropElement (data) {
    await RightFillProperty.sortBackgroundFill(data.from.index, data.to.index)
  },

  countElements (container) {
    return container.getElementsByClassName('panel-list')[0].children.length
  },

  injectList (container, data) {
    const list = container.getElementsByClassName('fill-list')[0]
    if (this.fillIsNone(data.style)) {
      RightFillCommon.insertElement(list, 'none')
    } else {
      const backgrounds = RightFillProperty.getBackgroundsFromStyle(data.style)
      for (const background of backgrounds) {
        RightFillCommon.insertElement(list, background)
      }
    }
  }
}

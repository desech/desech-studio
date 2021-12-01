import HelperDOM from '../../../../helper/HelperDOM.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightAnimationForm from './RightAnimationForm.js'
import RightAnimationCommon from './RightAnimationCommon.js'
import RightCommon from '../../RightCommon.js'
import HelperCanvas from '../../../../helper/HelperCanvas.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getEvents () {
    return {
      click: ['clickAddElementEvent', 'clickDeleteElementEvent', 'clickEditElementEvent',
        'clickStopAnimationEvent', 'clickPlayAnimationEvent'],
      dragdropbefore: ['dragdropbeforeElementEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickAddElementEvent (event) {
    if (event.target.closest('.add-animation-button')) {
      await this.addElement(event.target.closest('.add-animation-button'))
    }
  },

  async clickDeleteElementEvent (event) {
    if (event.target.closest('.delete-animation-button')) {
      await this.deleteElement(event.target.closest('li'))
      // don't let the edit button trigger
      event.preventDefault()
    }
  },

  clickEditElementEvent (event) {
    if (event.target.closest('.animation-element')) {
      this.editElement(event.target.closest('li'))
    }
  },

  clickStopAnimationEvent (event) {
    if (event.target.closest('.stop-animation-button')) {
      this.stopAnimation(event.target.closest('.animation-buttons'))
    }
  },

  clickPlayAnimationEvent (event) {
    if (event.target.closest('.play-animation-button')) {
      this.playAnimation(event.target.closest('.animation-buttons'))
    }
  },

  async dragdropbeforeElementEvent (event) {
    if (event.target.classList.contains('animation-list')) {
      await this.dragdropElement(event.detail)
    }
  },

  async addElement (button) {
    const section = button.closest('form')
    const list = section.getElementsByClassName('animation-list')[0]
    this.addElementLi(list)
    this.showAnimationForm(section)
    await RightAnimationForm.setAnimation(section)
    RightCommon.toggleSidebarSection(section)
  },

  addElementLi (list) {
    const li = this.insertElement(list)
    this.activateElement(li)
  },

  insertElement (list, data = {}) {
    const template = HelperDOM.getTemplate('template-animation-element')
    list.appendChild(template)
    if (!ExtendJS.isEmpty(data)) RightAnimationCommon.setElementData(template, data)
    return template
  },

  activateElement (li) {
    this.clearActiveElement(li)
    li.classList.add('active')
  },

  clearActiveElement (element) {
    for (const li of element.parentNode.parentNode.getElementsByClassName('active')) {
      li.classList.remove('active')
    }
  },

  showAnimationForm (section) {
    this.hideAnimationForm(section)
    this.addAnimationForm(section)
  },

  hideAnimationForm (section) {
    this.deselectAddButton(section.getElementsByClassName('add-animation-button')[0])
    const container = this.getFormContainer(section)
    this.clearContainer(container)
  },

  deselectAddButton (button) {
    button.classList.remove('selected')
  },

  getFormContainer (section) {
    return section.getElementsByClassName('animation-form-container')[0]
  },

  clearContainer (container) {
    HelperDOM.deleteChildren(container)
  },

  addAnimationForm (section) {
    const form = HelperDOM.getTemplate('template-animation-form')
    const container = this.getFormContainer(section)
    this.addFormToContainer(form, container)
    const index = this.getActiveElementIndex(section)
    RightAnimationForm.buildForm(form, index)
  },

  addFormToContainer (form, container) {
    container.appendChild(form)
  },

  getActiveElementIndex (container) {
    const elem = RightAnimationCommon.getActiveElement(container)
    return HelperDOM.getElementIndex(elem)
  },

  async deleteElement (li) {
    const container = li.closest('.sidebar-section')
    const index = HelperDOM.getElementIndex(li)
    await RightAnimationForm.deleteAnimation(index)
    this.deleteListElement(li)
    RightCommon.toggleSidebarSection(container)
  },

  deleteListElement (li) {
    this.clearActiveElement(li)
    this.hideAnimationForm(li.closest('#animation-section'))
    li.remove()
  },

  editElement (li) {
    if (this.isAnimationNone()) return
    if (!li.classList.contains('active')) {
      this.enableEditElement(li)
    } else {
      this.disableEditElement(li)
    }
  },

  isAnimationNone () {
    const value = StateStyleSheet.getPropertyValue('animation')
    return (value === '0s ease 0s 1 normal none running none')
  },

  enableEditElement (li) {
    this.activateElement(li)
    this.showAnimationForm(li.closest('#animation-section'))
  },

  disableEditElement (li) {
    this.clearActiveElement(li)
    this.hideAnimationForm(li.closest('#animation-section'))
  },

  stopAnimation (container) {
    HelperCanvas.stopAnimation()
    HelperDOM.hide(container.children[0])
    HelperDOM.show(container.children[1])
  },

  playAnimation (container) {
    HelperCanvas.playAnimation()
    HelperDOM.hide(container.children[1])
    HelperDOM.show(container.children[0])
  },

  async dragdropElement (data) {
    await RightAnimationForm.sortAnimations(data.from.index, data.to.index)
  },

  injectPlayButtons (section) {
    if (HelperCanvas.isAnimationRunning()) return
    const container = section.getElementsByClassName('animation-buttons')[0]
    HelperDOM.hide(container.children[0])
    HelperDOM.show(container.children[1])
  },

  injectList (section, data) {
    const list = section.getElementsByClassName('animation-list')[0]
    const values = RightAnimationForm.getValuesFromStyle(data.style)
    for (const data of values) {
      this.insertElement(list, data)
    }
  }
}

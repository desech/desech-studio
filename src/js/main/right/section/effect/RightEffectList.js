import HelperDOM from '../../../../helper/HelperDOM.js'
import RightEffectForm from './RightEffectForm.js'
import RightEffectType from './RightEffectType.js'
import RightEffectCommon from './type/RightEffectCommon.js'
import RightCommon from '../../RightCommon.js'
import StateStyleSheet from '../../../../state/StateStyleSheet.js'

export default {
  getEvents () {
    return {
      click: ['clickAddElementEvent', 'clickDeleteElementEvent', 'clickEditElementEvent'],
      dragdropbefore: ['dragdropbeforeElementEvent']
    }
  },

  async clickAddElementEvent (event) {
    if (event.target.closest('.add-effect-button')) {
      await this.addElement(event.target.closest('.add-effect-button'))
    }
  },

  async clickDeleteElementEvent (event) {
    if (event.target.closest('.delete-effect-button')) {
      await this.deleteElement(event.target.closest('li'))
      // don't let the edit button trigger
      event.preventDefault()
    }
  },

  clickEditElementEvent (event) {
    if (event.target.closest('.effect-element')) {
      this.editElement(event.target.closest('li'))
    }
  },

  async dragdropbeforeElementEvent (event) {
    if (event.target.classList.contains('effect-list')) {
      await this.dragdropElement(event.detail)
    }
  },

  async addElement (button) {
    const def = this.getDefaultEffectOnCreate()
    if (!def) return
    const section = button.closest('form')
    const list = section.getElementsByClassName(`effect-list-${def.property}`)[0]
    this.addElementLi(list, def.property, def.value)
    this.showEffectForm(section, def.property, def.value)
    await RightEffectType.setEffect(section, def.property, def.value)
    RightCommon.toggleSidebarSection(section)
  },

  getDefaultEffectOnCreate () {
    const css = StateStyleSheet.getCurrentStyleObject()
    const general = RightCommon.getGeneralValues()
    const effects = RightEffectCommon.getEffectProperties()
    for (const property of effects) {
      if (general.includes(css[property])) continue
      return {
        property,
        value: RightEffectCommon.getDefaultCreateValue(property)
      }
    }
  },

  addElementLi (list, type, subtype) {
    const li = RightEffectType.insertElement(list, type, subtype)
    this.activateElement(li)
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

  showEffectForm (section, defaultType = null, defaultSubtype = null) {
    this.hideEffectForm(section)
    this.addEffectForm(section, defaultType, defaultSubtype)
  },

  hideEffectForm (section) {
    this.deselectAddButton(section.getElementsByClassName('add-effect-button')[0])
    const container = this.getFormContainer(section)
    this.clearContainer(container)
  },

  deselectAddButton (button) {
    button.classList.remove('selected')
  },

  getFormContainer (section) {
    return section.getElementsByClassName('effect-form-container')[0]
  },

  clearContainer (container) {
    HelperDOM.deleteChildren(container)
  },

  addEffectForm (section, defaultType, defaultSubtype) {
    const form = HelperDOM.getTemplate('template-effect-form')
    const container = this.getFormContainer(section)
    this.addFormToContainer(form, container)
    const current = RightEffectCommon.getActiveElement(section)
    const type = current.dataset.type || defaultType
    const subtype = current.dataset.subtype || defaultSubtype
    RightEffectForm.buildForm(form, type, subtype, HelperDOM.getElementIndex(current))
  },

  addFormToContainer (form, container) {
    container.appendChild(form)
  },

  getActiveElementIndex (container) {
    const elem = RightEffectCommon.getActiveElement(container)
    return HelperDOM.getElementIndex(elem)
  },

  async deleteElement (li) {
    const container = li.closest('.sidebar-section')
    const index = HelperDOM.getElementIndex(li)
    await RightEffectType.deleteEffect(li.dataset.type, index)
    this.deleteListElement(li)
    RightCommon.toggleSidebarSection(container)
  },

  deleteListElement (li) {
    this.clearActiveElement(li)
    this.hideEffectForm(li.closest('#effect-section'))
    li.remove()
  },

  editElement (li) {
    if (RightCommon.isGeneralValue(li.dataset.subtype)) {
      return
    }
    if (!li.classList.contains('active')) {
      this.enableEditElement(li)
    } else {
      this.disableEditElement(li)
    }
  },

  enableEditElement (li) {
    this.activateElement(li)
    this.showEffectForm(li.closest('#effect-section'))
  },

  disableEditElement (li) {
    this.clearActiveElement(li)
    this.hideEffectForm(li.closest('#effect-section'))
  },

  async dragdropElement (data) {
    const li = data.from.element
    await RightEffectType.sortEffects(li.dataset.type, data.from.index, data.to.index)
  },

  injectList (section, data) {
    const effects = RightEffectCommon.getEffectProperties()
    for (const type of effects) {
      RightEffectType.injectListType(section, type, data.style)
    }
  }
}

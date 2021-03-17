import HelperDOM from '../helper/HelperDOM.js'
import RightSubPanel from './right/RightSubPanel.js'
import RightSection from './right/RightSection.js'
import StateSelectedElement from '../state/StateSelectedElement.js'
import HelperEvent from '../helper/HelperEvent.js'
import HelperElement from '../helper/HelperElement.js'
import StyleSheetSelector from '../state/stylesheet/StyleSheetSelector.js'
import RightPage from './right/section/RightPage.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent'],
      clearcontainer: ['clearcontainerEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  // @todo option for background: none, effect: none, italic/text-transform/text-decoration: none
  reloadcontainerEvent (event) {
    if (event.target.id === 'right-panel-style') {
      this.reloadPanel()
    }
  },

  clearcontainerEvent (event) {
    if (event.target.id === 'right-panel-style') {
      this.loadDefaultPanel()
    }
  },

  reloadPanel () {
    if (StateSelectedElement.getRef() && this.getContainer()) {
      const selector = StyleSheetSelector.getCurrentSelector()
      this.clearPanel()
      this.loadPanel(selector)
    }
  },

  loadDefaultPanel () {
    this.clearPanel()
    RightPage.loadSection()
  },

  clearPanel () {
    if (!this.getContainer()) return
    HelperDOM.deleteChildren(this.getContainer())
    RightSubPanel.clearPanel()
  },

  getContainer () {
    return document.getElementById('main-style-sections')
  },

  loadPanel (selector) {
    const element = StateSelectedElement.getElement()
    if (!HelperElement.isCanvasElement(element)) return
    const sectionClasses = RightSection.getSectionClasses()
    const sections = RightSection.getList(sectionClasses)
    this.selectPreviousSelector(sections[1], selector)
    RightSection.addToPanel(sections, this.getContainer())
    RightSubPanel.loadPanel()
  },

  selectPreviousSelector (container, selector) {
    if (!container) return
    const defaultLi = container.querySelector('.selector-element.active')
    const selectorLi = container.querySelector(`.selector-element[data-selector="${selector}"]`)
    if (!defaultLi || !selectorLi) return
    defaultLi.classList.remove('active')
    selectorLi.classList.add('active')
  }
}

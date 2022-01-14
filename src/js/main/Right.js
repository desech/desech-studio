import HelperDOM from '../helper/HelperDOM.js'
import RightSubPanel from './right/RightSubPanel.js'
import RightSection from './right/RightSection.js'
import StateSelectedElement from '../state/StateSelectedElement.js'
import HelperEvent from '../helper/HelperEvent.js'
import RightPage from './right/section/RightPage.js'
import RightCommon from './right/RightCommon.js'

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

  reloadcontainerEvent (event) {
    if (event.target.id === 'right-panel') {
      this.reloadPanel()
    }
  },

  clearcontainerEvent (event) {
    if (event.target.id === 'right-panel') {
      this.loadDefaultPanel()
    }
  },

  reloadPanel () {
    if (StateSelectedElement.getRef() && this.getContainer()) {
      this.clearPanel()
      this.loadPanel()
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

  loadPanel () {
    const data = RightCommon.getElementSectionData()
    if (!data) return
    const classes = RightSection.getSectionClasses()
    const sections = RightSection.getList(classes, data)
    RightSection.addToPanel(sections, this.getContainer())
    RightSubPanel.loadPanel(data)
  }
}

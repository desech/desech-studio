import HelperDOM from '../helper/HelperDOM.js'
import RightSubPanel from './right/RightSubPanel.js'
import RightSection from './right/RightSection.js'
import StateSelectedElement from '../state/StateSelectedElement.js'
import RightPage from './right/section/RightPage.js'
import RightCommon from './right/RightCommon.js'
import StateSelectedVariable from '../state/StateSelectedVariable.js'
import RightVariable from './right/section/RightVariable.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent'],
      clearcontainer: ['clearcontainerEvent']
    }
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
    if (!this.getContainer()) return
    if (StateSelectedVariable.getRef() || StateSelectedElement.getRef()) {
      this.clearPanel()
      this.loadPanel()
    } else {
      // when we have no selected id, we need to see the default panel
      this.loadDefaultPanel()
    }
  },

  loadDefaultPanel () {
    this.clearPanel()
    const section = RightPage.getSection()
    this.getContainer().appendChild(section)
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
    if (StateSelectedVariable.getRef()) {
      this.loadPanelVariable()
    } else {
      this.loadPanelElement()
    }
  },

  loadPanelVariable () {
    const section = RightVariable.getSection()
    this.getContainer().appendChild(section)
  },

  loadPanelElement () {
    const data = RightCommon.getElementSectionData()
    if (!data) return
    const classes = RightSection.getSectionClasses()
    const sections = RightSection.getList(classes, data)
    RightSection.addToPanel(sections, this.getContainer())
    RightSubPanel.loadPanel(data)
  }
}

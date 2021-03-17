import HelperDOM from '../../helper/HelperDOM.js'
import RightSection from './RightSection.js'
import HelperEvent from '../../helper/HelperEvent.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  reloadcontainerEvent (event) {
    if (event.target.id === 'sub-style-sections') {
      this.reloadPanel()
    }
  },

  reloadPanel () {
    this.clearPanel()
    this.loadPanel()
  },

  clearPanel () {
    this.clearContainer()
  },

  clearContainer () {
    HelperDOM.deleteChildren(this.getContainer())
  },

  getContainer () {
    return document.getElementById('sub-style-sections')
  },

  loadPanel () {
    if (!document.getElementById('selector-section')) return
    const sections = RightSection.getList(RightSection.getSubSectionClasses())
    RightSection.addToPanel(sections, this.getContainer())
  }
}

import HelperDOM from '../../helper/HelperDOM.js'
import RightSection from './RightSection.js'
import RightCommon from './RightCommon.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent']
    }
  },

  reloadcontainerEvent (event) {
    if (event.target.id === 'sub-style-sections') {
      this.reloadPanel()
    }
  },

  reloadPanel () {
    const data = RightCommon.getElementSectionData()
    if (!data) return
    this.clearPanel()
    this.loadPanel(data)
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

  loadPanel (data) {
    if (!document.getElementById('selector-section')) return
    const instances = RightSection.getSubSectionClasses()
    const sections = RightSection.getList(instances, data)
    RightSection.addToPanel(sections, this.getContainer())
  }
}

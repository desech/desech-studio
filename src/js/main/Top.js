import TopCommon from './top/TopCommon.js'
import HelperDOM from '../helper/HelperDOM.js'
import HelperProject from '../helper/HelperProject.js'
import InputUnitField from '../component/InputUnitField.js'
import HelperStyle from '../helper/HelperStyle.js'

export default {
  getEvents () {
    return {
      reloadcontainer: ['reloadcontainerEvent']
    }
  },

  reloadcontainerEvent (event) {
    if (event.target.id === 'responsive-mode-list') {
      this.reloadResponsive()
    }
  },

  reloadResponsive () {
    const node = document.querySelector('.responsive-mode.selected')
    this.clearResponsive()
    this.loadResponsive(node.dataset.ref)
  },

  clearResponsive () {
    const container = document.getElementById('responsive-mode-list')
    HelperDOM.deleteChildren(container)
  },

  loadResponsive (selected) {
    const list = document.getElementById('responsive-mode-list')
    const settings = HelperProject.getProjectSettings()
    this.setDefaultResponsiveData(settings)
    this.addResponsiveModes(list)
    const mode = selected ? this.selectModeOrDefault(list, selected) : null
    TopCommon.setResponsiveSizeCanvas(mode || settings.responsive.default)
  },

  setDefaultResponsiveData (settings) {
    const button = document.getElementById('responsive-mode-default')
    button.dataset.data = JSON.stringify(settings.responsive.default)
  },

  addResponsiveModes (list) {
    const modes = TopCommon.getResponsiveModes()
    for (const data of modes) {
      const block = this.getResponsiveBlock(data)
      list.appendChild(block)
    }
  },

  getResponsiveBlock (data) {
    const template = HelperDOM.getTemplate('template-responsive-mode')
    const button = this.addButton(template, data)
    this.buildEditOverlay(button, data)
    return template
  },

  addButton (template, data) {
    const button = template.getElementsByClassName('responsive-mode')[0]
    this.addButtonSvg(button, data)
    const value = data['min-width'] || data['max-width']
    button.dataset.ref = HelperStyle.getResponsiveClass(value)
    button.dataset.data = JSON.stringify(data)
    return button
  },

  addButtonSvg (button, data) {
    const svg = HelperDOM.getTemplate(`template-responsive-mode-${data.type}`)
    button.appendChild(svg)
  },

  buildEditOverlay (button, data) {
    const form = TopCommon.createOverlay(button.nextElementSibling, 'edit')
    this.addOverlayData(form.elements, data)
  },

  addOverlayData (fields, data) {
    if (data['min-width']) InputUnitField.setValue(fields['min-width'], data['min-width'])
    if (data['max-width']) InputUnitField.setValue(fields['max-width'], data['max-width'])
  },

  selectModeOrDefault (list, selected) {
    const button = list.querySelector(`.responsive-mode[data-ref="${selected}"]`)
    if (button) {
      button.classList.add('selected')
      return JSON.parse(button.dataset.data)
    } else {
      const defaultButton = document.getElementById('responsive-mode-default')
      defaultButton.classList.add('selected')
    }
  }
}

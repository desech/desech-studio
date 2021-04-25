import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import ColorPicker from '../../../../component/ColorPicker.js'
import ColorPickerCommon from '../../../../component/color-picker/ColorPickerCommon.js'
import RightCommon from '../../RightCommon.js'
import RightTextCommon from './RightTextCommon.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import Page from '../../../../page/Page.js'
import HelperProject from '../../../../helper/HelperProject.js'

export default {
  getEvents () {
    return {
      click: ['clickAddColorEvent', 'clickRemoveColorEvent', 'clickAddFontEvent'],
      change: ['changeSetFontEvent'],
      colorchange: ['colorChangeColorEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickAddColorEvent (event) {
    if (event.target.closest('.text-color-button .color-button-on')) {
      RightTextCommon.switchTextColor(event.target.closest('form'), 'color')
    }
  },

  clickRemoveColorEvent (event) {
    if (event.target.closest('.text-color-button .color-button-off')) {
      RightCommon.changeStyle({ color: '' })
    }
  },

  async clickAddFontEvent (event) {
    if (event.target.classList.contains('dialog-font-submit')) {
      await this.addFont(event.target.closest('form'))
    }
  },

  changeSetFontEvent (event) {
    if (event.target.classList.contains('font-family')) {
      this.setFont(event.target)
    }
  },

  colorChangeColorEvent (event) {
    if (event.target.closest('.text-color-container .color-picker')) {
      this.changeTextColor(event.target, event.detail)
    }
  },

  setFont (select) {
    const option = select.selectedOptions[0]
    if (option.classList.contains('font-family-add-font')) {
      this.installFont(select.value, option.dataset.url || null)
      select.value = ''
    } else {
      RightCommon.changeStyle({ 'font-family': select.value })
    }
  },

  installFont (family, url) {
    const dialog = DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('font', 'header'),
      body: DialogComponent.getContentHtml('font', 'body')
    })
    this.injectFontData(dialog, family, url)
  },

  injectFontData (dialog, family, url) {
    const form = dialog.getElementsByClassName('dialog-font')[0]
    const title = dialog.getElementsByClassName('dialog-font-title')[0]
    if (url) {
      title.children[0].children[0].textContent = family
      form.elements.url.value = url
    } else {
      HelperDOM.hide(title.children[0])
      HelperDOM.show(title.children[1])
      form.classList.add('custom')
    }
  },

  async addFont (form) {
    const url = form.elements.url.value
    const file = form.elements.file.files[0] ? form.elements.file.files[0].path : null
    if (!url && !file) return
    const sucess = await window.electron.invoke('rendererAddFont', url, file)
    if (sucess) await Page.loadMain(HelperProject.getFile())
  },

  changeTextColor (container, options = {}) {
    const color = ColorPicker.getColorPickerValue(container)
    const section = container.closest('#text-section')
    RightTextCommon.getColorButton(section, 'color').style.backgroundColor = color
    ColorPickerCommon.setColor({ color: color }, options)
  },

  injectFontList (container) {
    const group = container.getElementsByClassName('font-family-my-fonts')[0]
    const list = HelperProject.getFontList()
    if (!list.length) return
    for (const font of list) {
      group.parentNode.querySelector(`option[value="${font}"]`).remove()
      group.appendChild(this.getGroupOption(font))
    }
    HelperDOM.show(group)
  },

  getGroupOption (font) {
    const option = document.createElement('option')
    option.value = option.textContent = font
    option.style.fontFamily = `"${font}"`
    return option
  },

  injectFontFamily (container) {
    const select = container.getElementsByClassName('font-family')[0]
    const value = StateStyleSheet.getPropertyValue('font-family').replaceAll('"', '')
    select.value = value
  }
}

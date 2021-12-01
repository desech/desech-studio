import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightCommon from '../../RightCommon.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import Page from '../../../../page/Page.js'
import HelperProject from '../../../../helper/HelperProject.js'

export default {
  getEvents () {
    return {
      click: ['clickAddFontEvent'],
      change: ['changeSetFontEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickAddFontEvent (event) {
    if (event.target.classList.contains('dialog-font-submit')) {
      await this.addFont(event.target.closest('form'))
    }
  },

  async changeSetFontEvent (event) {
    if (event.target.classList.contains('font-family')) {
      await this.setFont(event.target)
    }
  },

  async setFont (select) {
    const option = select.selectedOptions[0]
    if (option.classList.contains('font-family-add-font')) {
      this.installFont(select.value, option.dataset.url || null)
      select.value = ''
    } else {
      await RightCommon.changeStyle({ 'font-family': select.value })
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

  injectFontList (container) {
    const group = container.getElementsByClassName('font-family-my-fonts')[0]
    const list = HelperProject.getFontList()
    if (!list.length) return
    for (const font of list) {
      const node = group.parentNode.querySelector(`option[value="${font}"]`)
      if (node) node.remove()
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

  injectFontFamily (container, style) {
    const select = container.getElementsByClassName('font-family')[0]
    select.value = style['font-family'] ? style['font-family'].replaceAll('"', '') : ''
  }
}

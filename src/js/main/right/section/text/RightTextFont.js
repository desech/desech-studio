import RightCommon from '../../RightCommon.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import Page from '../../../../page/Page.js'
import HelperProject from '../../../../helper/HelperProject.js'
import RightVariableCommon from '../variable/RightVariableCommon.js'
import RightVariableInject from '../variable/RightVariableInject.js'

export default {
  getEvents () {
    return {
      change: ['changeSetFontEvent', 'changeAddFontPromptEvent'],
      click: ['clickAddFontSaveEvent']
    }
  },

  // this one first, so we don't trigger it when installing fonts
  async changeSetFontEvent (event) {
    if (event.target.classList.contains('font-family') &&
      !RightVariableCommon.isExecuteAction(event.target.value) &&
      !event.target.selectedOptions[0]?.classList.contains('font-family-add-option')) {
      await this.setFont(event.target)
    }
  },

  changeAddFontPromptEvent (event) {
    if (event.target.classList.contains('font-family-add-select') &&
      event.target.selectedOptions[0]?.classList.contains('font-family-add-option')) {
      // we want this for variables too
      this.addFontPrompt(event.target)
    }
  },

  async clickAddFontSaveEvent (event) {
    if (event.target.classList.contains('dialog-font-submit')) {
      await this.addFontSave(event.target.closest('form'))
    }
  },

  addFontPrompt (select) {
    this.installFont(select.value, select.selectedOptions[0].dataset.url || null)
    // this will keep the previous font value, after reload, without changing it
    select.value = select.dataset.previous
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

  async addFontSave (form) {
    const url = form.elements.url.value
    const file = form.elements.file.files[0] ? form.elements.file.files[0].path : null
    if (!url && !file) return
    const sucess = await window.electron.invoke('rendererAddFont', url, file)
    if (sucess) await Page.loadMain(HelperProject.getFile())
  },

  async setFont (select) {
    await RightCommon.changeStyle({ 'font-family': select.value })
    RightVariableInject.updateFieldVariables(select)
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

  injectFontFamily (container, value) {
    const select = container.querySelector('[name="font-family"]')
    select.value = value ? value.replaceAll('"', '') : ''
  }
}

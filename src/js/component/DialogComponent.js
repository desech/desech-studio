import HelperDOM from '../helper/HelperDOM.js'

export default {
  showDialog (data) {
    const dialog = HelperDOM.getTemplate('template-dialog')
    this.addSections(dialog, data)
    if (data.locked) dialog.dataset.locked = true
    this.openDialog(dialog)
    return dialog
  },

  addSections (dialog, data) {
    for (const section of ['header', 'body', 'footer']) {
      this.addSection(dialog, section, data[section])
    }
  },

  addSection (dialog, section, content) {
    if (content) {
      this.addContent(dialog, section, content)
    } else {
      this.hideSection(dialog, section)
    }
  },

  addContent (dialog, section, content) {
    // for header we need the title node
    const name = (section === 'header') ? 'title' : section
    const node = dialog.getElementsByClassName(`dialog-${name}`)[0]
    node.innerHTML = content
  },

  hideSection (dialog, section) {
    const node = dialog.getElementsByClassName(`dialog-${section}`)[0]
    HelperDOM.hide(node)
  },

  openDialog (dialog) {
    document.getElementById('popups').appendChild(dialog)
    dialog.showModal()
  },

  getContentHtml (type, section) {
    const content = this.getContent(type, section)
    return content.innerHTML
  },

  getContent (type, section) {
    const template = HelperDOM.getTemplate(`template-dialog-${type}`)
    return template.getElementsByClassName(`dialog-${section}`)[0]
  },

  closeAllDialogs (event = null) {
    // this functionality is implemented natively in the browser
    // but we want to make an exception for locked dialogs
    const dialogs = document.getElementsByClassName('dialog')
    for (let i = dialogs.length - 1; i >= 0; i--) {
      if (dialogs[i].dataset.locked) {
        if (event) event.preventDefault()
      } else {
        dialogs[i].remove()
      }
    }
  }
}

import HelperDOM from '../helper/HelperDOM.js'
import HelperUnit from '../helper/HelperUnit.js'

export default {
  // we used <dialog> in the past, but we switched to <div> because we need overlays on top
  showDialog (data) {
    const dialog = HelperDOM.getTemplate('template-dialog')
    this.addSections(dialog, data)
    if (data.locked) dialog.dataset.locked = true
    this.openDialog(dialog)
    this.positionDialog(dialog)
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
    HelperDOM.show(dialog)
  },

  // we can't use "transform: translate(-50%, -50%)" because it messes with the text-overlay
  positionDialog (dialog) {
    const box = dialog.children[0]
    const top = (HelperUnit.getWindowHeight() - box.offsetHeight) / 2
    const left = (HelperUnit.getWindowWidth() - box.offsetWidth) / 2
    box.style.top = Math.round(top - 100 > 100 ? top - 100 : top) + 'px'
    box.style.left = Math.round(left) + 'px'
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

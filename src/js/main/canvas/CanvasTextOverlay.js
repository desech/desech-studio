import HelperDOM from '../../helper/HelperDOM.js'

export default {
  reloadOverlay (clientX, clientY) {
    this.clearOverlay()
    this.loadOverlay(clientX, clientY)
  },

  clearOverlay () {
    HelperDOM.deleteChildren(this.getOverlay())
  },

  getOverlay () {
    return document.getElementById('text-overlay')
  },

  loadOverlay (clientX, clientY) {
    this.addOverlay()
    this.positionOverlay(clientX, clientY)
  },

  addOverlay () {
    const template = HelperDOM.getTemplate('template-text-overlay')
    this.prefillTags(template)
    HelperDOM.replaceOnlyChild(this.getOverlay(), template)
  },

  prefillTags (container) {
    const selection = window.getSelection()
    const clearButton = container.getElementsByClassName('text-overlay-clear')[0]
    for (const tag of this.getAllTags(container)) {
      this.prefillTag(selection, tag, clearButton)
    }
  },

  getAllTags (container) {
    return [
      ...this.getButtonTags(container),
      ...this.getSelectTags(container)
    ]
  },

  getButtonTags (container) {
    return container.getElementsByClassName('text-overlay-button')
  },

  getSelectTags (container) {
    return container.querySelectorAll('.text-overlay-select optgroup option')
  },

  prefillTag (selection, tag, clearButton) {
    const tagName = tag.value.toUpperCase()
    if (selection.anchorNode.parentNode.tagName === tagName ||
      selection.focusNode.parentNode.tagName === tagName) {
      this.prefillTagButtonOrOption(tag)
      clearButton.classList.add('inactive')
    }
  },

  prefillTagButtonOrOption (tag) {
    (tag.tagName === 'BUTTON') ? tag.classList.add('inactive')
      : tag.closest('select').value = tag.value
  },

  positionOverlay (clientX, clientY) {
    const container = document.getElementsByClassName('canvas-container')[0]
    const overlay = this.getOverlay()
    overlay.style.left = clientX + container.scrollLeft - container.offsetLeft + 'px'
    overlay.style.top = clientY + container.scrollTop - container.offsetTop + 20 + 'px'
  }
}

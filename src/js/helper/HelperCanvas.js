export default {
  getCanvas () {
    return document.getElementById('canvas')
  },

  getCanvasContainer () {
    return document.getElementsByClassName('canvas-container')[0]
  },

  getCanvasWidth () {
    return this.getCanvas().style.width
  },

  getCanvasHeight () {
    return this.getCanvas().style.height
  },

  scrollToTop () {
    const container = this.getCanvasContainer()
    container.scrollTop = 0
  },

  // data = tool, operation, selectedElement
  getCanvasData () {
    const canvas = this.getCanvas()
    if (canvas) return canvas.dataset
  },

  setCanvasData (key, value) {
    const canvas = this.getCanvas()
    canvas.dataset[key] = value
  },

  deleteCanvasData (key) {
    const canvas = this.getCanvas()
    delete canvas.dataset[key]
  },

  getTool () {
    const canvas = this.getCanvas()
    if (canvas) return this.getCanvasData().tool
  },

  isCreateTool (tool = null) {
    tool = tool || this.getTool()
    return (tool !== 'select' && tool !== 'hand')
  },

  // operation = selecting, moving, resizing, editing, panning
  getOperation () {
    const canvas = this.getCanvas()
    if (canvas) return this.getCanvasData().operation
  },

  getMain () {
    return document.getElementById('page-main')
  },

  isPreview () {
    const main = this.getMain()
    if (main) return main.classList.contains('preview')
  },

  canInteract () {
    const operation = this.getOperation()
    return (!this.isPreview() && this.getTool() === 'select' &&
      (!operation || operation === 'selecting'))
  },

  addPreview () {
    const main = this.getMain()
    if (main) main.classList.add('preview')
  },

  removePreview () {
    const main = this.getMain()
    if (main) main.classList.remove('preview')
  },

  getCurrentResponsiveWidth () {
    const data = this.getCurrentResponsiveData()
    if (!data['min-width'] && !data['max-width']) return null
    const obj = {}
    if (data['min-width']) obj['min-width'] = data['min-width']
    if (data['max-width']) obj['max-width'] = data['max-width']
    return obj
  },

  getCurrentResponsiveData () {
    const button = document.querySelector('.responsive-mode.selected')
    return JSON.parse(button.dataset.data)
  },

  getZoom (canvas = null) {
    if (!canvas) canvas = this.getCanvas()
    return parseInt(canvas.style.zoom) || 100
  },

  getZoomFactor (canvas = null) {
    if (!canvas) canvas = this.getCanvas()
    return this.getZoom(canvas) / 100
  },

  isAnimationRunning () {
    const canvas = this.getCanvas()
    return !canvas.classList.contains('stop-animation')
  },

  stopAnimation () {
    const canvas = this.getCanvas()
    canvas.classList.add('stop-animation')
  },

  playAnimation () {
    const canvas = this.getCanvas()
    canvas.classList.remove('stop-animation')
  }
}

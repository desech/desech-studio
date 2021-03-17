import HelperError from './HelperError.js'

export default {
  getWindowHeight () {
    return Math.round(window.visualViewport.height)
  },

  getCanvasWidth () {
    const canvas = document.getElementById('canvas')
    return Math.round(canvas.offsetWidth)
  },

  getCanvasHeight () {
    const container = document.getElementsByClassName('canvas-container')[0]
    return Math.round(container.offsetHeight)
  },

  anyToPx (val, unit) {
    const units = ['em', 'rem', 'vw', 'vh', 'ex', 'ch', 'vMin', 'vMax', 'mm', 'cm', 'in', 'pc',
      'pt']
    if (units.includes(unit)) {
      return this[`${unit}ToPx`](val)
    } else {
      HelperError.warn(new Error(`Unknown unit ${unit}`))
    }
  },

  emToPx (val) {
    // default font-size is 16px
    return Math.round(val * 16)
  },

  remToPx (val) {
    // same since we don't take the current element font-size, but the root one
    return this.emToPx(val)
  },

  vwToPx (val) {
    // our viewport is smaller than the browser viewport
    return this.getCanvasWidth() * (val / 100)
  },

  vhToPx (val) {
    return this.getCanvasHeight() * (val / 100)
  },

  exToPx (val) {
    // character "x" for regular Arial 16px
    return Math.round(val * 8.45)
  },

  chToPx (val) {
    // character "0" for regular Arial 16px
    return Math.round(val * 8.894)
  },

  vMinToPx (val) {
    return Math.min(this.vwToPx(val), this.vhToPx(val))
  },

  vMaxToPx (val) {
    return Math.max(this.vwToPx(val), this.vhToPx(val))
  },

  mmToPx (val) {
    return Math.round(val * 3.7795275591)
  },

  cmToPx (val) {
    return this.mmToPx(val) * 10
  },

  inToPx (val) {
    return Math.round(val * 96)
  },

  pcToPx (val) {
    return Math.round(val * 16.00000200315)
  },

  ptToPx (val) {
    return Math.round(val * 1.333)
  }
}

import StateStyleSheet from '../StateStyleSheet.js'
import ExtendJS from '../../helper/ExtendJS.js'

export default {
  getEditorProperties () {
    return [
      // size
      'width',
      'height',
      'min-width',
      'min-height',
      'max-width',
      'max-height',
      'margin', // not used but the sub properties are
      'margin-top',
      'margin-bottom',
      'margin-left',
      'margin-right',
      'padding', // not used but the sub properties are
      'padding-top',
      'padding-bottom',
      'padding-left',
      'padding-right',

      // grid
      'grid', // not used but the sub properties are
      'grid-template', // not used but the sub properties are
      'grid-template-columns',
      'grid-template-rows',
      'gap', // not used but the sub properties are
      'column-gap',
      'row-gap',
      'justify-items',
      'justify-content',
      'justify-self',
      'align-items',
      'align-content',
      'align-self',

      // border
      'border', // not used but the sub properties are
      'border-width', // not used but the sub properties are
      'border-top-width',
      'border-bottom-width',
      'border-left-width',
      'border-right-width',
      'border-style', // not used but the sub properties are
      'border-top-style',
      'border-bottom-style',
      'border-left-style',
      'border-right-style',
      'border-color', // not used but the sub properties are
      'border-top-color',
      'border-bottom-color',
      'border-left-color',
      'border-right-color',
      'border-radius', // not used but the sub properties are
      'border-top-right-radius',
      'border-top-left-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
      'border-image', // not used but the sub properties are
      'border-image-source',
      'border-image-slice',
      'border-image-width',
      'border-image-outset',
      'border-image-repeat',

      // text
      'font', // not used but the sub properties are
      'font-style',
      'font-size',
      'line-height',
      'letter-spacing',
      'font-family',
      'font-weight',
      'text-align',
      'text-transform',
      'text-decoration', // not used but the sub properties are
      'text-decoration-line',
      'text-decoration-color',
      'text-decoration-style',
      'color',

      // fill
      'background', // not used but the main property is
      'background-color', // not used because we use gradients and images
      'background-image',
      'background-origin',
      'background-position',
      'background-position-x', // not used but the main property is
      'background-position-y', // not used but the main property is
      'background-repeat',
      'background-repeat-x', // not used but the main property is
      'background-repeat-y', // not used but the main property is
      'background-size',
      'background-attachment',
      'background-blend-mode',

      // effects
      'filter',
      'box-shadow',
      'transform',
      'transition',
      'transition-property', // not used but the main property is
      'transition-duration', // not used but the main property is
      'transition-timing-function', // not used but the main property is
      'transition-delay', // not used but the main property is
      'mix-blend-mode',

      // animation
      'animation',
      'animation-name', // not used but the main property is
      'animation-duration', // not used but the main property is
      'animation-timing-function', // not used but the main property is
      'animation-delay', // not used but the main property is
      'animation-iteration-count', // not used but the main property is
      'animation-direction', // not used but the main property is
      'animation-fill-mode', // not used but the main property is
      'animation-play-state' // not used but the main property is,
    ]
  },

  getCustomProperties () {
    const editorProperties = this.getEditorProperties()
    const style = StateStyleSheet.getCurrentStyleObject()
    const difference = ExtendJS.arrayDifference(Object.keys(style), editorProperties)
    const merged = difference.reduce((obj, val) => ({ ...obj, [val]: style[val] }), {})
    this.fixBackgroundClipBug(merged)
    return merged
  },

  // bug: convert background-clip to -webkit-background-clip
  fixBackgroundClipBug (css) {
    if (css['background-clip']) {
      css['-webkit-background-clip'] = css['background-clip']
      delete css['background-clip']
    }
  },

  getEmptyProperties (properties) {
    const result = {}
    for (const name of Object.keys(properties)) {
      result[name] = ''
    }
    return result
  }
}

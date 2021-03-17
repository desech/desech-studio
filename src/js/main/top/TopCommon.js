import HelperUnit from '../../helper/HelperUnit.js'
import InputUnitField from '../../component/InputUnitField.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateCommand from '../../state/StateCommand.js'
import HelperProject from '../../helper/HelperProject.js'

export default {
  getResponsiveButton (responsive) {
    const min = responsive['min-width'] ? `[data-min-width="${responsive['min-width']}"]` : ''
    const max = responsive['max-width'] ? `[data-max-width="${responsive['max-width']}"]` : ''
    const query = `.responsive-edit${min}${max}`
    return document.querySelector(query)
  },

  getResponsiveModeData (data) {
    const max = this.getMaxType(data['max-width'])
    if (max) return max
    const min = this.getMinType(data['min-width'])
    if (min) return min
  },

  getMaxType (val) {
    const max = this.getUnitValue(val)
    if (!max) return
    if (max <= 576) return { value: max, type: 'phone' }
    if (max <= 768) return { value: max, type: 'tablet' }
    if (max <= 992) return { value: max, type: 'laptop' }
    return { value: max, type: 'desktop' }
  },

  getMinType (val) {
    const min = this.getUnitValue(val)
    if (!min) return
    if (min >= 1200) return { value: min, type: 'desktop' }
    if (min >= 992) return { value: min, type: 'laptop' }
    if (min >= 768) return { value: min, type: 'tablet' }
    return { value: min, type: 'phone' }
  },

  getUnitValue (val) {
    if (!val) return 0
    const unit = InputUnitField.getNumericValue(val)
    const px = (unit[1] === 'px') ? parseInt(unit[0]) : HelperUnit.anyToPx(unit[0], unit[1])
    return px
  },

  createOverlay (container, type) {
    const template = HelperDOM.getTemplate(`template-responsive-overlay-${type}`)
    this.disableResponsiveFields(template)
    container.appendChild(template)
    return template.getElementsByClassName('responsive-overlay')[0]
  },

  disableResponsiveFields (container) {
    const responsiveType = HelperProject.getProjectSettings().responsiveType
    const fieldType = (responsiveType === 'desktop') ? 'min' : 'max'
    const div = container.getElementsByClassName(`input-container-${fieldType}`)[0]
    div.classList.add('tooltip')
    for (const field of div.querySelectorAll('input, select')) {
      field.setAttributeNS(null, 'disabled', '')
    }
  },

  resizeCanvas (data) {
    this.setCanvasSize(data.width, data.height)
    this.addCanvasResponsiveClass(data)
    this.updateSizeText(data.width, data.height)
  },

  setCanvasSize (width, height) {
    const canvas = document.getElementById('canvas')
    canvas.style.width = width
    canvas.style.height = height
  },

  addCanvasResponsiveClass (data) {
    const canvas = document.getElementById('canvas')
    canvas.className = 'canvas-defaults scrollbar'
    if (data.inheritClasses) {
      HelperDOM.addClasses(canvas, data.inheritClasses.split(' '))
    }
  },

  updateSizeText (width, height) {
    const fields = document.getElementById('canvas-size-form').elements
    fields.width.value = parseInt(width)
    fields.height.value = parseInt(height)
  },

  editResponsiveMode (current, previous) {
    const command = {
      do: {
        command: 'changeResponsive',
        current,
        previous
      },
      undo: {
        command: 'changeResponsive',
        current: previous,
        previous: current
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  }
}

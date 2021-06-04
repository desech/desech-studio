import HelperUnit from '../../helper/HelperUnit.js'
import InputUnitField from '../../component/InputUnitField.js'
import HelperDOM from '../../helper/HelperDOM.js'
import StateCommand from '../../state/StateCommand.js'
import HelperProject from '../../helper/HelperProject.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import HelperStyle from '../../helper/HelperStyle.js'

export default {
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

  setResponsiveSizeCanvas (data) {
    this.addCanvasResponsiveClass(data)
    this.setCanvasSize(data.width, data.height)
    this.updateSizeText(data.width, data.height)
    this.positionDragHandle()
  },

  setCanvasSize (width, height) {
    const canvas = document.getElementById('canvas')
    canvas.style.width = width
    canvas.style.height = height
  },

  addCanvasResponsiveClass (data) {
    const canvas = document.getElementById('canvas')
    canvas.className = 'canvas-defaults scrollbar'
    if (data && data.inheritClasses) {
      HelperDOM.addClasses(canvas, data.inheritClasses.split(' '))
    }
  },

  updateSizeText (width, height) {
    const fields = document.getElementById('canvas-size-form').elements
    fields.width.value = parseInt(width)
    fields.height.value = parseInt(height)
  },

  positionDragHandle () {
    const handle = document.getElementById('canvas-resize')
    if (!handle) return
    const canvas = HelperCanvas.getCanvas()
    const zoom = HelperCanvas.getZoomFactor(canvas)
    handle.style.top = Math.round((canvas.offsetTop + 100) * zoom) + 'px'
    handle.style.left = this.getDragHandleLeftPost(canvas, zoom)
  },

  getDragHandleLeftPost (canvas, zoom) {
    return Math.round((canvas.offsetLeft + canvas.offsetWidth) * zoom) + 'px'
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
  },

  getResponsiveModes () {
    const settings = HelperProject.getProjectSettings()
    const modes = this.getSortedModes(settings).sort((a, b) => {
      // desktop - descending, mobile - ascending
      return (settings.responsiveType === 'desktop') ? b.value - a.value : a.value - b.value
    })
    this.addInheritData(modes)
    return modes
  },

  getSortedModes (settings) {
    const data = []
    for (const responsive of settings.responsive.list) {
      // min-width, max-height, width, height, value, type
      data.push({
        ...responsive,
        ...this.getModeValueType(responsive)
      })
    }
    return data
  },

  getModeValueType (data) {
    const max = this.getMaxType(data['max-width'])
    if (max) return max
    const min = this.getMinType(data['min-width'])
    if (min) return min
  },

  getMaxType (valueCss) {
    const max = this.getUnitValue(valueCss)
    if (!max) return
    if (max <= 576) return { value: max, valueCss, range: [0, 576], type: 'phone' }
    if (max <= 768) return { value: max, valueCss, range: [577, 768], type: 'tablet' }
    if (max <= 992) return { value: max, valueCss, range: [769, 992], type: 'laptop' }
    return { value: max, valueCss, range: [993, 1200], type: 'desktop' }
  },

  getMinType (valueCss) {
    const min = this.getUnitValue(valueCss)
    if (!min) return
    if (min >= 1200) return { value: min, valueCss, range: [1200, 10000], type: 'desktop' }
    if (min >= 992) return { value: min, valueCss, range: [992, 1199], type: 'laptop' }
    if (min >= 768) return { value: min, valueCss, range: [768, 991], type: 'tablet' }
    return { value: min, valueCss, range: [576, 767], type: 'phone' }
  },

  getUnitValue (val) {
    if (!val) return 0
    const unit = InputUnitField.getNumericValue(val)
    const px = (unit[1] === 'px') ? parseInt(unit[0]) : HelperUnit.anyToPx(unit[0], unit[1])
    return px
  },

  addInheritData (list) {
    for (let i = 0; i < list.length; i++) {
      // all previous siblings are inherited media queries
      // which we will need to add to the canvas
      list[i].ref = HelperStyle.getResponsiveClass(list[i].valueCss)
      list[i].inherit = list.slice(0, i + 1).map(mode => mode['min-width'] || mode['max-width'])
      list[i].inheritClasses = list[i].inherit.map(value =>
        HelperStyle.getResponsiveClass(value)
      ).join(' ')
    }
    return list
  }
}

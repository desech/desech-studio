import HelperDOM from '../helper/HelperDOM.js'
import InputUnitField from './InputUnitField.js'
import HelperStyle from '../helper/HelperStyle.js'

export default {
  getEvents () {
    return {
      change: ['changeFunctionEvent']
    }
  },

  changeFunctionEvent (event) {
    if (event.target.classList.contains('timing-function-select')) {
      this.changeTimingFunction(event.target)
    }
  },

  changeTimingFunction (select, data = {}, index = null) {
    this.toggleTimingContainer(select)
    this.injectData(select.closest('form').elements, data, index)
  },

  toggleTimingContainer (select) {
    const container = select.closest('form').getElementsByClassName('timing-container')[0]
    if (select.value === 'steps' || this.isBezier(select)) {
      const name = (select.value === 'steps') ? 'steps' : 'cubic-bezier'
      this.addTimingTemplate(container, name)
    } else {
      HelperDOM.deleteChildren(container)
    }
  },

  isBezier (select) {
    return select.value === 'cubic-bezier' || select.selectedOptions[0].dataset.bezier
  },

  addTimingTemplate (container, name) {
    const template = HelperDOM.getTemplate(`template-timing-${name}`)
    HelperDOM.replaceOnlyChild(container, template)
  },

  injectTimingFunction (fields, data, index) {
    const value = HelperStyle.getParsedCSSParam(data, index, 'function') ||
      HelperStyle.getParsedCSSParam(data, index, 'value') || this.getDefaultFieldValue('timing')
    const customBezier = (value === 'cubic-bezier')
      ? this.getBezierCustomFunction(fields.timing, index, data)
      : ''
    fields.timing.value = customBezier || value
  },

  getBezierCustomFunction (select, index, data) {
    const dataValues = [
      HelperStyle.getParsedCSSSubParam(data, index, 0),
      HelperStyle.getParsedCSSSubParam(data, index, 1),
      HelperStyle.getParsedCSSSubParam(data, index, 2),
      HelperStyle.getParsedCSSSubParam(data, index, 3)
    ].join(', ')
    for (const option of select.querySelectorAll('option[data-bezier]')) {
      if (option.dataset.bezier === dataValues) return option.value
    }
    return select.value
  },

  injectData (fields, data, index) {
    if (fields.timing.value === 'steps') this.injectStepsData(fields, data, index)
    if (this.isBezier(fields.timing)) this.injectBezierData(fields, data, index)
  },

  injectStepsData (fields, data, index) {
    const step = HelperStyle.getParsedCSSSubParam(data, index, 0) ||
      this.getDefaultFieldValue('step')
    InputUnitField.setValue(fields.step, step)
    fields.position.value = HelperStyle.getParsedCSSSubParam(data, index, 1) ||
      this.getDefaultFieldValue('position')
  },

  injectBezierData (fields, data, index) {
    const x1 = this.getBezierDataValue(fields.timing, data, index, 0, 'x1')
    const y1 = this.getBezierDataValue(fields.timing, data, index, 1, 'y1')
    const x2 = this.getBezierDataValue(fields.timing, data, index, 2, 'x2')
    const y2 = this.getBezierDataValue(fields.timing, data, index, 3, 'y2')
    InputUnitField.setValue(fields.x1, x1)
    InputUnitField.setValue(fields.y1, y1)
    InputUnitField.setValue(fields.x2, x2)
    InputUnitField.setValue(fields.y2, y2)
  },

  getBezierDataValue (select, data, index, subIndex, name) {
    if (select.value === 'cubic-bezier') {
      return HelperStyle.getParsedCSSSubParam(data, index, subIndex) ||
      this.getDefaultFieldValue(name)
    }
    const params = select.selectedOptions[0].dataset.bezier.split(', ')
    return params[subIndex]
  },

  getDefaultFieldValue (name) {
    switch (name) {
      case 'timing':
        return 'ease'
      case 'step':
        return '1'
      case 'position':
        return 'jump-end'
      case 'x1': case 'y1': case 'x2': case 'y2':
        return '0'
    }
  },

  getTimingFormValue (fields) {
    if (fields.timing.value === 'steps') return this.getStepsFormValue(fields)
    if (this.isBezier(fields.timing)) return this.getBezierFormValue(fields)
    return fields.timing.value
  },

  getStepsFormValue (fields) {
    const step = fields.step.value || this.getDefaultFieldValue('step')
    const position = fields.position.value || this.getDefaultFieldValue('position')
    return `steps(${step}, ${position})`
  },

  getBezierFormValue (fields) {
    const x1 = fields.x1.value || this.getDefaultFieldValue('x1')
    const y1 = fields.y1.value || this.getDefaultFieldValue('y1')
    const x2 = fields.x2.value || this.getDefaultFieldValue('x2')
    const y2 = fields.y2.value || this.getDefaultFieldValue('y2')
    return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
  }
}

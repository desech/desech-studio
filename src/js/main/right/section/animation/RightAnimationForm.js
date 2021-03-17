import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import TimingFunction from '../../../../component/TimingFunction.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightAnimationCommon from './RightAnimationCommon.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeAnimationFieldsEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  changeAnimationFieldsEvent (event) {
    if (event.target.closest('.animation-form-container .animation-field') || event.target.closest('.animation-form-container .timing-field')) {
      this.changeAnimationFields(event.target.closest('#animation-section'))
    }
  },

  buildForm (form, elemIndex) {
    const value = this.getValueAtIndex(elemIndex)
    this.injectData(form, value)
  },

  getValueAtIndex (index) {
    return this.getParsedValues()[index] || {}
  },

  getParsedValues () {
    const source = StateStyleSheet.getPropertyValue('animation')
    return this.parseCSS(source)
  },

  parseCSS (source) {
    return HelperStyle.parseCSSValues(source, {
      valuesDelimiter: ', ',
      paramsDelimiter: ' ',
      subParamsDelimiter: ', '
    })
  },

  injectData (container, data) {
    const fields = container.closest('form').elements
    this.injectOptions(fields, data)
    this.injectAnimationType(fields, data)
    TimingFunction.changeTimingFunction(fields.timing, data, 1)
  },

  injectOptions (fields, data) {
    InputUnitField.setValue(fields.duration, HelperStyle.getParsedCSSParam(data, 0) || RightAnimationCommon.getDefaultFieldValue('duration'))
    TimingFunction.injectTimingFunction(fields, data, 1)
    InputUnitField.setValue(fields.delay, HelperStyle.getParsedCSSParam(data, 2) || RightAnimationCommon.getDefaultFieldValue('delay'))
    fields.iteration.value = HelperStyle.getParsedCSSParam(data, 3) // since this is a number field we can't add the "infinite" default value
    fields.direction.value = HelperStyle.getParsedCSSParam(data, 4) || RightAnimationCommon.getDefaultFieldValue('direction')
    fields.fill.value = HelperStyle.getParsedCSSParam(data, 5) || RightAnimationCommon.getDefaultFieldValue('fill')
    fields.state.value = HelperStyle.getParsedCSSParam(data, 6) || RightAnimationCommon.getDefaultFieldValue('state')
  },

  injectAnimationType (fields, data) {
    const elemType = HelperElement.getType(StateSelectedElement.getElement())
    if (elemType === 'text') HelperDOM.show(fields.type.getElementsByClassName('text-animation')[0])
    fields.type.value = RightAnimationCommon.getAnimationType(data, elemType)
  },

  setAnimation (section) {
    const current = RightAnimationCommon.getActiveElement(section)
    const fields = section.getElementsByClassName('slide-container')[0].elements
    const value = this.getDisplayedValue(fields)
    RightCommon.changeStyle({
      animation: this.setAnimationAtIndex(value, HelperDOM.getElementIndex(current))
    })
    const data = this.parseCSS(value)[0]
    RightAnimationCommon.setElementData(current, data)
  },

  getDisplayedValue (fields) {
    return [
      InputUnitField.getValue(fields.duration) || RightAnimationCommon.getDefaultFieldValue('duration'),
      TimingFunction.getTimingFormValue(fields) || RightAnimationCommon.getDefaultFieldValue('timing'),
      InputUnitField.getValue(fields.delay) || RightAnimationCommon.getDefaultFieldValue('delay'),
      fields.iteration.value || RightAnimationCommon.getDefaultFieldValue('iteration'),
      fields.direction.value || RightAnimationCommon.getDefaultFieldValue('direction'),
      fields.fill.value || RightAnimationCommon.getDefaultFieldValue('fill'),
      fields.state.value || RightAnimationCommon.getDefaultFieldValue('state'),
      fields.type.value || RightAnimationCommon.getDefaultFieldValue('type')
    ].join(' ')
  },

  setAnimationAtIndex (value, index) {
    const values = this.getValuesArray()
    values[index] = value
    return values.join(', ')
  },

  getValuesArray () {
    const values = this.getParsedValues()
    const results = []
    for (const val of values) {
      results.push(val.value)
    }
    return results
  },

  changeAnimationFields (section) {
    this.setAnimation(section)
  },

  deleteAnimation (index) {
    RightCommon.changeStyle({
      animation: this.removeAnimationAtIndex(index)
    })
  },

  removeAnimationAtIndex (index) {
    const values = this.getValuesArray()
    values.splice(index, 1)
    return values.join(', ')
  },

  sortAnimations (from, to) {
    RightCommon.changeStyle({
      animation: this.replaceAnimationAtIndex(from, to)
    })
  },

  replaceAnimationAtIndex (from, to) {
    const values = this.getValuesArray()
    const sorted = ExtendJS.insertAndShift(values, from, to)
    return sorted.join(', ')
  }
}

import StateStyleSheet from '../../../../state/StateStyleSheet.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import TimingFunction from '../../../../component/TimingFunction.js'
import InputUnitField from '../../../../component/InputUnitField.js'
import HelperElement from '../../../../helper/HelperElement.js'
import HelperDOM from '../../../../helper/HelperDOM.js'
import ExtendJS from '../../../../helper/ExtendJS.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import RightAnimationCommon from './RightAnimationCommon.js'
import RightCommon from '../../RightCommon.js'

export default {
  getEvents () {
    return {
      change: ['changeAnimationFieldsEvent']
    }
  },

  async changeAnimationFieldsEvent (event) {
    if (event.target.closest('.animation-form-container .animation-field') ||
      event.target.closest('.animation-form-container .timing-field')) {
      await this.changeAnimationFields(event.target, event.target.closest('#animation-section'))
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

  getValuesFromStyle (style) {
    return this.parseCSS(style.animation)
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
    InputUnitField.setValue(fields.duration, HelperStyle.getParsedCSSParam(data, 0) ||
      RightAnimationCommon.getDefaultFieldValue('duration'))
    TimingFunction.injectTimingFunction(fields, data, 1)
    InputUnitField.setValue(fields.delay, HelperStyle.getParsedCSSParam(data, 2) ||
      RightAnimationCommon.getDefaultFieldValue('delay'))
    // since this is a number field we can't add the "infinite" default value
    fields.iteration.value = HelperStyle.getParsedCSSParam(data, 3)
    fields.direction.value = HelperStyle.getParsedCSSParam(data, 4) ||
      RightAnimationCommon.getDefaultFieldValue('direction')
    fields.fill.value = HelperStyle.getParsedCSSParam(data, 5) ||
      RightAnimationCommon.getDefaultFieldValue('fill')
    fields.state.value = HelperStyle.getParsedCSSParam(data, 6) ||
      RightAnimationCommon.getDefaultFieldValue('state')
  },

  injectAnimationType (fields, data) {
    const elemType = HelperElement.getType(StateSelectedElement.getElement())
    if (elemType === 'text') {
      HelperDOM.show(fields.type.getElementsByClassName('text-animation')[0])
    }
    fields.type.value = RightAnimationCommon.getAnimationType(data, elemType)
  },

  async setAnimation (section) {
    const current = RightAnimationCommon.getActiveElement(section)
    const fields = section.getElementsByClassName('slide-container')[0].elements
    const index = HelperDOM.getElementIndex(current)
    const value = this.getDisplayedValue(fields, index)
    if (RightCommon.isGeneralValue(value)) {
      await this.setGeneralAnimation(current, value)
    } else {
      const animation = this.setAnimationAtIndex(value, index)
      await RightCommon.changeStyle({ animation })
      RightAnimationCommon.setElementData(current, this.parseCSS(value)[0])
    }
  },

  async setGeneralAnimation (current, value) {
    const animation = (value === 'none') ? '0s ease 0s 1 normal none running none' : value
    await RightCommon.changeStyle({ animation })
    RightAnimationCommon.setElementData(current, value)
  },

  getDisplayedValue (fields, index) {
    if (RightCommon.isGeneralValue(fields.type.value)) return fields.type.value
    return [
      InputUnitField.getValue(fields.duration) ||
        RightAnimationCommon.getDefaultFieldValue('duration'),
      TimingFunction.getTimingFormValue(fields) ||
        RightAnimationCommon.getDefaultFieldValue('timing'),
      InputUnitField.getValue(fields.delay) || RightAnimationCommon.getDefaultFieldValue('delay'),
      fields.iteration.value || RightAnimationCommon.getDefaultFieldValue('iteration'),
      fields.direction.value || RightAnimationCommon.getDefaultFieldValue('direction'),
      fields.fill.value || RightAnimationCommon.getDefaultFieldValue('fill'),
      fields.state.value || RightAnimationCommon.getDefaultFieldValue('state'),
      fields.type.value || this.getTypeValue(index)
    ].join(' ')
  },

  getTypeValue (index) {
    // we need to return the custom value if it exists, or the default value
    const data = this.getValueAtIndex(index)
    return HelperStyle.getParsedCSSParam(data, 7) ||
      RightAnimationCommon.getDefaultFieldValue('type')
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

  async changeAnimationFields (field, section) {
    await this.setAnimation(section)
    if (field.name === 'type' && RightCommon.isGeneralValue(field.value)) {
      this.setGeneralAnimationInList(section)
    }
  },

  setGeneralAnimationInList (section) {
    const list = section.getElementsByClassName('animation-list')[0]
    list.querySelectorAll('.animation-element:not(.active)').forEach(el => el.remove())
    list.children[0].classList.remove('active')
    const container = section.getElementsByClassName('animation-form-container')[0]
    HelperDOM.deleteChildren(container)
  },

  async deleteAnimation (index) {
    await RightCommon.changeStyle({
      animation: this.removeAnimationAtIndex(index)
    })
  },

  removeAnimationAtIndex (index) {
    const values = this.getValuesArray()
    values.splice(index, 1)
    return values.join(', ')
  },

  async sortAnimations (from, to) {
    await RightCommon.changeStyle({
      animation: this.replaceAnimationAtIndex(from, to)
    })
  },

  replaceAnimationAtIndex (from, to) {
    const values = this.getValuesArray()
    const sorted = ExtendJS.insertAndShift(values, from, to)
    return sorted.join(', ')
  }
}

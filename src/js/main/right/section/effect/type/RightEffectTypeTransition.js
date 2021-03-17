import StateStyleSheet from '../../../../../state/StateStyleSheet.js'
import HelperStyle from '../../../../../helper/HelperStyle.js'
import InputUnitField from '../../../../../component/InputUnitField.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'
import TimingFunction from '../../../../../component/TimingFunction.js'

export default {
  getTemplate () {
    return HelperDOM.getTemplate('template-effect-transition')
  },

  getParsedValues () {
    const source = StateStyleSheet.getPropertyValue('transition')
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
    this.injectMainOptions(fields, data)
    TimingFunction.changeTimingFunction(fields.timing, data, 2)
  },

  injectMainOptions (fields, data) {
    fields.property.value = HelperStyle.getParsedCSSParam(data, 0) || this.getDefaultFieldValue('property')
    InputUnitField.setValue(fields.duration, HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultFieldValue('duration'))
    TimingFunction.injectTimingFunction(fields, data, 2)
    InputUnitField.setValue(fields.delay, HelperStyle.getParsedCSSParam(data, 3) || this.getDefaultFieldValue('delay'))
  },

  getDefaultFieldValue (name) {
    switch (name) {
      case 'property':
        return 'all'
      case 'duration':
        return '1s'
      case 'delay':
        return '0s'
    }
  },

  getDisplayedValue (section) {
    const fields = section.getElementsByClassName('slide-container')[0].elements
    return [
      fields.property.value || this.getDefaultFieldValue('property'),
      InputUnitField.getValue(fields.duration) || this.getDefaultFieldValue('duration'),
      TimingFunction.getTimingFormValue(fields) || this.getDefaultFieldValue('timing'),
      InputUnitField.getValue(fields.delay) || this.getDefaultFieldValue('delay')
    ].join(' ')
  },

  getElementName (data, name) {
    const properties = HelperStyle.getParsedCSSParam(data, 0)
    return `${name} ${properties}`
  }
}

import HelperVariable from '../../helper/HelperVariable.js'
import StateStyleSheet from '../StateStyleSheet.js'

export default {
  // can be `ref` or `var(--ref)`
  getVariableValue (value) {
    const ref = HelperVariable.getVariableRef(value)
    return StateStyleSheet.getPropertyValue('--' + ref, ':root', false)
  }
}

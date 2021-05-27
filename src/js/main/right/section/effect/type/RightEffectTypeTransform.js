import StateStyleSheet from '../../../../../state/StateStyleSheet.js'
import HelperStyle from '../../../../../helper/HelperStyle.js'
import HelperDOM from '../../../../../helper/HelperDOM.js'
import InputUnitField from '../../../../../component/InputUnitField.js'
import ExtendJS from '../../../../../helper/ExtendJS.js'
import RightEffectCommon from './RightEffectCommon.js'

export default {
  getTemplate (type) {
    return HelperDOM.getTemplate(`template-effect-transform-${type}`)
  },

  getParsedValues () {
    const value = StateStyleSheet.getPropertyValue('transform')
    if (RightEffectCommon.isGeneralValue(value)) return [{ value }]
    return this.parseCSS(value)
  },

  parseCSS (source) {
    const transforms = HelperStyle.parseCSSValues(source, {
      valuesDelimiter: ' ',
      paramsDelimiter: ', '
    })
    return this.joinRotate(transforms)
  },

  joinRotate (results) {
    for (let i = 0; i < results.length; i++) {
      if (results[i].function === 'rotateX') {
        results[i] = this.setRotateElement(results, i)
        results.splice(i + 1, 2)
        break
      }
    }
    return results
  },

  setRotateElement (results, i) {
    const x = results[i].params[0]
    const y = results[i + 1].params[0]
    const z = results[i + 2].params[0]
    return {
      value: [results[i].value, results[i + 1].value, results[i + 2].value].join(' '),
      function: 'rotate',
      paramsString: [x.value, y.value, z.value].join(', '),
      params: [x, y, z]
    }
  },

  injectData (container, data, type) {
    this['inject' + ExtendJS.capitalize(type)](container.closest('form').elements, data)
  },

  injectPerspective (fields, data) {
    const value = HelperStyle.getParsedCSSParam(data, 0) ||
      this.getDefaultFieldValue('perspective')
    InputUnitField.setValue(fields.distance, value)
  },

  injectTranslate3d (fields, data) {
    const x = HelperStyle.getParsedCSSParam(data, 0) || this.getDefaultFieldValue('translate3d')
    const y = HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultFieldValue('translate3d')
    const z = HelperStyle.getParsedCSSParam(data, 2) || this.getDefaultFieldValue('translate3d')
    InputUnitField.setValue(fields.x, x)
    InputUnitField.setValue(fields.y, y)
    InputUnitField.setValue(fields.z, z)
  },

  injectScale3d (fields, data) {
    fields.x.value = HelperStyle.getParsedCSSParam(data, 0) ||
      this.getDefaultFieldValue('scale3d')
    fields.y.value = HelperStyle.getParsedCSSParam(data, 1) ||
      this.getDefaultFieldValue('scale3d')
    fields.z.value = HelperStyle.getParsedCSSParam(data, 2) ||
      this.getDefaultFieldValue('scale3d')
  },

  injectRotate (fields, data) {
    const x = HelperStyle.getParsedCSSParam(data, 0) || this.getDefaultFieldValue('rotate')
    const y = HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultFieldValue('rotate')
    const z = HelperStyle.getParsedCSSParam(data, 2) || this.getDefaultFieldValue('rotate')
    InputUnitField.setValue(fields.x, x)
    InputUnitField.setValue(fields.y, y)
    InputUnitField.setValue(fields.z, z)
  },

  injectSkew (fields, data) {
    const x = HelperStyle.getParsedCSSParam(data, 0) || this.getDefaultFieldValue('skew')
    const y = HelperStyle.getParsedCSSParam(data, 1) || this.getDefaultFieldValue('skew')
    InputUnitField.setValue(fields.x, x)
    InputUnitField.setValue(fields.y, y)
  },

  injectMatrix (fields, data) {
    for (const [i, name] of ['a', 'b', 'c', 'd', 'x', 'y'].entries()) {
      fields[name].value = HelperStyle.getParsedCSSParam(data, i) ||
        this.getDefaultFieldValue('matrix', name)
    }
  },

  injectMatrix3d (fields, data) {
    for (let i = 0; i < 4; i++) {
      for (const [j, name] of ['a', 'b', 'c', 'd'].entries()) {
        fields[name + (i + 1)].value = HelperStyle.getParsedCSSParam(data, j + (i * 4)) ||
          this.getDefaultFieldValue('matrix3d', name + (i + 1))
      }
    }
  },

  getDefaultFieldValue (type, name = null) {
    switch (type) {
      case 'perspective':
      case 'translate3d':
        return '0px'
      case 'scale3d':
        return '1'
      case 'rotate':
      case 'skew':
        return '0deg'
      case 'matrix':
        return (name === 'a' || name === 'd') ? '1' : '0'
      case 'matrix3d':
        return (name === 'a1' || name === 'b2' || name === 'c3' || name === 'd4') ? '1' : '0'
    }
  },

  getDisplayedValue (section, type) {
    const fields = section.getElementsByClassName('slide-container')[0].elements
    return this['getValue' + ExtendJS.capitalize(type)](fields)
  },

  getValuePerspective (fields) {
    const distance = InputUnitField.getValue(fields.distance) ||
      this.getDefaultFieldValue('perspective')
    return `perspective(${distance})`
  },

  getValueTranslate3d (fields) {
    const x = InputUnitField.getValue(fields.x) || this.getDefaultFieldValue('translate3d')
    const y = InputUnitField.getValue(fields.y) || this.getDefaultFieldValue('translate3d')
    const z = InputUnitField.getValue(fields.z) || this.getDefaultFieldValue('translate3d')
    return `translate3d(${x}, ${y}, ${z})`
  },

  getValueScale3d (fields) {
    const x = fields.x.value || this.getDefaultFieldValue('scale3d')
    const y = fields.y.value || this.getDefaultFieldValue('scale3d')
    const z = fields.z.value || this.getDefaultFieldValue('scale3d')
    return `scale3d(${x}, ${y}, ${z})`
  },

  getValueRotate (fields) {
    const x = InputUnitField.getValue(fields.x) || this.getDefaultFieldValue('rotate')
    const y = InputUnitField.getValue(fields.y) || this.getDefaultFieldValue('rotate')
    const z = InputUnitField.getValue(fields.z) || this.getDefaultFieldValue('rotate')
    return `rotateX(${x}) rotateY(${y}) rotateZ(${z})`
  },

  getValueSkew (fields) {
    const x = InputUnitField.getValue(fields.x) || this.getDefaultFieldValue('skew')
    const y = InputUnitField.getValue(fields.y) || this.getDefaultFieldValue('skew')
    return `skew(${x}, ${y})`
  },

  getValueMatrix (fields) {
    const data = {}
    for (const name of ['a', 'b', 'c', 'd', 'x', 'y']) {
      data[name] = fields[name].value || this.getDefaultFieldValue('matrix', name)
    }
    return `matrix(${data.a}, ${data.b}, ${data.c}, ${data.d}, ${data.x}, ${data.y})`
  },

  getValueMatrix3d (fields) {
    const data = {}
    for (let i = 1; i <= 4; i++) {
      for (const name of ['a', 'b', 'c', 'd']) {
        data[name + i] = fields[name + i].value || this.getDefaultFieldValue('matrix3d', name + i)
      }
    }
    return `matrix3d(${data.a1}, ${data.b1}, ${data.c1}, ${data.d1}, ` +
      `${data.a2}, ${data.b2}, ${data.c2}, ${data.d2}, ` +
      `${data.a3}, ${data.b3}, ${data.c3}, ${data.d3}, ` +
      `${data.a4}, ${data.b4}, ${data.c4}, ${data.d4})`
  },

  getLabelExtra (data) {
    return (!data.function.startsWith('matrix')) ? data.paramsString : ''
  }
}

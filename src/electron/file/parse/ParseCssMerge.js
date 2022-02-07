import HelperStyle from '../../../js/helper/HelperStyle.js'
import ParseCommon from './ParseCommon.js'
import HelperParserBackground from '../../../js/helper/parser/HelperParserBackground.js'
import HelperColor from '../../../js/helper/HelperColor.js'

export default {
  mergeProperties (props) {
    this.mergeMarginPadding(props, 'margin')
    this.mergeMarginPadding(props, 'padding')
    this.mergeBorderRadius(props)
    this.mergeBorderStyle(props)
    this.mergeBorderWidth(props)
    this.mergeBorderColor(props)
    this.mergeBorder(props)
    this.cleanBorderImage(props)
    this.cleanBackgroundImage(props)
    return props
  },

  propertiesExist (props, names) {
    for (const name of names) {
      if (!props[name]) return false
    }
    return true
  },

  propertiesAreEqual (props, names) {
    for (const name of names) {
      if (props[name].value !== props[names[0]].value) return false
    }
    return true
  },

  deleteProperties (props, names) {
    for (const name of names) {
      if (props[name]) delete props[name]
    }
  },

  mergeEqualProperties (props, names, final) {
    if (!this.propertiesExist(props, names) || !this.propertiesAreEqual(props, names)) return
    props[final] = { ...props[names[0]] }
    this.deleteProperties(props, names)
  },

  mergeMarginPadding (props, type) {
    const names = [type + '-top', type + '-right', type + '-bottom', type + '-left']
    if (!this.propertiesExist(props, names)) return
    props[type] = {
      responsive: props[names[0]].responsive,
      value: this.getMarginPaddingValue(props, type)
    }
    this.deleteProperties(props, names)
  },

  getMarginPaddingValue (props, type) {
    return HelperStyle.join4SidesChunks({
      top: props[type + '-top'].value,
      right: props[type + '-right'].value,
      bottom: props[type + '-bottom'].value,
      left: props[type + '-left'].value
    })
  },

  mergeBorderRadius (props) {
    const names = ParseCommon.getBorderRadiusProperties()
    this.mergeEqualProperties(props, names, 'border-radius')
  },

  mergeBorderStyle (props) {
    const names = ParseCommon.getBorderStyleProperties()
    this.mergeEqualProperties(props, names, 'border-style')
  },

  mergeBorderWidth (props) {
    const names = ParseCommon.getBorderWidthProperties()
    this.mergeEqualProperties(props, names, 'border-width')
  },

  mergeBorderColor (props) {
    const names = ParseCommon.getBorderColorProperties()
    this.mergeEqualProperties(props, names, 'border-color')
  },

  mergeBorder (props) {
    const names = ['border-width', 'border-style', 'border-color']
    if (!this.propertiesExist(props, names)) return
    const value = [props['border-width'].value, props['border-style'].value,
      props['border-color'].value].join(' ')
    props.border = {
      responsive: props[names[0]].responsive,
      value
    }
    this.deleteProperties(props, names)
  },

  cleanBorderImage (props) {
    if (props['border-image-source']) return
    const names = ['border-image-outset', 'border-image-slice', 'border-image-repeat']
    this.deleteProperties(props, names)
  },

  cleanBackgroundImage (props) {
    const names = ParseCommon.getBackgroundProperties()
    for (const name of names) {
      if (props[name] && props[name].value === HelperStyle.getDefaultProperty(name)) {
        delete props[name]
      }
    }
  },

  getSolidColorBackground (props, names) {
    if (!props['background-image']) return
    for (const name of names) {
      if (props[name] && props[name].value !== HelperStyle.getDefaultProperty(name)) return
    }
    const solid = HelperParserBackground.convertBgToColor(props['background-image'].value)
    if (HelperColor.isSolidColor(solid)) return solid
  }
}

import HelperStyle from '../helper/HelperStyle.js'
import HelperLocalStore from '../helper/HelperLocalStore.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import StyleSheetCommon from './stylesheet/StyleSheetCommon.js'
import ExtendJS from '../helper/ExtendJS.js'
import StyleSheetSelector from './stylesheet/StyleSheetSelector.js'
import HelperFile from '../helper/HelperFile.js'
import HelperComponent from '../helper/HelperComponent.js'
import HelperElement from '../helper/HelperElement.js'

export default {
  getPropertyValue (property, selector = '', matchResponsive = true) {
    selector = selector || StyleSheetSelector.getCurrentSelector()
    const responsive = matchResponsive ? HelperCanvas.getCurrentResponsiveWidth() : null
    const sheet = StyleSheetCommon.getSelectorSheet(selector)
    if (!sheet) return ''
    for (const r of sheet.cssRules) {
      const rule = r.cssRules[0]
      if (matchResponsive && !StyleSheetCommon.equalResponsiveRules(rule, responsive)) {
        continue
      }
      const value = rule ? rule.style.getPropertyValue(property) : null
      if (value) return value
    }
    return ''
  },

  removeStyleRule (data) {
    const sheet = StyleSheetCommon.getSelectorSheet(data.selector)
    this.deleteRuleByProperty(sheet, data.property)
    StyleSheetCommon.haveAtLeastOneRule(sheet, data.selector)
  },

  getCreateSelectorSheet (selector) {
    let sheet = StyleSheetCommon.getSelectorSheet(selector)
    if (!sheet) sheet = this.addSelector(selector, [{ name: '', value: '' }])
    return sheet
  },

  initElementStyle (ref) {
    const selector = HelperStyle.buildRefSelector(ref)
    return this.addSelector(selector, [{ name: '', value: '' }])
  },

  addSelectors (styles) {
    for (const [selector, style] of Object.entries(styles)) {
      this.addSelector(selector, style)
    }
  },

  addSelector (selector, style) {
    const sheet = StyleSheetCommon.initStyleSheet()
    StyleSheetCommon.addRemoveRules(sheet, selector, style)
    this.addPositionedSheet(sheet, selector)
    return sheet
  },

  addPositionedSheet (sheet, selector) {
    document.adoptedStyleSheets = this.buildSheetArray([...document.adoptedStyleSheets], sheet,
      selector)
  },

  buildSheetArray (array, sheet, selector) {
    if (array.length) {
      const pos = this.getInsertSheetPosition(array, selector)
      array.splice(pos, 0, sheet)
      return array
    } else {
      return [sheet]
    }
  },

  // the order is the one from the <link> css files: root, component-css, component-html, page
  //  1. root variables
  //  2. component-css classes
  //  3. component-html variants
  //  4. component-html refs and overrides in random order
  //  5. e000body
  //  6. page refs
  // new class selectors + new variant component selectors
  //  - are added at the end of all component-css class selectors
  // new ref component selectors + component ref override selectors
  //  - inside components -> are added at the end of all selectors
  //  - inside pages -> are added at the end of all ref component selectors, before .e000body
  // new ref page selectors are added at the end of all selectors
  getInsertSheetPosition (array, selector) {
    if (array.length === 1) return 1
    const data = this.getSelectorTypeData(selector)
    const foundPos = this.getInsertSheetInnerPosition(array, data)
    return foundPos || this.getLastRefPosition(array, data.ref)
  },

  getSelectorTypeData (selector) {
    const component = HelperStyle.extractComponentSelector(selector)
    if (component) {
      return {
        type: 'component',
        part: component
      }
    }
    const cls = HelperStyle.extractClassSelector(selector)
    if (cls) {
      return {
        type: 'class',
        part: cls
      }
    }
    const ref = HelperStyle.extractRefSelector(selector)
    if (ref) {
      return {
        type: 'ref',
        part: ref,
        ref
      }
    }
  },

  getInsertSheetInnerPosition (array, data) {
    for (let pos = 1; pos < array.length; pos++) {
      const previousSelector = array[pos - 1].cssRules[0].cssRules[0].selectorText
      const currentSelector = array[pos].cssRules[0].cssRules[0].selectorText
      if ((previousSelector.includes(data.part) && !currentSelector.includes(data.part)) ||
        (data.type !== 'ref' && !HelperStyle.isClassSelector(currentSelector))) {
        // if we are at the end of our class selectors, or we are entering the ref selectors
        return pos
      }
    }
  },

  // only if we are inside a page and this is a component ref, then we need the position right
  // before the e000body element, otherwise we just return the last position of the array
  getLastRefPosition (array, ref) {
    if (ref && HelperFile.isPageFile() &&
      HelperComponent.belongsToAComponent(HelperElement.getElement(ref))) {
      return StyleSheetCommon.getSelectorSheetIndex('.e000body')
    } else {
      return array.length
    }
  },

  insertSheetAtPosition (selector, position, target) {
    const array = [...document.adoptedStyleSheets]
    const from = StyleSheetCommon.getSelectorSheetIndex(selector)
    const to = this.getSheetSortPosition(target, position, from)
    document.adoptedStyleSheets = ExtendJS.insertAndShift(array, from, to)
  },

  getSheetSortPosition (selector, position, from) {
    const index = StyleSheetCommon.getSelectorSheetIndex(selector)
    if (position === 'top') {
      return (from > index) ? index : index - 1
    } else {
      return index
    }
  },

  deleteRuleByProperty (sheet, property) {
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const name = StyleSheetCommon.getProperty(sheet.cssRules[i].cssRules[0])
      if (name === property) {
        StyleSheetCommon.deleteRule(sheet, i)
        return
      }
    }
  },

  saveDeletedSelector (selector) {
    const style = StyleSheetCommon.getSelectorStyle(selector, false)
    HelperLocalStore.setItem('selector-' + selector, style)
  },

  getCurrentStyleObject (selector = null) {
    if (!selector) selector = StyleSheetSelector.getCurrentSelector()
    const sheet = this.getCreateSelectorSheet(selector)
    const style = StyleSheetCommon.extractStyleFromRules(sheet.cssRules)
    return this.convertStyleArrayToObject(style)
  },

  convertStyleArrayToObject (array) {
    const object = {}
    for (const prop of array) {
      object[prop.name] = prop.value
    }
    return object
  }
}

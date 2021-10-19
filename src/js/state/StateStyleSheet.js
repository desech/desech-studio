import HelperStyle from '../helper/HelperStyle.js'
import HelperLocalStore from '../helper/HelperLocalStore.js'
import HelperCanvas from '../helper/HelperCanvas.js'
import StyleSheetCommon from './stylesheet/StyleSheetCommon.js'
import ExtendJS from '../helper/ExtendJS.js'
import StyleSheetSelector from './stylesheet/StyleSheetSelector.js'
import StateSelectedElement from './StateSelectedElement.js'

export default {
  getPropertyValue (property, selector = '', checkResponsive = true) {
    selector = selector || StyleSheetSelector.getCurrentSelector()
    const responsive = checkResponsive ? HelperCanvas.getCurrentResponsiveWidth() : null
    const sheet = StyleSheetCommon.getSelectorSheet(selector)
    if (!sheet) return ''
    for (const r of sheet.cssRules) {
      const rule = r.cssRules[0]
      if (checkResponsive && !StyleSheetCommon.equalResponsiveRules(rule, responsive)) {
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

  initElementStyle (ref, createElement = true) {
    const selectors = { default: { '': '' } }
    this.addStyleSelectors(ref, selectors)
  },

  addStyleSelectors (ref, selectors) {
    for (const [selectorLabel, style] of Object.entries(selectors)) {
      const selector = StyleSheetSelector.getCssSelector(ref, selectorLabel)
      const data = this.convertStyleObjectToArray(style)
      this.addSelector(selector, data)
    }
  },

  convertStyleObjectToArray (object) {
    const array = []
    for (const [name, value] of Object.entries(object)) {
      array.push({ name, value })
    }
    return array
  },

  convertStyleArrayToObject (array) {
    const object = {}
    for (const prop of array) {
      object[prop.name] = prop.value
    }
    return object
  },

  addSelector (selector, style) {
    const sheet = StyleSheetCommon.initStyleSheet()
    StyleSheetCommon.addRemoveRules(sheet, selector, style)
    this.addPositionedSheet(sheet, selector)
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

  // order = 1) :root, 2) ref selectors, 3) class selectors
  getInsertSheetPosition (array, selector) {
    if (array.length === 1) return 1
    const ref = HelperStyle.extractRefFromSelector(selector)
    const cls = HelperStyle.extractClassSelector(selector)
    const pos = this.getInsertSheetInnerPosition(array, ref, cls)
    return pos || array.length
  },

  getInsertSheetInnerPosition (array, ref, cls) {
    for (let i = 1; i < array.length; i++) {
      const previousSelector = array[i - 1].cssRules[0].cssRules[0].selectorText
      const currentSelector = array[i].cssRules[0].cssRules[0].selectorText
      let pos
      if (cls) {
        pos = this.getClassInsertSheetInnerPosition(previousSelector, currentSelector, cls, i)
      } else if (ref) {
        pos = this.getRefInsertSheetInnerPosition(previousSelector, currentSelector, ref, i)
      }
      if (pos) return pos
    }
  },

  getClassInsertSheetInnerPosition (previousSelector, currentSelector, cls, pos) {
    const isPrevious = HelperStyle.selectorHasClass(previousSelector, cls)
    const isCurrent = HelperStyle.selectorHasClass(currentSelector, cls)
    const isClass = HelperStyle.isClassSelector(currentSelector)
    if ((isPrevious && !isCurrent) || !isClass) {
      // if we are at the end of our class selectors, or we are entering the ref selectors
      return pos
    }
  },

  getRefInsertSheetInnerPosition (previousSelector, currentSelector, ref, pos) {
    const isPrevious = HelperStyle.selectorHasRef(previousSelector, ref)
    const isCurrent = HelperStyle.selectorHasRef(currentSelector, ref)
    if (isPrevious && !isCurrent) {
      // if we are at the end of our ref selectors
      return pos
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
    const style = this.getSelectorStyle(selector, false)
    HelperLocalStore.setItem('selector-' + selector, style)
  },

  getCurrentStyleObject () {
    const selector = StyleSheetSelector.getCurrentSelector()
    const style = this.getSelectorStyle(selector)
    return this.convertStyleArrayToObject(style)
  },

  getSelectorStyle (selector, checkResponsive = true) {
    const sheet = this.getCreateSelectorSheet(selector)
    return this.extractStyleFromRules(sheet.cssRules, checkResponsive)
  },

  getCreateSelectorSheet (selector) {
    let sheet = StyleSheetCommon.getSelectorSheet(selector)
    if (!sheet) sheet = this.createMissingSheet(selector)
    return sheet
  },

  createMissingSheet (selector) {
    // the selector can have the responsive class in front
    if (/\.e0([a-z0-9]*)$/g.test(selector)) {
      // init the default element sheet
      this.initElementStyle(StateSelectedElement.getStyleRef(), false)
    } else {
      // create the selector sheet
      this.addSelector(selector, [{}])
    }
    return StyleSheetCommon.getSelectorSheet(selector)
  },

  extractStyleFromRules (rules, checkResponsive) {
    const style = []
    const responsive = checkResponsive ? HelperCanvas.getCurrentResponsiveWidth() : null
    for (const rule of rules) {
      if (checkResponsive &&
        !StyleSheetCommon.equalResponsiveRules(rule.cssRules[0], responsive)) {
        continue
      }
      const data = this.getRuleStyle(rule.cssRules[0])
      if (data) style.push(data)
    }
    return style
  },

  getRuleStyle (rule) {
    const responsive = HelperStyle.getSelectorResponsive(rule.selectorText)
    if (!responsive && !rule.style.length) return null
    const name = StyleSheetCommon.getProperty(rule)
    const value = StyleSheetCommon.getValue(rule, name)
    if (!name || !value) return
    return { responsive, name, value }
  },

  getSelectorStyleProperties (selector, checkResponsive = true) {
    const style = this.getSelectorStyle(selector, checkResponsive)
    const properties = {}
    for (const rule of style) {
      properties[rule.name] = rule.value
    }
    return properties
  }
}

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

  initElementStyle (ref) {
    const selector = HelperStyle.buildRefSelector(ref)
    return this.addSelector(selector, [{ name: '', value: '' }])
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
    const ref = HelperStyle.extractRefFromSelector(selector)
    const cls = HelperStyle.extractClassSelector(selector)
    const foundPos = this.getInsertSheetInnerPosition(array, ref, cls)
    return foundPos || this.getLastRefPosition(array, ref)
  },

  getInsertSheetInnerPosition (array, ref, cls) {
    for (let i = 1; i < array.length; i++) {
      const previousSelector = array[i - 1].cssRules[0].cssRules[0].selectorText
      const currentSelector = array[i].cssRules[0].cssRules[0].selectorText
      let foundPos
      if (cls) {
        foundPos = this.getClassInsertSheetInnerPos(previousSelector, currentSelector, cls, i)
      } else if (ref) {
        foundPos = this.getRefInsertSheetInnerPos(previousSelector, currentSelector, ref, i)
      }
      if (foundPos) return foundPos
    }
  },

  getClassInsertSheetInnerPos (previousSelector, currentSelector, cls, pos) {
    const isPrevious = HelperStyle.selectorHasClass(previousSelector, cls)
    const isCurrent = HelperStyle.selectorHasClass(currentSelector, cls)
    const isClass = HelperStyle.isClassSelector(currentSelector)
    if ((isPrevious && !isCurrent) || !isClass) {
      // if we are at the end of our class selectors, or we are entering the ref selectors
      return pos
    }
  },

  getRefInsertSheetInnerPos (previousSelector, currentSelector, ref, pos) {
    const isPrevious = HelperStyle.selectorHasRef(previousSelector, ref)
    const isCurrent = HelperStyle.selectorHasRef(currentSelector, ref)
    if (isPrevious && !isCurrent) {
      // if we are at the end of our ref selectors
      return pos
    }
  },

  // only if we are inside a page and this is a component ref, then we need the position right
  // before the e000body element, otherwise we just return the last position of the array
  getLastRefPosition (array, ref) {
    const element = HelperElement.getElement(ref)
    if (HelperFile.isPageFile() && HelperComponent.belongsToAComponent(element)) {
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
    const style = this.getSelectorStyle(selector, false)
    HelperLocalStore.setItem('selector-' + selector, style)
  },

  getCurrentStyleObject (selector = null) {
    if (!selector) selector = StyleSheetSelector.getCurrentSelector()
    const style = this.getSelectorStyle(selector)
    return this.convertStyleArrayToObject(style)
  },

  getSelectorStyle (selector, checkResponsive = true) {
    const sheet = this.getCreateSelectorSheet(selector)
    return this.extractStyleFromRules(sheet.cssRules, checkResponsive)
  },

  getCreateSelectorSheet (selector) {
    let sheet = StyleSheetCommon.getSelectorSheet(selector)
    if (!sheet) sheet = this.addSelector(selector, [{ name: '', value: '' }])
    return sheet
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

  convertStyleArrayToObject (array) {
    const object = {}
    for (const prop of array) {
      object[prop.name] = prop.value
    }
    return object
  }
}

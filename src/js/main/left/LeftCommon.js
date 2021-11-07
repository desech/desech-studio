import HelperDOM from '../../helper/HelperDOM.js'
import HelperLocalStore from '../../helper/HelperLocalStore.js'

export default {
  removeEmptyPrompt (list) {
    const container = list.closest('.panel-list-items')
    HelperDOM.hide(container.previousElementSibling)
    HelperDOM.show(container)
  },

  finishPanelLoad (container, type) {
    this.fixListWidth(container)
    const li = container.querySelector('.panel-file-item.loaded, .panel-element-item.active')
    this.selectItem(li)
  },

  fixListWidth (container) {
    const list = container.getElementsByClassName('panel-list-container')[0]
    if (list && list.scrollWidth) {
      list.style.width = `${list.scrollWidth}px`
    }
  },

  injectIndentTree (li, level) {
    const tree = li.getElementsByClassName('list-item-tree')[0]
    tree.style.width = `${level * 10}px`
    const gradient = this.getIndentTreeGradient(level)
    tree.style.backgroundImage = `linear-gradient(to right, ${gradient})`
  },

  getIndentTreeGradient (level) {
    let val = 'transparent 0px'
    for (let i = 1; i <= level; i++) {
      val += `, transparent ${i * 10 - 2}px, var(--list-tree) ${i * 10 - 1}px, ` +
        `transparent ${i * 10}px`
    }
    return val
  },

  collapseExpandItem (button) {
    if (!HelperDOM.isVisible(button)) return
    if (button.classList.contains('opened')) {
      this.collapseItem(button)
    } else {
      this.expandItem(button)
    }
  },

  collapseItem (button) {
    button.classList.remove('opened')
    button.dataset.tooltip = button.dataset.tooltipExpand
    const li = button.closest('li')
    const state = HelperLocalStore.getItem(`panel-${button.dataset.type}-expand`) || []
    this.collapseChildren(li, state)
    this.setExpandState(li.dataset.ref, button.dataset.type, 'remove')
  },

  expandItem (button, save = true) {
    button.classList.add('opened')
    button.dataset.tooltip = button.dataset.tooltipCollapse
    const li = button.closest('li')
    const state = HelperLocalStore.getItem(`panel-${button.dataset.type}-expand`) || []
    this.expandChildren(li, state)
    if (save) this.setExpandState(li.dataset.ref, button.dataset.type, 'add')
  },

  collapseChildren (parent, state) {
    let item = parent.nextElementSibling
    while (item) {
      if (this.getLevel(item) <= this.getLevel(parent)) break
      HelperDOM.hide(item)
      item = item.nextElementSibling
    }
  },

  expandChildren (parent, state) {
    let item = parent.nextElementSibling
    while (item) {
      if (this.getLevel(item) <= this.getLevel(parent)) break
      if (this.getLevel(item) !== this.getLevel(parent) + 1) {
        item = item.nextElementSibling
        continue
      }
      HelperDOM.show(item)
      if (state.includes(item.dataset.ref)) {
        this.expandChildren(item, state)
      }
      item = item.nextElementSibling
    }
  },

  forceExpandItem (item) {
    const button = item.getElementsByClassName('panel-item-expand-button')[0]
    if (!button || button.classList.contains('opened')) return
    this.expandItem(button)
  },

  getLevel (item) {
    return parseInt(item.dataset.level)
  },

  setExpandState (ref, type, action) {
    const state = this.setExpandStateByAction(ref, type, action).sort()
    HelperLocalStore.setItem(`panel-${type}-expand`, state)
  },

  setExpandStateByAction (ref, type, action) {
    const state = HelperLocalStore.getItem(`panel-${type}-expand`) || []
    if (action === 'add') {
      if (!state.includes(ref)) state.push(ref)
      return state
    } else { // remove
      return state.filter(item => item !== ref)
    }
  },

  setItemCollapse (li, data, level) {
    li.dataset.level = level
    // collapse all children by default
    if (level > 0) HelperDOM.hide(li)
    if (!data.children.length) return
    const button = li.getElementsByClassName('panel-item-expand-button')[0]
    HelperDOM.show(button)
  },

  expandStateItems (container, type) {
    const state = HelperLocalStore.getItem(`panel-${type}-expand`) || []
    if (!state.length) return
    const list = container.getElementsByClassName('panel-list-container')[0]
    for (const li of list.children) {
      this.expandStateItem(li, state)
    }
  },

  expandStateItem (li, state) {
    if (!HelperDOM.isVisible(li) || !state.includes(li.dataset.ref)) return
    const button = li.getElementsByClassName('panel-item-expand-button')[0]
    this.expandItem(button, false)
  },

  getSearchItem (input, cycleType = null) {
    const q = `li[data-search*="${CSS.escape(input.value)}"]`
    const results = input.closest('.panel-list-items').querySelectorAll(q)
    if (!results.length) return null
    if (cycleType) return this.getCycledSearchItem(results, cycleType)
    return results[0]
  },

  getCycledSearchItem (results, cycleType) {
    for (let i = 0; i < results.length; i++) {
      if (results[i].classList.contains('active')) {
        return this.getCycledSearchItemElement(results, i, cycleType)
      }
    }
    return results[0]
  },

  getCycledSearchItemElement (results, i, cycleType) {
    if (cycleType === 'next') {
      return (i + 1 < results.length) ? results[i + 1] : results[0]
    } else { // previous
      return (i - 1 >= 0) ? results[i - 1] : results[results.length - 1]
    }
  },

  selectItemByRef (ref, cls = 'active') {
    const item = document.querySelector(`.panel-item[data-ref="${ref}"]`)
    this.selectItem(item, cls)
  },

  selectItem (li, cls = 'active') {
    if (!li) return
    if (!li.classList.contains(cls)) {
      this.deselectItem(cls)
      li.classList.add(cls)
    }
    if (!HelperDOM.isVisible(li)) this.expandParents(li)
    if (!HelperDOM.isInView(li.offsetLeft, li.offsetTop, li.closest('.panel-list-box'))) {
      li.scrollIntoView({ block: 'center' })
    }
  },

  deselectItem (cls = 'active') {
    const active = document.querySelector(`.panel-item.${cls}`)
    if (active) active.classList.remove(cls)
  },

  expandParents (item) {
    const level = parseInt(item.dataset.level) - 1
    let parent = item.previousElementSibling
    while (parent) {
      if (parseInt(parent.dataset.level) === level) {
        if (this.expandParentTriggerButton(parent)) return
        return this.expandParents(parent)
      }
      parent = parent.previousElementSibling
    }
  },

  expandParentTriggerButton (parent) {
    const button = parent.getElementsByClassName('panel-item-expand-button')[0]
    if (HelperDOM.isVisible(parent)) {
      // if the parent is visible then we need to stop
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      return true
    } else if (!button.classList.contains('opened')) {
      // we found a hidden button that needs expanding too
      button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    }
  },

  startSortItem (item) {
    this.deselectItem()
    const button = item.getElementsByClassName('panel-item-expand-button')[0]
    if (button.classList.contains('opened')) this.collapseItem(button)
  }
}

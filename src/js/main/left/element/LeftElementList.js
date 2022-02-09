import HelperElement from '../../../helper/HelperElement.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import HelperEvent from '../../../helper/HelperEvent.js'
import LeftCommon from '../LeftCommon.js'
import StateSelectedElement from '../../../state/StateSelectedElement.js'

export default {
  getEvents () {
    return {
      input: ['inputSearchEvent'],
      keydown: ['keydownCycleNextSearchEvent', 'keydownCyclePreviousSearchEvent']
    }
  },

  inputSearchEvent (event) {
    if (event.target.classList.contains('panel-element-search')) {
      this.searchList(event.target)
    }
  },

  keydownCycleNextSearchEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'F3') {
      this.cycleSearch('next')
    }
  },

  keydownCyclePreviousSearchEvent (event) {
    if (event.key && HelperEvent.isNotCtrlAltShift(event) && event.key === 'F2') {
      this.cycleSearch('previous')
    }
  },

  searchList (input) {
    const cycle = input.previousElementSibling
    if (input.value.length >= 2) {
      this.searchSelectItem(input, cycle)
    } else { // < 2
      this.clearSearchSelectItem(cycle)
    }
  },

  searchSelectItem (input, cycle) {
    const li = LeftCommon.getSearchItem(input)
    if (li) {
      this.showSearchSelectItem(li, cycle)
    } else {
      this.clearSearchSelectItem(cycle)
    }
  },

  showSearchSelectItem (li, cycle) {
    HelperDOM.show(cycle)
    const element = HelperElement.getElement(li.dataset.ref)
    StateSelectedElement.selectElement(element)
  },

  clearSearchSelectItem (cycle) {
    HelperDOM.hide(cycle)
    StateSelectedElement.deselectElement()
  },

  cycleSearch (cycleType) {
    const cycle = document.getElementsByClassName('panel-search-cycle-element')[0]
    if (!cycle || HelperDOM.isHidden(cycle)) return
    const input = cycle.nextElementSibling
    const li = LeftCommon.getSearchItem(input, cycleType)
    if (li) this.showSearchSelectItem(li, cycle)
  }
}

import HelperEvent from '../../../helper/HelperEvent.js'
import LeftCommon from '../LeftCommon.js'
import HelperDOM from '../../../helper/HelperDOM.js'
import StateSelectedVariable from '../../../state/StateSelectedVariable.js'
import RightVariableMain from '../../right/section/variable/RightVariableMain.js'

export default {
  getEvents () {
    return {
      input: ['inputSearchEvent'],
      keydown: ['keydownCycleNextSearchEvent', 'keydownCyclePreviousSearchEvent'],
      click: ['clickCreateVariablePromptEvent']
    }
  },

  inputSearchEvent (event) {
    if (event.target.classList.contains('panel-variable-search')) {
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

  clickCreateVariablePromptEvent (event) {
    if (event.target.closest('.panel-variable-create')) {
      RightVariableMain.showCreateDialog()
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
    StateSelectedVariable.selectVariable(li.dataset.ref)
  },

  clearSearchSelectItem (cycle) {
    HelperDOM.hide(cycle)
    StateSelectedVariable.deselectVariable()
  },

  cycleSearch (cycleType) {
    const cycle = document.getElementsByClassName('panel-search-cycle-variable')[0]
    if (!cycle || HelperDOM.isHidden(cycle)) return
    const input = cycle.nextElementSibling
    const li = LeftCommon.getSearchItem(input, cycleType)
    if (li) this.showSearchSelectItem(li, cycle)
  }
}

import LeftVariableCommon from './LeftVariableCommon.js'
import LeftCommon from '../LeftCommon.js'

export default {
  async buildList (container, type, list, options) {
    const items = LeftVariableCommon.getVariables()
    if (items.length) LeftCommon.removeEmptyPrompt(list)
    this.injectItems(items, list)
    LeftCommon.finishPanelLoad(container, type)
  },

  injectItems (items, list) {
    console.log(items)
  }
}

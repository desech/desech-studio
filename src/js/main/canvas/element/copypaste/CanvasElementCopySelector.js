import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import StyleSheetCommon from '../../../../state/stylesheet/StyleSheetCommon.js'
import HelperClipboard from '../../../../helper/HelperClipboard.js'
import StateCommand from '../../../../state/StateCommand.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'

export default {
  async copySelector () {
    const value = StyleSheetSelector.getCurrentSelector()
    if (!value) return
    // we need to copy the entire style sheet including the responsive rules
    const style = StyleSheetCommon.getSelectorStyle(value, false)
    const selector = { value, style }
    await HelperClipboard.saveData({ selector })
    return selector
  },

  async cutSelector () {
    const selector = await this.copySelector()
    if (!selector || !selector.style?.length) return
    await this.executeCutSelector(selector.value, selector.style)
  },

  async pasteSelector () {
    const ref = StateSelectedElement.getRef()
    // we can only paste inside elements
    if (!ref) return
    const data = await HelperClipboard.getData()
    if (!data?.selector?.style?.length) return
    await this.executePasteSelector(data.selector.style)
  },

  async executeCutSelector (selector, style, execute = true) {
    const command = {
      do: {
        command: 'cutSelectorStyle',
        selector,
        style: null
      },
      undo: {
        command: 'cutSelectorStyle',
        selector,
        style
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  },

  async executePasteSelector (newStyle, execute = true) {
    const selector = StyleSheetSelector.getCurrentSelector()
    const oldStyle = StyleSheetCommon.getSelectorStyle(selector, false)
    const command = {
      do: {
        command: 'pasteSelectorStyle',
        selector,
        style: newStyle
      },
      undo: {
        command: 'pasteSelectorStyle',
        selector,
        style: oldStyle
      }
    }
    StateCommand.stackCommand(command)
    if (execute) await StateCommand.executeCommand(command.do)
  }
}

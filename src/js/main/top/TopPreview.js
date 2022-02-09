import HelperEvent from '../../helper/HelperEvent.js'
import HelperCanvas from '../../helper/HelperCanvas.js'
import TopCommon from './TopCommon.js'
import HelperFile from '../../helper/HelperFile.js'
import Page from '../../page/Page.js'

export default {
  getEvents () {
    return {
      click: ['clickSwitchPreviewEvent', 'clickOpenLinkEvent'],
      keydown: ['keydownSwitchPreviewEvent']
    }
  },

  clickSwitchPreviewEvent (event) {
    if (event.target.closest('.top-preview-button')) {
      TopCommon.switchPreview()
    }
  },

  async clickOpenLinkEvent (event) {
    if (HelperCanvas.isPreview() && event.target.closest('#canvas a')) {
      await this.openHtmlFile(event.target.closest('a'))
    }
  },

  keydownSwitchPreviewEvent (event) {
    if (event.key && HelperEvent.areMainShortcutsAllowed(event) &&
      HelperEvent.isNotCtrlAltShift(event) && event.key.toLowerCase() === 'p') {
      TopCommon.switchPreview()
    }
  },

  async openHtmlFile (anchor) {
    let href = anchor.getAttributeNS(null, 'href')
    if (!href || href === '/') href = 'index.html'
    if (!this.isPathRelative(href)) return
    const file = HelperFile.getAbsPath(href)
    await Page.loadFile(file)
  },

  isPathRelative (path) {
    return (!path.startsWith('http') && !path.startsWith('tel:') && !path.startsWith('mailto:') &&
      !path.startsWith('#'))
  }
}

import HelperProject from '../../helper/HelperProject.js'
import HelperCanvas from '../../helper/HelperCanvas.js'

export default {
  insertResponsive (data) {
    const settings = HelperProject.getProjectSettings()
    this.applyAddSettings(settings, data)
    this.changeResponsive(settings)
  },

  applyAddSettings (settings, data) {
    settings.responsive.list.push({
      ...data,
      width: HelperCanvas.getCanvasWidth(),
      height: HelperCanvas.getCanvasHeight()
    })
  },

  changeResponsive (settings) {
    HelperProject.setProjectSettings(settings)
    const folder = HelperProject.getFolder()
    // this is async, but we don't need to wait
    window.electron.invoke('rendererSaveProjectSettings', folder, settings)
  },

  deleteResponsive (data) {
    const settings = HelperProject.getProjectSettings()
    this.applyRemoveSettings(settings, data)
    this.changeResponsive(settings)
  },

  applyRemoveSettings (settings, data) {
    for (let i = 0; i < settings.responsive.list.length; i++) {
      const val = settings.responsive.list[i]
      if (val['min-width'] === data['min-width'] && val['max-width'] === data['max-width']) {
        settings.responsive.list.splice(i, 1)
        break
      }
    }
  },

  editResponsive (current, previous) {
    const settings = HelperProject.getProjectSettings()
    this.applyChangeSettings(settings, current, previous)
    this.changeResponsive(settings)
  },

  applyChangeSettings (settings, current, previous) {
    if (current['min-width'] || current['max-width']) {
      this.applyResponsiveChanges(settings.responsive, current, previous)
    } else if (current.width && current.height) {
      this.applyCanvasChanges(settings.responsive, current)
    }
  },

  applyResponsiveChanges (responsive, current, previous) {
    for (let i = 0; i < responsive.list.length; i++) {
      const val = responsive.list[i]
      if (val['min-width'] === previous['min-width'] &&
        val['max-width'] === previous['max-width']) {
        for (const name of ['min-width', 'max-width', 'width', 'height']) {
          if (current[name]) val[name] = current[name]
        }
        break
      }
    }
  },

  applyCanvasChanges (responsive, current) {
    responsive.default.width = current.width
    responsive.default.height = current.height
  }
}

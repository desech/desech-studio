import HelperEvent from '../helper/HelperEvent.js'
import HelperRegex from '../helper/HelperRegex.js'
import DialogComponent from '../component/DialogComponent.js'
import HelperDOM from '../helper/HelperDOM.js'
import Project from './Project.js'
import Import from './Import.js'

export default {
  getEvents () {
    return {
      click: ['clickNewSampleProjectEvent', 'clickNewProjectEvent',
        'clickNewProjectSubmitEvent', 'clickSaveProjectSettingsEvent', 'clickOpenProjectEvent',
        'clickImportFilePromptEvent', 'clickImportFigmaEvent', 'clickFinishImportEvent',
        'clickContinueFigmaAuthEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickNewSampleProjectEvent (event) {
    if (event.target.closest('.start-new-sample-project')) {
      await window.electron.invoke('rendererNewSampleProject')
    }
  },

  async clickNewProjectEvent (event) {
    if (event.target.closest('.start-new-project')) {
      Project.newProject()
    }
  },

  async clickNewProjectSubmitEvent (event) {
    if (event.target.closest('.start-new-project-submit')) {
      await Project.newProjectSubmit(event.target.closest('form'))
    }
  },

  async clickSaveProjectSettingsEvent (event) {
    if (event.target.closest('.save-project-settings')) {
      await Project.saveProjectSettings(event.target.closest('form'))
    }
  },

  async clickOpenProjectEvent (event) {
    if (event.target.closest('.start-open-folder')) {
      await window.electron.invoke('rendererInitProject', { action: 'open' })
    }
  },

  async clickImportFilePromptEvent (event) {
    if (event.target.closest('.start-import-file')) {
      await this.importFilePrompt(event.target.closest('.start-import-file').dataset.type)
    }
  },

  async clickImportFigmaEvent (event) {
    if (event.target.closest('.figma-import-file')) {
      await this.importFigma(event.target.closest('.dialog-import-figma'))
    }
  },

  async clickFinishImportEvent (event) {
    if (event.target.closest('.dialog-import-finished')) {
      await this.finishImport(event.target.closest('.dialog-import-finished'))
    }
  },

  async clickContinueFigmaAuthEvent (event) {
    if (event.target.classList.contains('dialog-figma-continue')) {
      await this.continueFigma(event.target)
    }
  },

  async importFilePrompt (type) {
    DialogComponent.closeAllDialogs()
    if (type === 'figma') {
      this.showImportDialog(type)
      this.showFigmaContinue(type)
    }
    await window.electron.invoke('rendererImportFile', type)
  },

  showImportDialog (type) {
    return DialogComponent.showDialog({
      header: Import.getImportTitle(type),
      body: DialogComponent.getContentHtml('import', 'body')
    })
  },

  showFigmaContinue (type) {
    const button = document.getElementsByClassName('dialog-figma-continue')[0]
    HelperDOM.show(button)
  },

  switchImportToFigma (token) {
    const container = document.querySelector('.dialog .dialog-import')
    const figmaContainer = container.getElementsByClassName('dialog-import-figma')[0]
    figmaContainer.dataset.token = token
    HelperDOM.hide(container.children)
    HelperDOM.show(figmaContainer)
    container.getElementsByClassName('figma-input')[0].focus()
    const title = document.getElementsByClassName('dialog-title')[0].textContent
    figmaContainer.getElementsByClassName('figma-import-file')[0].textContent = title
  },

  async importFigma (container) {
    const token = container.dataset.token
    const input = container.getElementsByClassName('figma-input')[0]
    const file = this.getFigmaInputFile(input.value)
    const valid = this.validateFigmaFile(input, file)
    if (!valid) return
    Project.newProject({ type: 'figma', file, token })
  },

  getFigmaInputFile (value) {
    if (!value) return
    const match = HelperRegex.getMatchingGroups(value, /file\/(?<file>[^/]*)/gi)
    return (match && match[0] && match[0].file) ? match[0].file : ''
  },

  validateFigmaFile (input, file) {
    if (!file) {
      input.setCustomValidity(input.dataset.error)
      input.reportValidity()
      return false
    } else {
      input.setCustomValidity('')
      return true
    }
  },

  async continueFigma (button) {
    button.setAttributeNS(null, 'disabled', '')
    setTimeout(() => {
      button.removeAttributeNS(null, 'disabled')
    }, 2000)
    await window.electron.invoke('rendererFetchFigma')
  },

  async finishImport (button) {
    await window.electron.invoke('rendererInitProject', {
      action: 'import-finish',
      folder: button.dataset.folder
    })
  }
}

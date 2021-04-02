import HelperEvent from '../helper/HelperEvent.js'
import HelperRegex from '../helper/HelperRegex.js'
import DialogComponent from '../component/DialogComponent.js'
import HelperDOM from '../helper/HelperDOM.js'
import HelperSettings from '../helper/HelperSettings.js'
import Project from './Project.js'

export default {
  getEvents () {
    return {
      click: ['clickPremiumButton', 'clickNewTutorialProjectEvent', 'clickNewProjectEvent',
        'clickNewProjectSubmitEvent', 'clickSaveProjectSettingsEvent', 'clickOpenProjectEvent',
        'clickImportFilePromptEvent', 'clickImportFileEvent', 'clickImportFigmaEvent',
        'clickFinishImportEvent', 'clickContinueFigmaAuthEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  async clickPremiumButton (event) {
    if (event.target.classList.contains('premium-prompt-button')) {
      await this.pressPremiumButton(event.target)
    }
  },

  async clickNewTutorialProjectEvent (event) {
    if (event.target.closest('.start-new-tutorial-project')) {
      await window.electron.invoke('rendererNewTutorialProject')
    }
  },

  async clickNewProjectEvent (event) {
    if (event.target.closest('.start-new-project')) {
      await window.electron.invoke('rendererNewProject')
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
      await this.triggerOpenProject()
    }
  },

  clickImportFilePromptEvent (event) {
    if (event.target.closest('.start-import-file')) {
      this.importFilePrompt(event.target.closest('.start-import-file').dataset.type)
    }
  },

  async clickImportFileEvent (event) {
    if (event.target.closest('.dialog-import-file')) {
      await this.importFile(event.target.closest('.dialog-import-file'))
    }
  },

  async clickImportFigmaEvent (event) {
    if (event.target.closest('.figma-import-file')) {
      await this.importFigma(event.target.closest('.dialog-figma-import'))
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

  async pressPremiumButton (button) {
    if (button.dataset.type === 'yes') {
      await window.electron.invoke('rendererPurchasePremium')
    }
    window.close()
  },

  async triggerOpenProject (folder = null) {
    await window.electron.invoke('rendererOpenProject', HelperSettings.getLang(), null, folder)
  },

  importFilePrompt (type) {
    const query = `.start-import-file[data-type="${CSS.escape(type)}"] .start-import-title`
    const header = document.querySelector(query).textContent
    const dialog = DialogComponent.showDialog({
      header,
      body: DialogComponent.getContentHtml('import', 'body')
    })
    this.setImportButtonType(dialog, type)
  },

  setImportButtonType (dialog, type) {
    const button = dialog.getElementsByClassName('dialog-import-file')[0]
    button.dataset.type = type
  },

  async importFile (button) {
    this.switchImportToLoading(button.closest('.dialog-import'), button.dataset.type)
    await window.electron.invoke('rendererImportFile', button.dataset.type)
  },

  switchImportToLoading (container, type) {
    HelperDOM.hide(container.children)
    // show the loading section
    HelperDOM.show(container.children[1])
    if (type === 'figma') this.showFigmaLoader(container.children[1])
  },

  showFigmaLoader (container) {
    const button = container.getElementsByClassName('dialog-figma-continue')[0]
    HelperDOM.show(button)
  },

  switchImportToFigma (token) {
    const container = document.querySelector('dialog.dialog .dialog-import')
    const figmaContainer = container.children[2]
    figmaContainer.dataset.token = token
    // hide the prompt
    HelperDOM.hide(container.children)
    HelperDOM.show(figmaContainer)
    container.getElementsByClassName('figma-input')[0].focus()
  },

  async finishImport (button) {
    await this.triggerOpenProject(button.dataset.folder)
  },

  async importFigma (container) {
    const token = container.dataset.token
    const input = container.getElementsByClassName('figma-input')[0]
    const file = this.getFigmaInputFile(input.value)
    const valid = this.validateFigmaFile(input, file)
    if (!valid) return
    this.switchImportToLoading(input.closest('.dialog-import'))
    await window.electron.invoke('rendererImportFigmaFile', file, token,
      HelperSettings.getLang())
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
  }
}

import HelperDOM from '../../../../helper/HelperDOM.js'
import HelperForm from '../../../../helper/HelperForm.js'
import HelperStyle from '../../../../helper/HelperStyle.js'
import StateCommand from '../../../../state/StateCommand.js'
import StateSelectedElement from '../../../../state/StateSelectedElement.js'
import HelperEvent from '../../../../helper/HelperEvent.js'
import RightSelectorCommon from './RightSelectorCommon.js'
import HelperTrigger from '../../../../helper/HelperTrigger.js'
import StyleSheetSelector from '../../../../state/stylesheet/StyleSheetSelector.js'
import HelperDesignSystem from '../../../../helper/HelperDesignSystem.js'
import DialogComponent from '../../../../component/DialogComponent.js'
import HelperError from '../../../../helper/HelperError.js'

export default {
  getEvents () {
    return {
      click: ['clickCreateSelectorEvent', 'clickAddStructureEvent', 'clickConfirmStructureEvent',
        'clickSaveSelectorEvent'],
      change: ['changePseudoClassEvent']
    }
  },

  handleEvent (event) {
    HelperEvent.handleEvents(this, event)
  },

  clickCreateSelectorEvent (event) {
    if (event.target.closest('.add-selector-button')) {
      this.createSelector(event.target.closest('.sidebar-section'))
    }
  },

  clickAddStructureEvent (event) {
    if (event.target.classList.contains('dialog-selector-add-button')) {
      this.addStructure(event.target.closest('.dialog-body'), event.target.dataset.type)
    }
  },

  clickConfirmStructureEvent (event) {
    if (event.target.classList.contains('dialog-selector-confirm-button')) {
      this.confirmStructure(event.target.closest('form'))
    }
  },

  clickSaveSelectorEvent (event) {
    if (event.target.classList.contains('dialog-selector-save-button')) {
      this.saveSelector(event.target.closest('.dialog'))
    }
  },

  changePseudoClassEvent (event) {
    if (event.target.classList.contains('pseudo-class-dropdown')) {
      this.togglePseudoClass(event.target)
    }
  },

  createSelector (section) {
    DialogComponent.showDialog({
      header: DialogComponent.getContentHtml('selector-add', 'header'),
      body: DialogComponent.getContentHtml('selector-add', 'body'),
      footer: DialogComponent.getContentHtml('selector-add', 'footer')
    })
  },

  addStructure (container, type) {
    const form = container.getElementsByClassName('dialog-selector-add-form')[0]
    HelperDOM.show(form)
    const details = form.getElementsByClassName('dialog-selector-add-details')[0]
    const fields = HelperDOM.getTemplate(`template-dialog-selector-add-${type}`)
    HelperDOM.replaceOnlyChild(details, fields)
    if (type === 'component') this.generateComponentDatalist(form)
  },

  generateComponentDatalist (form) {
    const datalist = form.getElementsByClassName('selector-components-datalist')[0]
    const projectClasses = StyleSheetSelector.getSelectorClasses()
    const designSystemClasses = HelperDesignSystem.getDesignSystemClasses() || []
    this.addComponentsToList(datalist, [...projectClasses, ...designSystemClasses])
  },

  addComponentsToList (datalist, classes) {
    for (const name of classes) {
      const option = document.createElement('option')
      option.value = option.textContent = HelperStyle.getViewableClass(name)
      datalist.appendChild(option)
    }
  },

  togglePseudoClass (select) {
    const show = select.selectedOptions[0].dataset.input || 0
    HelperDOM.toggle(select.nextElementSibling, show)
  },

  confirmStructure (form) {
    const data = HelperForm.getFormValues(form)
    if (HelperForm.validateForm(form, data) && this.validateComponent(form, data)) {
      this.confirmAddStructure(form, data)
    }
  },

  validateComponent (form, data) {
    const special = ['block', 'text', 'component', 'component-child']
    if (!data.component || !special.includes(data.component)) {
      return true
    }
    form.elements.component.setCustomValidity(form.dataset.error)
    return false
  },

  confirmAddStructure (form, data) {
    HelperDOM.hide(form)
    const preview = form.closest('.dialog-body')
      .getElementsByClassName('dialog-selector-add-preview')[0]
    this.initSelector(preview, data)
    preview.dataset.selector += this.getStructureCss(data)
    preview.textContent = preview.dataset.selector.replaceAll('_ss_', '')
    form.closest('dialog').getElementsByClassName('dialog-selector-save-button')[0]
      .removeAttributeNS(null, 'disabled')
  },

  initSelector (preview, data) {
    if (!preview.dataset.selector && !data.component) {
      const ref = StateSelectedElement.getRef()
      preview.dataset.selector = HelperStyle.buildRefSelector(ref)
    }
  },

  getStructureCss (data) {
    if (data.component) {
      return HelperStyle.buildClassSelector(data.component)
    } else if (data.pseudo_class) {
      return (data.combinator || '') +
        data.pseudo_class.replace('()', `(${data.pseudo_class_value})`)
    } else if (data.pseudo_element) {
      return data.pseudo_element
    } else if (data.child) {
      return (data.combinator || '') + data.child
    } else if (data.attr_name) {
      const value = data.attr_value ? `${data.attr_sign}"${data.attr_value}"` : ''
      return `[${data.attr_name}${value}]`
    } else if (data.combinator) {
      return data.combinator
    } else if (data.custom) {
      return data.custom
    }
  },

  saveSelector (dialog) {
    const preview = dialog.getElementsByClassName('dialog-selector-add-preview')[0]
    const selector = preview.dataset.selector
    try {
      document.querySelector(selector)
      this.saveSelectorSuccess(selector)
      this.reloadSuccess()
    } catch (error) {
      HelperError.error(error, new Error(preview.dataset.error))
    }
  },

  saveSelectorSuccess (selector) {
    if (StyleSheetSelector.selectorExists(selector)) {
      RightSelectorCommon.linkClass(selector)
    } else {
      this.callCreateCommand(selector)
      RightSelectorCommon.reloadSection(selector)
    }
  },

  callCreateCommand (selector) {
    const command = {
      do: {
        command: 'addSelector',
        selector
      },
      undo: {
        command: 'removeSelector',
        selector,
        ref: StateSelectedElement.getRef()
      }
    }
    StateCommand.stackCommand(command)
    StateCommand.executeCommand(command.do)
  },

  reloadSuccess () {
    HelperTrigger.triggerReload('element-overlay', { panelReload: false })
    HelperTrigger.triggerReload('sidebar-left-panel', { panel: 'element' })
    DialogComponent.closeAllDialogs()
  }
}

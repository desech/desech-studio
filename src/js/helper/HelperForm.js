import HelperDOM from './HelperDOM.js'

export default {
  getFormValues (form, fieldClasses = null) {
    const data = {}
    const fields = this.getFormElements(form, fieldClasses)
    for (const [name, field] of Object.entries(fields)) {
      data[name] = this.getFieldValue(field)
    }
    return data
  },

  getFormElements (form, fieldClasses = null) {
    const fields = {}
    for (const field of form.elements) {
      if (!field.name || !HelperDOM.isVisible(field, true)) continue
      if (fieldClasses && !this.fieldContainsClass(field, fieldClasses)) continue
      this.getFormField(fields, field)
    }
    return fields
  },

  fieldContainsClass (field, allowed) {
    for (const cls of field.classList) {
      if (allowed.includes(cls)) return true
    }
    return false
  },

  getFormField (fields, field) {
    if (field.name.indexOf('[]') > 0) {
      this.getArrayFormField(fields, field)
    } else {
      fields[field.name] = field
    }
  },

  getArrayFormField (fields, field) {
    const name = field.name.replace('[]', '')
    if (fields[name]) {
      fields[name].push(field)
    } else {
      fields[name] = [field]
    }
  },

  getFieldValue (field) {
    if (Array.isArray(field)) {
      return field.map(node => node.value)
    } else {
      return field.value
    }
  },

  // @todo this is redundant; we should check form.checkValidity()
  validateForm (form, data) {
    for (const field of form.elements) {
      field.setCustomValidity('')
      if (typeof data[field.name] !== 'undefined' && !field.checkValidity()) {
        return false
      }
    }
    return true
  },

  focusFirstInput (container) {
    const input = container.getElementsByTagName('input')[0]
    if (input) input.focus()
  },

  resetValidity (form) {
    for (const field of form.elements) {
      if (!field.checkValidity()) {
        field.setCustomValidity('')
      }
    }
  }
}

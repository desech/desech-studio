import HelperDOM from './HelperDOM.js'

export default {
  getFormValues (form) {
    const data = {}
    const fields = this.getFormElements(form)
    for (const [name, field] of Object.entries(fields)) {
      data[name] = this.getFieldValue(field)
    }
    return data
  },

  getFormElements (form) {
    const fields = {}
    for (const field of form.elements) {
      if (!field.name || !HelperDOM.isVisible(field, true)) continue
      this.setFormField(fields, field)
    }
    return fields
  },

  setFormField (fields, field) {
    if (field.name.indexOf('[]') > 0) {
      this.setArrayFormField(fields, field)
    } else {
      fields[field.name] = field
    }
  },

  setArrayFormField (fields, field) {
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

  validateForm (form, data) {
    for (const field of form.elements) {
      field.setCustomValidity('')
      if (typeof data[field.name] !== 'undefined' && !field.checkValidity()) {
        return false
      }
    }
    return true
  }
}

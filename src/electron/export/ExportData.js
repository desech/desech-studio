import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'

export default {
  // this data is for figuring out how to build the react/angular/vue component render method
  // this will tell us if certain attributes need overrides, or inner content, etc
  // it also lists all variants for all components
  getAllComponentData (files, folder) {
    const data = { overrides: {}, variants: {} }
    for (const file of files) {
      const html = File.readFile(file.path)
      this.addVariants(file, folder, html, data.variants)
      this.addOverrides(html, data.overrides)
    }
    ExtendJS.clearEmptyObjects(data.overrides)
    return data
  },

  addVariants (file, folder, html, data) {
    if (!file.isComponent) return
    // we only want the component data from the root element, the first element found
    const match = /data-ss-component="(.*?)"/g.exec(html)
    if (!match) return
    const json = JSON.parse(match[1].replaceAll('&quot;', '"'))
    // main component data only has `variants`
    // instance component data has `ref`, `file`, `overrides` and `variants`
    if (json.ref) return
    const cmpFile = file.path.replace(folder, '').substring(1)
    data[cmpFile] = Object.keys(json.variants)
  },

  addOverrides (html, data) {
    for (const match of html.matchAll(/data-ss-component="(.*?)"/g)) {
      const json = JSON.parse(match[1].replaceAll('&quot;', '"'))
      this.extractRefOverrides(json, data)
    }
  },

  extractRefOverrides (json, data) {
    for (const key of Object.keys(json)) {
      if (key.startsWith('e0')) {
        this.addRefOverrides(key, json, data)
      } else if (json[key] && typeof json[key] === 'object') {
        this.extractRefOverrides(json[key], data)
      }
    }
  },

  addRefOverrides (ref, json, data) {
    const clone = ExtendJS.cloneData(json[ref])
    if (clone.children) {
      delete clone.children
      this.extractRefOverrides(json[ref], data)
    }
    if (ExtendJS.isEmpty(clone)) return
    if (!data[ref]) data[ref] = {}
    this.processRefOverrides(clone, data[ref])
  },

  processRefOverrides (cmpData, refData) {
    if (cmpData.tag) refData.tag = true
    if (cmpData.inner) refData.inner = true
    this.processUnrender(cmpData.attributes, refData)
    this.processAttributes(cmpData.attributes, refData)
    this.processAttributes(cmpData.properties, refData, 'properties')
    this.processAttributes(cmpData.classes, refData, 'classes')
    if (cmpData.component) refData.component = true
  },

  processUnrender (attributes, data) {
    if (attributes && attributes['data-ss-unrender']) {
      delete attributes['data-ss-unrender']
      data.unrender = true
    }
  },

  processAttributes (attributes, data, type = 'attributes') {
    if (ExtendJS.isEmpty(attributes)) return
    if (!data[type]) data[type] = {}
    for (const [name, value] of Object.entries(attributes)) {
      if (this.isOverridable(name)) {
        data[type][name] = this.setActionValue(value, data[type][name], type)
      }
    }
  },

  // certain properties can't be overridden
  isOverridable (name) {
    return !['reactIf', 'reactFor', 'reactIfFor', 'reactForIf'].includes(name)
  },

  // attributes: create, update, delete, update-delete
  // classes: create, delete
  setActionValue (value, current, type) {
    // for classes, we can't have both create and delete at the same time
    if (type === 'classes') return value.delete ? 'delete' : 'create'
    // we will set the value to `create` in the export plugin when we check if the attr exists
    switch (current) {
      case 'update-delete':
        return current
      case 'delete':
        return value.delete ? 'delete' : 'update-delete'
      case 'update':
        return value.delete ? 'update-delete' : 'update'
      default:
        return value.delete ? 'delete' : 'update'
    }
  }
}

import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'

export default {
  getAllComponentData (files) {
    const data = {}
    for (const file of files) {
      const html = File.readFile(file.path)
      this.extractOverrides(html, data)
    }
    return data
  },

  extractOverrides (html, data) {
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

  processRefOverrides (componentData, refData) {
    if (componentData.tag) refData.tag = true
    if (componentData.inner) refData.inner = true
    this.processUnrender(componentData.attributes, refData)
    this.processAttributes(componentData.attributes, refData)
    this.processAttributes(componentData.properties, refData, 'properties')
    this.processAttributes(componentData.classes, refData, 'classes')
    if (componentData.component) refData.component = true
    if (componentData.variants) refData.variants = true
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
      data[type][name] = this.setActionValue(value, data[type][name], type)
    }
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

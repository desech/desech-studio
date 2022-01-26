import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'

export default {
  getAllComponentData (files, folder) {
    const data = this.getEmptyData()
    for (const file of files) {
      this.getComponentDataPerFile(file, folder, data)
    }
    ExtendJS.clearEmptyObjects(data.overrides)
    return data
  },

  getEmptyData () {
    return {
      // this is used for creating the variant attributes: dVarFoo, :d-var-foo
      // {'component/foo.html': ['foo', 'bar']}
      variants: {},
      // this is used for importing default and overridden components
      // topOverrides is used by React where the component class is set on the top component
      // closeOverrides is used by Vue where the component class is set right on the closest
      // component that overrides that value
      // {'component/foo.html': ['component/bar.html', 'component/baz.html']}
      imports: {
        default: {},
        topOverrides: {},
        closeOverrides: {}
      },
      // this is used for creating the override code
      // {e0ref: {tag: true, inner: true, component: true}}
      // {e0ref: {attributes: {foo: 'update'}, properties: {}, classes: {red: 'create'}}}
      overrides: {}
    }
  },

  getComponentDataPerFile (file, folder, data) {
    const html = File.readFile(file.path)
    const currentFile = file.path.replace(folder, '').substring(1)
    for (const match of html.matchAll(/data-ss-component="(.*?)"/g)) {
      const json = JSON.parse(match[1].replaceAll('&quot;', '"'))
      this.processComponentData(currentFile, json, data)
    }
  },

  // main component data only has `variants`
  // instance component data has `ref`, `file`, `overrides` and `variants`
  processComponentData (currentFile, json, data) {
    this.addMainVariants(currentFile, json, data.variants)
    this.addDefaultImports(currentFile, json, data.imports.default)
    this.addOverrides(currentFile, json.file, json, data.overrides, data.imports)
  },

  addMainVariants (currentFile, json, data) {
    if (!json.ref && !json.file && !ExtendJS.isEmpty(json.variants)) {
      data[currentFile] = Object.keys(json.variants)
    }
  },

  addDefaultImports (currentFile, json, data) {
    if (!json.file) return
    if (!data[currentFile]) data[currentFile] = []
    if (!data[currentFile].includes(json.file)) {
      data[currentFile].push(json.file)
    }
  },

  addOverrides (currentFile, cmpFile, json, overrides, imports) {
    for (const key of Object.keys(json)) {
      if (key.startsWith('e0')) {
        this.addRefOverrides(currentFile, cmpFile, key, json, overrides, imports)
      } else if (json[key] && typeof json[key] === 'object') {
        this.addOverrides(currentFile, cmpFile, json[key], overrides, imports)
      }
    }
  },

  addRefOverrides (currentFile, cmpFile, ref, json, overrides, imports) {
    const clone = ExtendJS.cloneData(json[ref])
    if (clone.children) {
      delete clone.children
      this.addOverrides(currentFile, cmpFile, json[ref], overrides, imports)
    }
    if (ExtendJS.isEmpty(clone)) return
    if (!overrides[ref]) overrides[ref] = {}
    this.processRefOverrides(currentFile, cmpFile, clone, ref, overrides, imports)
  },

  processRefOverrides (currentFile, cmpFile, cmpData, ref, overrides, imports) {
    if (cmpData.tag) overrides[ref].tag = true
    if (cmpData.inner) overrides[ref].inner = true
    this.processUnrender(cmpData.attributes, overrides[ref])
    this.processObject(cmpData.attributes, overrides[ref], 'attributes')
    this.processObject(cmpData.properties, overrides[ref], 'properties')
    this.processObject(cmpData.classes, overrides[ref], 'classes')
    if (cmpData.component) {
      overrides[ref].component = true
      this.addOverrideImports(currentFile, cmpFile, cmpData.component, ref, imports)
    }
  },

  processUnrender (attributes, data) {
    if (attributes && attributes['data-ss-unrender']) {
      delete attributes['data-ss-unrender']
      data.unrender = true
    }
  },

  processObject (obj, data, type) {
    if (ExtendJS.isEmpty(obj)) return
    if (!data[type]) data[type] = {}
    for (const [name, value] of Object.entries(obj)) {
      if (this.isOverridable(name)) {
        data[type][name] = this.setActionValue(value, data[type][name], type)
      }
    }
  },

  // certain properties can't be overridden
  isOverridable (name) {
    return !['reactIf', 'reactFor', 'reactIfFor', 'reactForIf'].includes(name)
  },

  // attributes: update, delete, update-delete
  // classes: create, delete
  setActionValue (value, current, type) {
    if (type === 'classes') {
      return value.delete ? 'delete' : 'create'
    }
    // type = attributes, properties
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
  },

  addOverrideImports (currentFile, parentFile, cmpFile, ref, imports) {
    if (!imports.topOverrides[currentFile]) imports.topOverrides[currentFile] = []
    if (!imports.topOverrides[currentFile].includes(cmpFile)) {
      imports.topOverrides[currentFile].push(cmpFile)
    }
    if (!imports.closeOverrides[parentFile]) imports.closeOverrides[parentFile] = []
    if (!imports.closeOverrides[parentFile].includes(cmpFile)) {
      imports.closeOverrides[parentFile].push(cmpFile)
    }
  }
}

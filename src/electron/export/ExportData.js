import ExtendJS from '../../js/helper/ExtendJS.js'
import File from '../file/File.js'

export default {
  // we need these temporary values to figure out the parent of the component override
  _tmpParentImports: {},
  _tmpRefFileMap: {},

  getAllComponentData (files, folder) {
    const data = this.getEmptyData()
    for (const file of files) {
      this.getComponentDataPerFile(file, folder, data)
    }
    ExtendJS.clearEmptyObjects(data.overrides)
    this.setParentImports(data.imports.parentOverrides)
    return data
  },

  getEmptyData () {
    return {
      // this is used for creating the variant attributes: dVarFoo, :d-var-foo
      // {'component/foo.html': ['foo', 'bar']}
      variants: {},
      // this is used for importing default and overridden components
      // topOverrides is used by React where the component class is set on the top component
      // parentOverrides is used by Vue where the component class is set right on the closest
      // component that overrides that value
      // {'component/foo.html': ['component/bar.html', 'component/baz.html']}
      imports: {
        default: {},
        topOverrides: {},
        parentOverrides: {}
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
    const parentFileRef = json.file || currentFile
    this.addOverrides(currentFile, parentFileRef, json, data.overrides, data.imports)
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
    this._tmpRefFileMap[json.ref] = json.file
  },

  // we process both the instance overrides and the main variants of a component
  addOverrides (currentFile, parentFileRef, json, overrides, imports) {
    for (const key of Object.keys(json)) {
      if (key.startsWith('e0')) {
        this.addRefOverrides(currentFile, parentFileRef, key, json, overrides, imports)
      } else if (json[key] && typeof json[key] === 'object') {
        this.addOverrides(currentFile, parentFileRef, json[key], overrides, imports)
      }
    }
  },

  addRefOverrides (currentFile, parentFileRef, ref, json, overrides, imports) {
    const clone = ExtendJS.cloneData(json[ref])
    if (clone.children) {
      delete clone.children
      // we now switch the parentFileRef from a file to a ref id
      this.addOverrides(currentFile, ref, json[ref], overrides, imports)
    }
    if (ExtendJS.isEmpty(clone)) return
    if (!overrides[ref]) overrides[ref] = {}
    this.processRefOverrides(currentFile, parentFileRef, clone, ref, overrides, imports)
  },

  processRefOverrides (currentFile, parentFileRef, cmpData, ref, overrides, imports) {
    if (cmpData.tag) overrides[ref].tag = true
    if ('inner' in cmpData) overrides[ref].inner = true
    this.processUnrender(cmpData.attributes, overrides[ref])
    this.processObject(cmpData.attributes, overrides[ref], 'attributes')
    this.processObject(cmpData.properties, overrides[ref], 'properties')
    this.processObject(cmpData.classes, overrides[ref], 'classes')
    if (cmpData.component) {
      overrides[ref].component = true
      this.addOverrideImports(currentFile, parentFileRef, cmpData.component, imports)
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
    const array = [
      'reactIf', 'reactFor', 'reactIfFor', 'reactForIf',
      'v-if', 'v-for', ':key', 'v-pre', 'v-cloak', 'v-once'
    ]
    return !array.includes(name)
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

  addOverrideImports (currentFile, parentFileRef, value, imports) {
    if (!imports.topOverrides[currentFile]) imports.topOverrides[currentFile] = []
    if (!imports.topOverrides[currentFile].includes(value)) {
      imports.topOverrides[currentFile].push(value)
    }
    if (!this._tmpParentImports[parentFileRef]) this._tmpParentImports[parentFileRef] = []
    this._tmpParentImports[parentFileRef].push(value)
  },

  setParentImports (imports) {
    for (const [parentFileRef, files] of Object.entries(this._tmpParentImports)) {
      if (parentFileRef.startsWith('e0')) {
        this.setParentImportFiles(imports, this._tmpRefFileMap[parentFileRef], files)
      } else {
        this.setParentImportFiles(imports, parentFileRef, files)
      }
    }
  },

  setParentImportFiles (imports, file, files) {
    imports[file] = ExtendJS.unique([...imports[file] || [], ...files])
  }
}

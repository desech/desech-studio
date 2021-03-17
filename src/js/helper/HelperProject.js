import HelperDOM from './HelperDOM.js'

export default {
  getFolder () {
    return document.getElementById('page').dataset.folder
  },

  getProjectSettings () {
    const data = document.getElementById('page').dataset.project
    return JSON.parse(data)
  },

  getFile () {
    return document.getElementById('page').dataset.file
  },

  getFileMeta () {
    const data = document.getElementById('page').dataset.fileMeta
    return data ? JSON.parse(data) : null
  },

  getFontList () {
    const data = document.getElementById('page').dataset.fontList
    return data ? JSON.parse(data) : null
  },

  setFolder (folder) {
    document.getElementById('page').dataset.folder = folder
  },

  setProjectSettings (data) {
    document.getElementById('page').dataset.project = JSON.stringify(data)
  },

  setFile (file) {
    document.getElementById('page').dataset.file = file
    document.getElementById('loaded-file-name').textContent = this.getFileName(file)
  },

  setFileMeta (meta) {
    const page = document.getElementById('page')
    page.dataset.fileMeta = JSON.stringify(meta)
  },

  setFontList (list) {
    const page = document.getElementById('page')
    page.dataset.fontList = JSON.stringify(list)
  },

  clearData () {
    const page = document.getElementById('page')
    HelperDOM.deleteAllDataset(page)
  },

  getFileName (path) {
    return path.substring(path.lastIndexOf('/') + 1)
  },

  isFileComponent (file = null) {
    file = file || this.getFile()
    return file.includes('/component/')
  },

  getDesktopFirstResponsive () {
    return {
      default: {
        width: '1366px',
        height: '3000px'
      },
      list: [
        {
          'max-width': '1200px',
          width: '993px',
          height: '3000px'
        },
        {
          'max-width': '992px',
          width: '769px',
          height: '1024px'
        },
        {
          'max-width': '768px',
          width: '577px',
          height: '800px'
        },
        {
          'max-width': '576px',
          width: '350px',
          height: '700px'
        }
      ]
    }
  },

  getMobileFirstResponsive () {
    return {
      default: {
        width: '350px',
        height: '700px'
      },
      list: [
        {
          'min-width': '576px',
          width: '576px',
          height: '700px'
        },
        {
          'min-width': '768px',
          width: '768px',
          height: '800px'
        },
        {
          'min-width': '992px',
          width: '992px',
          height: '1024px'
        },
        {
          'min-width': '1200px',
          width: '1200px',
          height: '3000px'
        }
      ]
    }
  }
}

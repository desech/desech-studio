process.once('loaded', () => {
  const { contextBridge, ipcRenderer, shell } = require('electron')
  const fs = require('fs')

  contextBridge.exposeInMainWorld('electron', {
    on (eventName, callback) {
      ipcRenderer.on(eventName, callback)
    },

    async invoke (eventName, ...params) {
      return await ipcRenderer.invoke(eventName, ...params)
    },

    async shellOpenPath (file) {
      await shell.openPath(file)
    },

    async shellOpenExternal (url) {
      await shell.openExternal(url)
    },

    async shellTrashItem (file) {
      if (fs.existsSync(file)) {
        await shell.trashItem(file)
      }
    }
  })
})

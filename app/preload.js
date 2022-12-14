process.once('loaded', () => {
  const { contextBridge, ipcRenderer, shell } = require('electron')
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
    }
  })
})

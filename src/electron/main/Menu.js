import { app, Menu } from 'electron'
import Language from '../lib/Language.js'
import EventMain from '../event/EventMain.js'
import EventMenu from '../event/EventMenu.js'
import Config from '../lib/Config.js'

export default {
  setMenu (locale) {
    const menu = Menu.buildFromTemplate(this.getMenu(locale))
    Menu.setApplicationMenu(menu)
  },

  getMenu (locale) {
    const menu = this.getTemplate(locale)
    this.adjustForMac(menu, locale)
    return menu
  },

  getTemplate (locale) {
    return [
      this.getMenuFile(locale),
      this.getMenuImport(locale),
      this.getMenuSettings(locale),
      this.getMenuView(locale),
      this.getMenuHelp(locale)
    ]
  },

  getMenuFile (locale) {
    return {
      label: Language.localize('File', locale),
      submenu: [
        // {
        //   label: Language.localize('New Tutorial Project', locale),
        //   click: async () => {
        //     await EventMain.handleEvent(EventMenu, 'newTutorialProject')
        //   }
        // },
        {
          label: Language.localize('New Project', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'newProject')
          }
        },
        {
          label: Language.localize('Open Project', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'openProject', locale)
          }
        },
        { type: 'separator' },
        {
          label: Language.localize('Project Settings', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'openProjectSettings')
          }
        },
        {
          label: Language.localize('Close Project', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'closeProject')
          }
        },
        {
          label: Language.localize('Export Project', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'exportFolder', locale)
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  },

  getMenuImport (locale) {
    return {
      label: Language.localize('Import', locale),
      submenu: [
        {
          label: Language.localize('Import Sketch', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importFilePrompt', 'sketch')
          }
        },
        {
          label: Language.localize('Import Figma', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importFilePrompt', 'figma')
          }
        },
        {
          label: Language.localize('Import Adobe XD', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importFilePrompt', 'adobexd')
          }
        }
      ]
    }
  },

  getMenuSettings (locale) {
    return {
      label: Language.localize('Settings', locale),
      submenu: [
        // {
        //   label: Language.localize('Language', locale),
        //   submenu: [
        //     {
        //       label: 'English',
        //       click: async () => {
        //         await EventMain.handleEvent(EventMenu, 'switchLanguage', 'en')
        //       }
        //     },
        //     {
        //       label: 'Română',
        //       click: async () => {
        //         await EventMain.handleEvent(EventMenu, 'switchLanguage', 'ro')
        //       }
        //     }
        //   ]
        // },
        {
          label: Language.localize('Theme', locale),
          submenu: [
            {
              label: 'Light',
              click: async () => {
                await EventMain.handleEvent(EventMenu, 'switchTheme', 'light')
              }
            },
            {
              label: 'Dark',
              click: async () => {
                await EventMain.handleEvent(EventMenu, 'switchTheme', 'dark')
              }
            }
          ]
        },
        {
          label: Language.localize('Plugins', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'openPlugins')
          }
        }
      ]
    }
  },

  getMenuView (locale) {
    return {
      label: Language.localize('View', locale),
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  },

  getMenuHelp (locale) {
    return {
      label: Language.localize('Help', locale),
      submenu: [
        {
          label: Language.localize('Support', locale),
          click: async () => {
            const url = Config.getConfig('web') + '/support.html'
            await EventMain.handleEvent(EventMenu, 'openLink', url)
          }
        },
        {
          label: Language.localize('Shortcuts', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'showShortcuts')
          }
        },
        {
          label: Language.localize('About', locale),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'showAbout')
          }
        }
      ]
    }
  },

  adjustForMac (menu, locale) {
    if (process.platform !== 'darwin') return
    this.injectAboutMacMenu(menu)
    this.injectEditMacMenu(menu, locale)
  },

  injectAboutMacMenu (menu) {
    menu.unshift({
      label: app.name,
      submenu: [
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' }
      ]
    })
    this.moveAboutMenuOption(menu)
    this.moveQuitMenuOption(menu)
  },

  moveAboutMenuOption (menu) {
    menu[0].submenu.unshift(menu[5].submenu[2])
    delete menu[5].submenu[2]
  },

  moveQuitMenuOption (menu) {
    menu[0].submenu.push(menu[1].submenu[7])
    delete menu[1].submenu[6]
    delete menu[1].submenu[7]
  },

  injectEditMacMenu (menu, locale) {
    menu.splice(2, 0, {
      label: Language.localize('Edit', locale),
      submenu: [
        {
          label: Language.localize('Undo', locale),
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: Language.localize('Redo', locale),
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        { type: 'separator' },
        {
          label: Language.localize('Cut', locale),
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: Language.localize('Copy', locale),
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: Language.localize('Paste', locale),
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: Language.localize('Select All', locale),
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    })
  }
}

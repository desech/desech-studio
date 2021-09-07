import { app, Menu } from 'electron'
import Language from '../lib/Language.js'
import EventMain from '../event/EventMain.js'
import EventMenu from '../event/EventMenu.js'
import Config from '../lib/Config.js'
import ExportFolder from '../export/ExportFolder.js'

export default {
  setMenu () {
    const menu = Menu.buildFromTemplate(this.getMenu())
    Menu.setApplicationMenu(menu)
  },

  getMenu () {
    const menu = this.getTemplate()
    this.adjustForMac(menu)
    return menu
  },

  getTemplate () {
    return [
      this.getMenuFile(),
      this.getMenuImport(),
      this.getMenuSettings(),
      this.getMenuView(),
      this.getMenuHelp()
    ]
  },

  getMenuFile () {
    return {
      label: Language.localize('File'),
      submenu: [
        // {
        //   label: Language.localize('New Sample Project'),
        //   click: async () => {
        //     await EventMain.handleEvent(EventMenu, 'newSampleProject')
        //   }
        // },
        {
          label: Language.localize('New Project'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'newProject')
          }
        },
        {
          label: Language.localize('Open Project'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'initProject')
          }
        },
        { type: 'separator' },
        {
          label: Language.localize('Project Settings'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'openProjectSettings')
          }
        },
        {
          label: Language.localize('Close Project'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'closeProject')
          }
        },
        {
          label: Language.localize('Export Project'),
          click: async () => {
            await EventMain.handleEvent(ExportFolder, 'exportFolder')
          }
        },
        {
          label: Language.localize('Export for Production'),
          click: async () => {
            await EventMain.handleEvent(ExportFolder, 'exportProduction')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }
  },

  getMenuImport () {
    return {
      label: Language.localize('Import'),
      submenu: [
        {
          label: Language.localize('Import Figma'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importShowFilePrompt', 'figma')
          }
        },
        {
          label: Language.localize('Import Adobe XD'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importShowFilePrompt', 'adobexd')
          }
        },
        {
          label: Language.localize('Import Sketch'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'importShowFilePrompt', 'sketch')
          }
        }
      ]
    }
  },

  getMenuSettings () {
    return {
      label: Language.localize('Settings'),
      submenu: [
        // {
        //   label: Language.localize('Language'),
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
          label: Language.localize('Theme'),
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
          label: Language.localize('Plugins'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'openPlugins')
          }
        }
      ]
    }
  },

  getMenuView () {
    return {
      label: Language.localize('View'),
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

  getMenuHelp () {
    return {
      label: Language.localize('Help'),
      submenu: [
        {
          label: Language.localize('Support'),
          click: async () => {
            const url = Config.getConfig('web') + '/support.html'
            await EventMain.handleEvent(EventMenu, 'openLink', url)
          }
        },
        {
          label: Language.localize('Shortcuts'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'showShortcuts')
          }
        },
        {
          label: Language.localize('About'),
          click: async () => {
            await EventMain.handleEvent(EventMenu, 'showAbout')
          }
        }
      ]
    }
  },

  adjustForMac (menu) {
    if (process.platform !== 'darwin') return
    this.injectAboutMacMenu(menu)
    this.injectEditMacMenu(menu)
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
    // `Help` is the last menu category; `About` is the last menu item
    const helpMenu = menu[menu.length - 1]
    const aboutOption = helpMenu.submenu[helpMenu.submenu.length - 1]
    menu[0].submenu.unshift(aboutOption)
    delete helpMenu.submenu[helpMenu.submenu.length - 1]
  },

  moveQuitMenuOption (menu) {
    // `Quit` is the last menu item from the `File` menu; before that there's a separator
    const fileMenu = menu[1]
    menu[0].submenu.push(fileMenu.submenu[fileMenu.submenu.length - 1])
    delete fileMenu.submenu[fileMenu.submenu.length - 2]
    delete fileMenu.submenu[fileMenu.submenu.length - 1]
  },

  injectEditMacMenu (menu) {
    // inject the `Edit` menu after the `File` menu
    menu.splice(2, 0, {
      label: Language.localize('Edit'),
      submenu: [
        {
          label: Language.localize('Undo'),
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: Language.localize('Redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        { type: 'separator' },
        {
          label: Language.localize('Cut'),
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: Language.localize('Copy'),
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: Language.localize('Paste'),
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: Language.localize('Select All'),
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    })
  }
}

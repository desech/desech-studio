import Log from '../../lib/Log.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import ProjectCommon from '../ProjectCommon.js'
import HelperFile from '../../../js/helper/HelperFile.js'
import File from '../../file/File.js'

export default {
  // components need to be overhauled completely
  async migrate (folder) {
    await Log.info('Migrating to version 1.3.0')
    await ProjectCommon.updateHtmlFiles(folder, async (file, html) => {
      await Log.info(`Migrating file ${file}`)
      html = html.replace('<body>', '<body class="e000body">')
        .replace(/data-element-properties="{(.*?)}"/g, 'data-ss-properties="{$1}"')
        .replace(/class="component-children/g, 'data-ss-component-hole="" class="block')
      return this.replaceComponent(html, folder)
    })
    await Log.info('Migration 1.3.0 finished')
  },

  replaceComponent (html, folder) {
    return html.replace(/class="component" src="(.*?)"( data-ss-properties="(.*?)")?/g,
      (match, file, propFound, props) => {
        file = this.renameComponent(file, folder)
        const ref = HelperElement.generateElementRef()
        const propsString = props ? `,&quot;properties&quot;:${props}` : ''
        return `class="component" data-ss-component="{&quot;ref&quot;:&quot;${ref}&quot;` +
          `,&quot;file&quot;:&quot;${file}&quot;${propsString}}"`
      })
  },

  // we are only renaming the components, not folders, but let's hope the folders are ok
  renameComponent (file, folder) {
    const name = File.basename(file)
    const newName = HelperFile.sanitizeFile(name)
    if (name !== newName) {
      File.renamePath(File.resolve(folder, file), newName)
      file = File.resolve(File.dirname(file), newName)
    }
    return file
  }
}

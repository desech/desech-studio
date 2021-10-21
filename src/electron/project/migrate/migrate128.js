import fs from 'fs'
import ExportCommon from '../../export/ExportCommon.js'
import Log from '../../lib/Log.js'
import HelperElement from '../../../js/helper/HelperElement.js'

export default {
  // components need to be overhauled completely
  async migrate (folder) {
    await Log.info('Migrating to version 1.2.8')
    const htmlFiles = ExportCommon.getHtmlFiles(folder)
    for (const page of htmlFiles) {
      await this.migrateHtml(page.path)
    }
    await Log.info('Migration 1.2.8 finished')
  },

  async migrateHtml (file) {
    await Log.info(`Migrating file ${file}`)
    let html = fs.readFileSync(file).toString()
    html = html.replace(/data-element-properties="{(.*?)}"/g, 'data-ss-properties="{$1}"')
      .replace(/class="component-children/g, 'data-ss-component-hole="" class="block')
    html = this.replaceComponent(html)
    fs.writeFileSync(file, html)
  },

  replaceComponent (html) {
    return html.replace(/class="component" src="(.*?)"( data-ss-properties="(.*?)")?/g,
      (match, file, propFound, props) => {
        const ref = HelperElement.generateElementRef()
        const propsString = props ? `,&quot;properties&quot;:${props}` : ''
        return `class="component" data-ss-component="{&quot;ref&quot;:&quot;${ref}&quot;` +
          `,&quot;file&quot;:&quot;${file}&quot;${propsString}}"`
      })
  }
}

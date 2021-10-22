import Log from '../../lib/Log.js'
import HelperElement from '../../../js/helper/HelperElement.js'
import ProjectCommon from '../ProjectCommon.js'

export default {
  // components need to be overhauled completely
  async migrate (folder) {
    await Log.info('Migrating to version 1.2.8')
    await ProjectCommon.updateHtmlFiles(folder, async (file, html) => {
      await Log.info(`Migrating file ${file}`)
      html = html.replace(/data-element-properties="{(.*?)}"/g, 'data-ss-properties="{$1}"')
        .replace(/class="component-children/g, 'data-ss-component-hole="" class="block')
      return this.replaceComponent(html)
    })
    await Log.info('Migration 1.2.8 finished')
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

import packageJson from '../../../package.json'
import ExtendJS from '../../js/helper/ExtendJS.js'

export default {
  migrateVersion (folder, settings) {
    const currentVersion = settings?.version || packageJson.version
    for (const [version, func] of Object.entries(this.getMap())) {
      if (ExtendJS.versionCompare(currentVersion, version) < 0) {
        this[func](folder)
      }
    }
  },

  getMap () {
    return {
      '1.2.8': 'migrate128'
    }
  },

  // components need to be overhauled completely
  migrate128 (folder) {
    
  }
}

import packageJson from '../../../package.json' assert { type: 'json' }
import ExtendJS from '../../js/helper/ExtendJS.js'
import ProjectCommon from './ProjectCommon.js'
import migrate130 from './migrate/migrate130.js'

export default {
  async migrateVersion (folder, settings) {
    let migration = false
    for (const [version, func] of Object.entries(this.getMap())) {
      if (!settings?.version || ExtendJS.versionCompare(settings?.version, version) < 0) {
        migration = true
        await func.migrate(folder)
      }
    }
    if (migration) this.saveVersion(folder, settings)
  },

  saveVersion (folder, settings) {
    settings.version = packageJson.version
    ProjectCommon.saveProjectSettings(folder, settings)
  },

  getMap () {
    return {
      '2.0.0': migrate200
    }
  }
}

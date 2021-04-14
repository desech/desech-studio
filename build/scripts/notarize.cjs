const notarize = require('electron-notarize')
const path = require('path')
const fs = require('fs')

module.exports = async (params) => {
  if (process.platform !== 'darwin') return

  console.log('afterSign hook triggered', params)
  const appId = 'com.desech.desech-studio'
  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`)
  if (!fs.existsSync(appPath)) {
    console.log('skip')
    return
  }

  console.log(`Notarizing ${appId} found at ${appPath}`)
  try {
    await notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS
    })
  } catch (error) {
    console.error(error)
  }

  console.log(`Done notarizing ${appId}`)
}
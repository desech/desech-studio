import ExtendJS from './ExtendJS.js'
import HelperDesignSystem from './HelperDesignSystem.js'
import HelperProject from './HelperProject.js'

export default {
  sanitizeFolder (name) {
    // only allow alphanumeric and dashes
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  },

  sanitizeFile (name) {
    // only allow alphanumeric, dashes and one dot
    name = name.toLowerCase().replace(/[^a-z0-9-.]/g, '-')
    if (name.includes('.')) {
      const part1 = name.substring(0, name.lastIndexOf('.')).replaceAll('.', '-')
      const part2 = name.substring(name.lastIndexOf('.'))
      name = part1 + part2
    }
    return name.replace(/-+/g, '-')
  },

  convertPathForWin (file, os = navigator.platform) {
    return (os.toLowerCase() === 'win32') ? file.replaceAll('/', '\\') : file
  },

  getFileExtension (file) {
    if (file.includes('.')) {
      return file.substring(file.lastIndexOf('.') + 1)
    } else {
      return ''
    }
  },

  getRelPath (path, folder = null) {
    folder = (folder || HelperProject.getFolder()) + '/'
    return path.replaceAll(encodeURI(folder), '').replaceAll(folder, '')
  },

  getAbsPath (path, folder = null) {
    folder = (folder || HelperProject.getFolder()) + '/'
    return (folder + path).replaceAll('//', '/')
  },

  getBaseHref (file, folder = null) {
    const slashes = ExtendJS.countMatches(this.getRelPath(file, folder), '/')
    if (slashes) return '../'.repeat(slashes)
    return ''
  },

  getDirname (file) {
    return file.substring(0, file.lastIndexOf('/'))
  },

  getBasename (file) {
    return file.substring(file.lastIndexOf('/') + 1)
  },

  getDefaultImage () {
    const root = HelperProject.getFolder()
    return root + '/asset/image/image.jpg'
  },

  getDefaultVideo () {
    const root = HelperProject.getFolder()
    return root + '/asset/media/video.mp4'
  },

  getDefaultAudio () {
    const root = HelperProject.getFolder()
    return root + '/asset/media/audio.mp3'
  },

  getDefaultBackgroundImage () {
    const root = HelperProject.getFolder()
    return root + '/asset/image/background.png'
  },

  getDropdownImage () {
    const root = HelperProject.getFolder()
    return root + '/asset/image/arrow-down.svg'
  },

  isReadonly (file) {
    return this.isReadonlyFile(file) || this.isReadonlyFolder(file)
  },

  isReadonlyFile (file) {
    const root = HelperProject.getFolder()
    return [
      this.getDefaultImage(),
      this.getDefaultVideo(),
      this.getDefaultAudio(),
      this.getDefaultBackgroundImage(),
      this.getDropdownImage(),
      root + '/js/script.js',
      root + '/index.html'
    ].includes(file) || this.isFolderFile(file, 'css')
  },

  isReadonlyFolder (folder) {
    const root = HelperProject.getFolder()
    return [
      root + '/asset',
      root + '/asset/image',
      root + '/asset/media',
      root + '/font',
      root + '/css',
      root + '/css/general',
      root + '/css/page',
      root + '/js',
      root + '/component'
    ].includes(folder) || this.isFolderFile(folder, 'component/design-system')
  },

  isFolderFile (file, folder, root = null) {
    if (!root) root = HelperProject.getFolder()
    return (file.startsWith(root + '/' + folder))
  },

  isComponentFile (file = null, root = null) {
    if (!file) file = HelperProject.getFile()
    return this.getFileExtension(file) === 'html' && this.isFolderFile(file, 'component', root)
  },

  isPageFile (file = null, root = null) {
    if (!file) file = HelperProject.getFile()
    return this.getFileExtension(file) === 'html' && !this.isFolderFile(file, 'component', root)
  },

  getFullHtml (htmlFile, body = '', meta = {}, rootFolder = null, hasDesignSystem = null) {
    rootFolder = rootFolder || HelperProject.getFolder()
    return this.getFullHtmlString({
      body,
      baseHref: this.getBaseHref(htmlFile, rootFolder),
      language: meta.language || '',
      title: meta.title || '',
      meta: meta.meta || '',
      pageCssFile: this.getPageCssFile(htmlFile, rootFolder),
      cssDesignSystem: HelperDesignSystem.getDesignSystemCssFileLink(hasDesignSystem)
    })
  },

  getPageCssFile (htmlFile, rootFolder = null) {
    rootFolder = rootFolder || HelperProject.getFolder()
    return htmlFile.replace(rootFolder + '/', '').replaceAll('/', '-').replace('.html', '.css')
  },

  getFullHtmlString (data) {
    // change the /app/ui/index.html file too
    data.language = data.language || 'en'
    data.title = data.title || 'Desech Studio page'
    data.meta = data.meta || `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="Desech Studio">
  <meta name="description" content="Desech Studio page">`
    data.body = data.body || `<body class="e000body">
</body>`
    return `<!doctype html>
<html lang="${data.language}">
<head>
  ${data.meta}
  <title>${data.title}</title>
  <base href="${data.baseHref}">
  <script src="js/script.js"></script>
  <link rel="stylesheet" href="css/general/reset.css">
  <link rel="stylesheet" href="css/general/animation.css">
  <link rel="stylesheet" href="css/general/font.css">
  ${data.cssDesignSystem}<link rel="stylesheet" href="css/general/root.css">
  <link rel="stylesheet" href="css/general/component-css.css">
  <link rel="stylesheet" href="css/general/component-html.css">
  <link rel="stylesheet" href="css/page/${data.pageCssFile}">
</head>
${data.body}
</html>
`
  },

  getIgnoredFileFolders () {
    return ['_desech', '_export', '.git', '.gitignore', '.keep', '.DS_Store']
  }
}

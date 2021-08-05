export default {
  getImportTitle (type) {
    const query = `.start-import-file[data-type="${CSS.escape(type)}"] .start-import-title`
    return document.querySelector(query).textContent
  }
}

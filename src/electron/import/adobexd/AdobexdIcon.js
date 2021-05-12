export default {
  getSvgContent (element, type, width, height) {
    if (type !== 'icon') return
    const content = element.shape.path
      ? this.getSvgFromPath(width, height, element)
      : this.getSvgFromPolygon()
    return { content }
  },

  getSvgFromPath (width, height, element) {
    // path/compound has no x/y/width/height, but has the path value: <path d="..."/>
    return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="${element.shape.path}"/></svg>`
  },

  getSvgFromPolygon () {
    // polygon has x/y/width/height, 3 points and style.stroke.width
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' +
    '</svg>'
  }
}

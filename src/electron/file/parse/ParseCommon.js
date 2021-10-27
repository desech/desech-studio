export default {
  getBorderRadiusProperties () {
    return ['border-bottom-left-radius', 'border-bottom-right-radius', 'border-top-left-radius', 'border-top-right-radius']
  },

  getBorderStyleProperties () {
    return ['border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style']
  },

  getBorderWidthProperties () {
    return ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'border-image-width']
  },

  getBorderColorProperties () {
    return ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color']
  },

  getBackgroundProperties () {
    return ['background-size', 'background-position', 'background-repeat', 'background-attachment', 'background-origin', 'background-blend-mode']
  },

  fixSrcSet (value, folder) {
    // only the folder needs to be encoded because the images are saved as encoded in the html
    return value.replace(/(,)?( )?(.+?)( .x)/g, `$1$2${encodeURI(folder)}/$3$4`)
  }
}

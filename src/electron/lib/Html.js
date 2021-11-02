import beautify from 'js-beautify'

export default {
  beautifyHtml (body) {
    if (!body) return ''
    return beautify.html(body, {
      indent_size: 2,
      preserve_newlines: false
    })
  }
}

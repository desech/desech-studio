import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'

export default {
  async setTracks (list) {
    const element = StateSelectedElement.getElement()
    const node = this.buildTracks(list.getElementsByClassName('style-html-track-element'))
    await RightHtmlCommon.setListHtmlCommand('setTracks', element, node, 'track')
  },

  buildTracks (forms) {
    // the tag doesn't matter; works for audio too
    const node = document.createElement('video')
    for (const form of forms) {
      node.appendChild(this.createTrack(form))
    }
    return node
  },

  createTrack (form) {
    const track = document.createElement('track')
    this.setTrack(form, track)
    return track
  },

  setTrack (form, track) {
    if (form.default.classList.contains('selected')) track.setAttributeNS(null, 'default', '')
    for (const field of ['kind', 'src', 'srclang', 'label']) {
      if (form[field].value) track.setAttributeNS(null, field, form[field].value)
    }
  },

  injectTracks (container, element) {
    const list = container.getElementsByClassName('style-html-track-list')[0]
    for (const child of element.children) {
      const data = this.getTrackData(child)
      RightHtmlCommon.addTrackToList(list, data)
    }
  },

  getTrackData (node) {
    return {
      kind: node.getAttributeNS(null, 'kind') || '',
      src: node.getAttributeNS(null, 'src') || '',
      srclang: node.getAttributeNS(null, 'srclang') || '',
      label: node.getAttributeNS(null, 'label') || '',
      default: node.hasAttributeNS(null, 'default')
    }
  }
}

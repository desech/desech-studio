import RightHtmlCommon from '../RightHtmlCommon.js'
import StateSelectedElement from '../../../../../state/StateSelectedElement.js'
import HelperElement from '../../../../../helper/HelperElement.js'

export default {
  setTracks (list) {
    const node = this.buildTracks(list.getElementsByClassName('style-html-track-element'))
    RightHtmlCommon.setListHtmlCommand('setTracks', StateSelectedElement.getElement(), node, 'track')
  },

  buildTracks (forms) {
    const node = document.createElement('video') // the tag doesn't matter; works for audio too
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
    const node = HelperElement.getNode(element)
    const list = container.getElementsByClassName('style-html-track-list')[0]
    for (const child of node.children) {
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

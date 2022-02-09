import HelperLocalStore from '../helper/HelperLocalStore.js'

export default {
  getEvents () {
    return {
      click: ['clickToggleContainerEvent']
    }
  },

  clickToggleContainerEvent (event) {
    if (event.target.closest('.slider-extra-button span')) {
      this.toggleContainer(event.target.closest('.slider-extra-main'))
    }
  },

  toggleContainer (container) {
    container.classList.contains('opened')
      ? this.closeContainer(container)
      : this.openContainer(container)
  },

  openContainer (container) {
    container.classList.add('opened')
    HelperLocalStore.setItem(container.dataset.store, 'opened')
  },

  closeContainer (container) {
    container.classList.remove('opened')
    HelperLocalStore.removeItem(container.dataset.store)
  },

  setOpened (container) {
    const main = container.getElementsByClassName('slider-extra-main')[0]
    if (HelperLocalStore.getItem(main.dataset.store)) {
      main.classList.add('opened')
    }
  }
}

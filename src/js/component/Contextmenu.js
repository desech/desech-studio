import HelperDOM from '../helper/HelperDOM.js'
import HelperUnit from '../helper/HelperUnit.js'

export default {
  reloadMenu (menu, options, x, y) {
    HelperDOM.replaceOnlyChild(menu, options)
    menu.style.left = x + 'px'
    menu.style.top = this.getMenuY(menu, y) + 'px'
  },

  getMenuY (menu, y) {
    const minY = HelperUnit.getWindowHeight() - Math.round(menu.offsetHeight)
    return y > minY ? minY : y
  },

  emptyMenu () {
    const menus = document.getElementsByClassName('contextmenu')
    HelperDOM.deleteChildren(menus)
  }
}

import jsdom from 'jsdom'

// copy paste from https://github.com/lukechilds/window/blob/master/src/index.js
class Window {
  constructor (jsdomConfig = {}) {
    const { proxy, strictSSL, userAgent } = jsdomConfig
    const resources = new jsdom.ResourceLoader({
      proxy,
      strictSSL,
      userAgent
    })
    return (new jsdom.JSDOM('', Object.assign(jsdomConfig, {
      url: 'https://localhost', // needed for localStorage
      resources
    }))).window
  }
}

// copy paste from https://github.com/lukechilds/browser-env/blob/master/src/index.js
const defaultJsdomConfig = {
  features: {
    FetchExternalResources: false,
    ProcessExternalResources: false
  }
}
const protectedproperties = (() => Object.getOwnPropertyNames(new Window(defaultJsdomConfig)).filter(prop => typeof global[prop] !== 'undefined'))()
function browserEnv () {
  const args = Array.from(arguments)
  const properties = args.filter(arg => Array.isArray(arg))[0]
  const userJsdomConfig = args.filter(arg => !Array.isArray(arg))[0]
  const window = new Window(Object.assign({}, userJsdomConfig, defaultJsdomConfig))
  Object.getOwnPropertyNames(window).filter(prop => protectedproperties.indexOf(prop) === -1).filter(prop => !(properties && properties.indexOf(prop) === -1)).forEach(prop => {
    if (prop === 'undefined') return
    Object.defineProperty(global, prop, {
      configurable: true,
      get: () => window[prop]
    })
  })
  return window
}
browserEnv()

// offsets
Object.defineProperties(window.HTMLElement.prototype, {
  offsetWidth: {
    get () { return parseFloat(this.style.width) || 0 }
  },
  offsetHeight: {
    get () { return parseFloat(this.style.height) || 0 }
  },
  offsetTop: {
    get () { return parseFloat(this.style.marginTop) || 0 }
  },
  offsetLeft: {
    get () { return parseFloat(this.style.marginLeft) || 0 }
  }
})

window.HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    width: parseFloat(this.style.width) || 0,
    height: parseFloat(this.style.height) || 0,
    top: parseFloat(this.style.marginTop) || 0,
    left: parseFloat(this.style.marginLeft) || 0
  }
}

document.execCommand = (command, ui, value) => {
  const node = window.getSelection().anchorNode
  switch (command) {
    case 'insertHTML':
      if (node.innerHTML) {
        node.innerHTML += value
      } else { // Text node
        node.parentNode.innerHTML += value
      }
      break
    case 'insertLineBreak':
      node.innerHTML += '<br>'
      break
  }
}

// my code
document.adoptedStyleSheets = []
window.HTMLElement.prototype.scrollIntoView = () => {}

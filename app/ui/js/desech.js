const Desech = {
  async buildComponents (container, data = {}) {
    for (const script of container.querySelectorAll('script[type="text/html"]')) {
      data = { ...script.dataset, ...data }
      const response = await fetch(new Request(script.src))
      const html = await response.text()
      const div = document.createElement('div')
      div.innerHTML = this.parseComponentHtml(html, data)
      const scriptHtml = script.innerHTML
      script.replaceWith(div)
      await this.buildComponents(div, data)
      await this.buildComponentChildren(div, scriptHtml)
    }
  },

  parseComponentHtml (componentHtml, data) {
    return componentHtml.replace(/{{([a-z0-9]*)}}/gi, (match, property) => {
      return data[property] || match
    })
  },

  async buildComponentChildren (div, scriptHtml) {
    const container = div.getElementsByClassName('component-children')[0]
    if (!container) return
    container.innerHTML = scriptHtml
    await this.buildComponents(container)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Desech.buildComponents(document)
  } catch (error) {
    console.error(error)
  }
})

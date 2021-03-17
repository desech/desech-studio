import { session } from 'electron'

export default {
  _URL: 'http://localhost',

  setCookie (name, value) {
    return new Promise((resolve, reject) => {
      const cookie = { url: this._URL, name, value }
      session.defaultSession.cookies.set(cookie).then(() => {
        resolve()
      }, (error) => {
        reject(error)
      })
    })
  },

  getCookie (name) {
    return new Promise((resolve, reject) => {
      session.defaultSession.cookies.get({ name }).then((cookies) => {
        const value = cookies.length ? cookies[0].value : null
        resolve(value)
      }).catch((error) => {
        reject(error)
      })
    })
  },

  removeCookie (name) {
    return new Promise((resolve, reject) => {
      session.defaultSession.cookies.remove(this._URL, name).then((cookies) => {
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  }
}

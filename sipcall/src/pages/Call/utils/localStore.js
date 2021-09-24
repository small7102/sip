var Storage = {
  // ==================sessionsTorage设置缓存================
  // 设置缓存
  sessionSet: function (name, data) {
    if (data) {
      sessionStorage.removeItem(name)
      sessionStorage.setItem(name, JSON.stringify(data))
    }
  },
  // 获取缓存
  sessionGet: function (name) {
    let item = sessionStorage.getItem(name)
    if (item&&item!==void 0&&item!=='undefined') {
      return JSON.parse(sessionStorage.getItem(name))
    }
    return void 0
  },
  // 清除缓存
  sessionRemove: function (name) {
      sessionStorage.removeItem(name)
  },
  // ==================localStorage设置缓存==================
  // 设置缓存
  localSet: function (name, data) {
      localStorage.removeItem(name)
      localStorage.setItem(name, JSON.stringify(data))
  },
  // 获取缓存
  localGet: function (name) {
      return JSON.parse(localStorage.getItem(name))
  },
  // 清除缓存
  localRemove: function (name) {
      localStorage.removeItem(name)
  },
  setToken: (token, key = TOKEN_KEY) => {
      Cookies.set(key, token, { expires: 1 })
  },
  getToken: (key = TOKEN_KEY) => {
      const token = Cookies.get(key)
      if (token) return token
      else return false
  }
}

export default Storage

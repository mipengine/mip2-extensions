const {util} = MIP
const {fn} = util

class Login {
  constructor (data) {
    this._openWin = null
    this._loginMap = []
    this._loginConfig = data
    this._href = window.location.href
  }

  bindEvent () {
    if (!this._checkParam()) {
      return
    }
    let login = document.querySelectorAll('[on="tap:mip-access.login"]')
    let logout = document.querySelectorAll('[on="tap:mip-access.logout"]')
    for (let i = 0; i < login.length; i++) {
      login[i].addEventListener('click', this._login.bind(this))
    }
    for (let j = 0; j < logout.length; j++) {
      logout[j].addEventListener('click', this._logout.bind(this))
    }
  }

  _checkParam () {
    let lc = this._loginConfig
    if (!lc || !fn.isPlainObject(lc)) {
      return false
    }
    for (let k in lc) {
      if (lc.hasOwnProperty(k)) {
        this._loginMap[k] = lc[k]
      }
    }
    return true
  }

  _login () {
    if (!this._loginMap || !this._loginMap.login) {
      return
    }
    let loginUrl = this._loginMap.login
    let w = Math.floor(Math.min(700, screen.width * 0.9))
    let h = Math.floor(Math.min(450, screen.height * 0.9))
    let x = Math.floor((screen.width - w) / 2)
    let y = Math.floor((screen.height - h) / 2)
    let winParam = 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y +
      ',resizable=yes,scrollbars=yes'
    loginUrl = this._splice(loginUrl)

    try {
      this._openWin = window.open(loginUrl, '_blank', winParam)
    } catch (e) {
      console.error('DOM', 'Failed to open url on target: _blank', e)
    }
    if (!this._openWin) {
      this._openWin = window.open(loginUrl, '_top')
    }
  }

  _logout () {
    if (!this._loginMap || !this._loginMap.logout) {
      return
    }
    let logoutUrl = this._loginMap.logout
    fetch(logoutUrl, {
      credentials: 'include'
    }).then((res) => {
      if (res.ok) {
        window.location.reload()
      }
    })
  }

  _splice (url) {
    let search = url.split('?')
    let returnUrl = encodeURIComponent('https://c.mipcdn.com/static/v2/mip-login-done/mip-login-done.html?url=' + encodeURIComponent(this._href))
    if (search && search.length > 1) {
      url += '&returnUrl=' + returnUrl + '&url=' + this._href
    } else {
      url += '?returnUrl=' + returnUrl + '&url=' + this._href
    }
    return url
  }
}

export default Login

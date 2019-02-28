
class LoginDone {
  constructor () {
    this._timeout = 3000
    this.start()
  }

  start () {
    this._win = window
    this._opener = this._win.opener
    this._href = this._win.location.href
    this._handle = function (event) {
      if (this._timer) {
        clearTimeout(this._timer)
      }
      this._win.close()
    }.bind(this)
    this._bindEvent()
    this._postMessage()
  }

  _postMessage () {
    let url
    let self = this
    let params = this._href.split('?')
    this._timer = setTimeout(function () {
      let close = document.querySelector('#closeWin')
      if (self._win && self._win.removeEventListener) {
        self._win.removeEventListener('message', this._handle)
      }
      close.classList.remove('error-section')
    }, self._timeout)

    if (params && params.length > 1) {
      let queryArr = params[1].split('&')
      for (let i = 0; i < queryArr.length; i++) {
        let item = queryArr[i].split('=')
        if (item && item.length > 1 && item[0] === 'url') {
          url = item[1]
          break
        }
      }
    }
    if (!url) {
      return
    }
    if (!self._opener || this._win.opener === this._win) {
      this._win.location.replace(decodeURIComponent(url))
    } else {
      let originUrl = decodeURIComponent(url)
      let ele = document.createElement('a')
      ele.href = originUrl
      let domain = ele.protocol + '//' + ele.host
      if (!domain) {
        return
      }
      self._opener.postMessage({
        type: 'refresh'
      }, domain)
    }
  }

  _bindEvent () {
    let self = this
    let closeBtn = document.querySelector('#closeButton')
    if (self._win.addEventListener) {
      if (self._win) {
        self._win.addEventListener('message', this._handle)
      }
      closeBtn.addEventListener('click', self._handle)
    }
  }
}

MIP.registerService('mip-login-done', LoginDone)

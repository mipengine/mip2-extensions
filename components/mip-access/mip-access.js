import md5 from './md5'
import LoginModule from './mip-login'
import evaluateAccessExpr from './expr'

import './mip-access.less'

const {viewer, util} = MIP
const {fn} = util

let AccessType = {
  CLIENT: 'client',
  SERVER: 'server',
  OTHER: 'other'
}
let TAG = 'mip-access'
let CustomStorage = util.customStorage
let storage = new CustomStorage(0)
let reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/g

class Access {
  constructor () {
    let elements = document.querySelectorAll('[mip-access-hide]')
    for (let i = 0; i < elements.length; i++) {
      elements[i]._display = util.css(elements[i], 'display')
    }
    this._start()
  }

  _start () {
    this._init()
    if (!this._enabled) {
      return
    }
    this._startInternal()
  }

  _startInternal () {
    switch (this._type) {
      case AccessType.CLIENT:
        this._runAuthorization()
        this._runPingback()
        break
      case AccessType.SERVER:
      case AccessType.OTHER:
        break
    }
  }

  _init () {
    let accessElement = document.querySelector('script[mip-access]')
    this._enabled = !!accessElement
    if (!this._enabled) {
      return
    }
    let configJson = JSON.parse(accessElement.textContent)
    this._rid = this._buildRid()
    this._type = this._buildConfigType(configJson)
    this._loginConfig = this._buildConfigLoginMap(configJson)
    this._login = new LoginModule(this._loginConfig)
    this._login.bindEvent()
    this._authorization = this._buildUrl(configJson.authorization)
    this._noPingback = configJson.noPingback
    this._pingback = this._buildUrl(configJson.pingback)
    this._hideType = configJson.hideType ? configJson.hideType : 0
    this._authorizationFallback = configJson.authorizationFallbackResponse
    this._bindEvent()
  }

  _buildConfigType (configJson) {
    return configJson.type ? configJson.type : AccessType.CLIENT
  }

  _buildConfigLoginMap (configJson) {
    let loginMap = {}
    let loginConfig = configJson.login
    if (typeof loginConfig === 'string') {
      loginMap.signIn = this._buildUrl(loginConfig)
    } else if (fn.isPlainObject(loginConfig)) {
      for (let k in loginConfig) {
        if (!!k && loginConfig.hasOwnProperty(k)) {
          loginMap[k] = this._buildUrl(loginConfig[k])
        }
      }
    }
    return loginMap
  }

  _buildRid () {
    let rid = storage.get(TAG)
    if (!rid) {
      rid = this._buildCryptoRid()
      storage.set(TAG, rid)
    }
    return rid
  }

  _buildCryptoRid () {
    return 'mip-' +
      md5(String(window.location.href + Date.now() +
        window.Math.random() + window.screen.width + window.screen.height))
  }

  _runPingback () {
    if (document.readyState === 'complete') {
      this._applyPingback()
    } else {
      let handle = this._applyPingback.bind(this)
      window.addEventListener('load', handle, false)
    }
  }

  _applyPingback () {
    fetch(this._pingback, {
      credentials: 'include'
    })
  }

  _runAuthorization () {
    this._hideElements()
    this._applyAuthorization()
  }

  _hideElements () {
    let elements = document.querySelectorAll('[mip-access-hide]')
    for (let i = 0; i < elements.length; i++) {
      if (this._hideType) {
        let tagName = elements[i].tagName.toLowerCase()
        switch (tagName) {
          case 'mip-img':
            elements[i].removeAttribute('src')
            elements[i].classList.add('blur-bg', 'mip-access-blur-bg')
            break
          case 'mip-video':
            elements[i].removeAttribute('src')
            elements[i].classList.add('blur-bg', 'mip-access-blur-bg')
            break
          default:
            elements[i].classList.add('elide', 'mip-access-elide')
            break
        }
      } else {
        util.css(elements[i], 'display', 'none')
      }
    }
  }

  _applyAuthorization () {
    fetch(this._authorization, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        this._authorizationFallback = data
        this._applyAuthorizationToElement()
      })
      .catch(() => this._applyAuthorizationToElement())
  }

  _applyAuthorizationToElement () {
    if (this._authorizationFallback) {
      let elements = document.querySelectorAll('[mip-access]')
      for (let i = 0; i < elements.length; i++) {
        let on = true
        let expr = elements[i].getAttribute('mip-access')
        if (expr) {
          on = evaluateAccessExpr(expr, this._authorizationFallback)
        }
        if (!on) {
          if (this._hideType) {
            elements[i].classList.add('elide', 'mip-access-elide')
          } else {
            util.css(elements[i], 'display', 'none')
          }
        } else {
          if (this._hideType) {
            elements[i].classList.remove('elide', 'mip-access-elide')
          } else {
            let display = elements[i]._display
            display = display || 'block'
            util.css(elements[i], 'display', elements[i]._display)
          }
        }
        elements[i]._display = undefined
      }
    }
  }

  _buildUrl (url) {
    let vars = this._prepareUrlVars()
    return this._urlReplacements(url, vars)
  }
  _prepareUrlVars () {
    let sourceUrl = window.location.href
    let canonical = document.head.querySelector('link[rel="canonical"]')
    canonical = canonical ? canonical.href : sourceUrl
    let mipUrl = sourceUrl
    let matchs = sourceUrl.match(reg)
    if (viewer.isIframed && matchs.length > 1) {
      let domain = matchs[1]
      let pth = mipUrl.slice(mipUrl.indexOf(domain))
      let protocol = sourceUrl.match(/\/s\//) ? 'https://' : 'http://'
      mipUrl = protocol + pth
    }
    let vars = {
      READER_ID: this._rid,
      SOURCE_URL: this._getUrlWithoutFragment(sourceUrl),
      MIPDOC_URL: this._getUrlWithoutFragment(mipUrl),
      CANONICAL_URL: this._getUrlWithoutFragment(canonical),
      DOCUMENT_REFERRER: document.referrer,
      RANDOM: Math.random(),
      AUTHDATA (field) {
        if (this._authorizationFallback) {
          return this._authorizationFallback[field]
        }
        return undefined
      }
    }
    return vars
  }

  _getUrlWithoutFragment (url) {
    if (!url) {
      return
    }
    let ele = document.createElement('a')
    ele.href = url
    return ele.protocol + '//' + ele.host + ele.port + ele.pathname
  }

  _urlReplacements (url, vars) {
    for (let key in vars) {
      if (vars.hasOwnProperty(key)) {
        let val = key === 'AUTHDATA' ? vars[key]() : vars[key]
        let reg = new RegExp('=' + key, 'g')
        url = url.replace(reg, '=' + encodeURIComponent(val))
      }
    }
    return url
  }

  _bindEvent () {
    window.addEventListener('message', (event) => {
      if ((event.origin === 'https://mipcache.bdstatic.com' ||
          event.origin === 'https://c.mipcdn.com') &&
        event.source && event.data &&
        event.data.type === 'refresh') {
        if (event.source && event.source === this._login._openWin) {
          location.reload()
          event.source.postMessage({
            type: 'success'
          }, event.origin)
        }
      }
    })
  }
}

MIP.registerService('mip-access', Access)

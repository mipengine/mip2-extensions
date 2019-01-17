/**
 * @file mip-app-banner 组件
 *
 * @author wangpei07@baidu.com
 * @author caoru@baidu.com
 */
import './mip-app-banner.less'

const { CustomElement, util, viewer } = MIP
const { platform } = util
const { fetchJsonp } = MIP.sandbox
const log = util.log('mip-app-banner')

// app 调起
let openButton = {
  setup (openBtn, openInAppUrl, installAppUrl) {
    openBtn.addEventListener('click', () => {
      this.onClick(openInAppUrl, installAppUrl)
    })
  },
  onClick (openInAppUrl, installAppUrl) {
    let timer = setTimeout(() => {
      viewer.open(installAppUrl, { isMipLink: false, replace: true })
      clearTimeout(timer)
    }, 1500)
    window.open(openInAppUrl, '_top')
    let visibilitychange = () => {
      let tag = document.hidden || document.webkitHidden
      tag && clearTimeout(timer)
    }
    document.addEventListener('visibilitychange', visibilitychange)
    document.addEventListener('webkitvisibilitychange', visibilitychange)
    window.addEventListener('pagehide', () => {
      clearTimeout(timer)
    })
  }
}

// storage 的获取、判断、设置
let ls = {
  getSotrageKey (id) {
    return 'mip-app-banner:' + id
  },
  hasItem (id) {
    return !!localStorage.getItem(ls.getSotrageKey(id))
  },
  setSotrage (id) {
    localStorage.setItem(this.getSotrageKey(id), true)
  }
}
// 去掉 banner 并设置 storage
let dismissButton = {
  element: null,
  add (element) {
    this.element = element
    let dismissBtn = document.createElement('span')
    dismissBtn.classList.add('mip-app-banner-dismiss-button')
    dismissBtn.addEventListener('click', this.onClick.bind(this))
    element.appendChild(dismissBtn)
  },
  onClick () {
    ls.setSotrage(this.element.id)
    this.element.remove()
  }
}
// banner 初始化
let preProcess = {
  isDismissed (id) {
    return ls.hasItem(id)
  },
  init (element) {
    if (this.isDismissed(element.id)) {
      element.remove()
      return false
    }
    util.css(element, {
      visibility: 'visible'
    })
    dismissButton.add(element)
    return true
  }
}

export default class MIPAppBanner extends CustomElement {
  /**
   * 判断打开平台
   */
  canShowBanner () {
    let isSysBanner = platform.isSafari() || platform.isBaidu() // || platform.isQQ();
    if (isSysBanner) {
      return false
    }
    this.metaTag = document.head.querySelector('meta[name=apple-itunes-app]')
    if (!this.metaTag) {
      return false
    }
    return true
  }
  /**
   *  是不是ios的app调起
   */
  iosAppBanner () {
    let el = this.element
    if (!this.canShowBanner()) {
      el.remove()
      return
    }
    if (!preProcess.init(el)) {
      return
    }
    let openBtn = el.querySelector('button[open-button]')
    let content = this.metaTag.getAttribute('content')
    let parts = content.replace(/\s/, '').split(',')
    let config = {}
    for (let i = 0; i < parts.length; i++) {
      let params = parts[i].split('=')
      config[params[0]] = params[1]
    }
    let appId = config['app-id']
    let openUrl = config['app-argument']
    let installAppUrl = 'https://itunes.apple.com/us/app/id' + appId
    let openInAppUrl = openUrl || installAppUrl
    openButton.setup(openBtn, openInAppUrl, installAppUrl)
  }
  /**
   * 判断是否是Android的app调起
   */
  andriodAppBanner () {
    let el = this.element
    if (!this.canShowBanner()) {
      el.remove()
      return
    }
    if (!preProcess.init(el)) {
      return
    }
    let openBtn = el.querySelector('button[open-button]')
    let manifestLink = document.head.querySelector('link[rel=manifest],link[rel=origin-manifest]')
    let isChromeAndroid = platform.isAndroid() && platform.isChrome()

    if (MIP.standalone && isChromeAndroid) {
      el.remove()
      return
    }
    if (platform.isAndroid() && !manifestLink) {
      el.remove()
      return
    }
    let manifestHref = manifestLink.getAttribute('href')
    if (/http:\/\//.test(manifestHref)) {
      log.warn('必须是https的连接!')
    }
    fetchJsonp(manifestHref).then(res => {
      return res.json()
    }).then(data => {
      let apps = data.related_applications
      if (!apps) {
        el.remove()
        return
      }
      for (let i = 0; i < apps.length; i++) {
        let app = apps[i]
        if (app.platform === 'play') {
          let installAppUrl = app.install
          let openInAppUrl = app.open
          openButton.setup(openBtn, openInAppUrl, installAppUrl)
        }
      }
    })
  }

  firstInviewCallback () {
    util.css(this.element, {
      display: '',
      visibility: 'hidden'
    })
    if (platform.isIOS()) {
      this.iosAppBanner()
    } else {
      this.andriodAppBanner()
    }
  }
}

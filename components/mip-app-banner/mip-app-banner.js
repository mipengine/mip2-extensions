/**
 * @file mip-app-banner 组件
 *
 * @author wangpei07@baidu.com
 * @author caoru@baidu.com
 */
import './mip-app-banner.less'
let {
  CustomElement,
  util,
  viewer
} = MIP
let platform = util.platform
let fetchJsonp = MIP.sandbox.fetchJsonp
// app 调起
let openButton = {
  setup (openButton, openInAppUrl, installAppUrl) {
    openButton.addEventListener('click', () => {
      this.onClick(openInAppUrl, installAppUrl)
    })
  },
  onClick (openInAppUrl, installAppUrl) {
    let timer = setTimeout(function () {
      window.top.location.href = installAppUrl
    }, 1500)
    window.open(openInAppUrl, '_top')
    let visibilitychange = function () {
      let tag = document.hidden || document.webkitHidden
      tag && clearTimeout(timer)
    }
    document.addEventListener('visibilitychange', visibilitychange)
    document.addEventListener('webkitvisibilitychange', visibilitychange)
    window.addEventListener('pagehide', function () {
      clearTimeout(timer)
    })
  }
}
// storage的获取、判断、设置
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
// 去掉banne并设置storage
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
      return
    }
    util.css(element, {
      visibility: 'visible'
    })
    dismissButton.add(element)
  }
}

export default class MipAppBanner extends CustomElement {
  /**
   * 判断打开平台
   *
   * @return {boolean}
   */
  canShowBanner () {
    this.isSysBanner = platform.isSafari() || platform.isBaidu() // || platform.isQQ();
    this.showSysBanner = !viewer.isIframed && this.isSysBanner
    if (this.showSysBanner) {
      return false
    }
    this.isEmbeddedSafari = viewer.isIframed && this.isSysBanner
    if (this.isEmbeddedSafari) {
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
    if (!this.canShowBanner()) {
      this.element.remove()
    }
    this.metaTag = document.head.querySelector('meta[name=apple-itunes-app]')
    let openBtn = this.element.querySelector('button[open-button]')
    preProcess.init(this.element)
    let content = this.metaTag.getAttribute('content')
    let parts = content.replace(/\s/, '').split(',')
    let config = {}
    for (let part of parts) {
      let params = part.split('=')
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
    if (!this.canShowBanner()) {
      this.element.remove()
      return
    }
    let anOpenButton = this.element.querySelector('button[open-button]')
    preProcess.init(this.element)
    this.manifestLink = null
    this.manifestHref = ''
    this.missingDataSources = false
    this.manifestLink = document.head.querySelector('link[rel=manifest],link[rel=origin-manifest]')
    let isChromeAndroid = platform.isAndroid() && platform.isChrome()
    let showSysBanner = !viewer.isIframed && isChromeAndroid
    if (showSysBanner) {
      this.element.remove()
      return
    }
    this.missingDataSources = platform.isAndroid() && !this.manifestLink

    if (this.missingDataSources) {
      this.element.remove()
      return
    }
    this.manifestHref = this.manifestLink.getAttribute('href')
    if (/http:\/\//.test(this.manifestHref)) {
      console.error('必须是https的连接')
    }
    fetchJsonp(this.manifestHref).then(res => {
      return res.json()
    }).then(data => {
      let apps = data.related_applications
      if (!apps) {
        this.element.remove()
      }
      for (let app of apps) {
        if (app.platform === 'play') {
          let installAppUrl = app.install
          let openInAppUrl = app.open
          openButton.setup(anOpenButton, openInAppUrl, installAppUrl)
        }
      }
    })
  }
  // 提前渲染
  prerenderAllowed () {
    return true
  }
  // 插入文档时执行
  connectedCallback () {
    let element = this.element
    preProcess.isDismissed(element.id)
    util.css(element, {
      display: '',
      visibility: 'hidden'
    })
    if (platform.isIos()) {
      this.iosAppBanner()
    } else {
      this.andriodAppBanner()
    }
  }
}

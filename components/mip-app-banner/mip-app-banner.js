/**
 * @file mip-app-banner 组件
 *
 * @author wangpei07@baidu.com
 */
import './mip-app-banner.less'
let {CustomElement, util, viewer} = MIP
let platform = util.platform
let fetchJsonp = MIP.sandbox.fetchJsonp
let openButton = {
  setup: function (openButton, openInAppUrl, installAppUrl) {
    let self = this
    openButton.addEventListener('click', function () {
      self.onClick(openInAppUrl, installAppUrl)
    })
  },
  onClick: function (openInAppUrl, installAppUrl) {
    let timer = setTimeout(function () {
      window.top.location.href = installAppUrl
      console.log(installAppUrl)
      clearTimeout(timer)
      console.log(window.top.location.href)
    }, 1500)
    // 没有赋值成功？
    console.log(window.top.location.href)
    let visibilitychange = function () {
      let tag = document.hidden || document.webkitHidden
      tag && clearTimeout(timer)
    }

    document.addEventListener('visibilitychange', visibilitychange, false)
    document.addEventListener('webkitvisibilitychange', visibilitychange, false)
    window.addEventListener('pagehide', function () {
      clearTimeout(timer)
    }, false)
  }
}

let ls = {
  getSotrageKey: function (id) {
    return 'mip-app-banner:' + id
  },
  hasItem: function (id) {
    return !!localStorage.getItem(ls.getSotrageKey(id))
  },
  setSotrage: function (id) {
    localStorage.setItem(this.getSotrageKey(id), true)
  }
}

let dismissButton = {
  element: null,
  add: function (element) {
    this.element = element
    let dismissBtn = document.createElement('span')
    dismissBtn.classList.add('mip-app-banner-dismiss-button')
    dismissBtn.addEventListener('click', this.onClick.bind(this))
    element.appendChild(dismissBtn)
  },
  onClick: function () {
    ls.setSotrage(this.element.id)
    this.element.remove()
  }
}

let preProcess = {
  isDismissed: function (id) {
    return ls.hasItem(id)
  },
  init: function (element) {
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

export default class MipDemo extends CustomElement {
  constructor (...args) {
    // 继承父类属性、方法
    super(...args)
    this.openButton = openButton
  }
  canShowBanner () {
    this.isSysBanner = platform.isSafari() || platform.isBaidu()// || platform.isQQ();
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

  iosAppBanner () {
    let self = this
    if (!this.canShowBanner.call(self)) {
      // console.log("Ss")
      this.element.remove()
      // return
    }
    this.metaTag = document.head.querySelector('meta[name=apple-itunes-app]')
    let openButton1 = this.element.querySelector('button[open-button]')
    preProcess.init(this.element)
    let content = this.metaTag.getAttribute('content')
    let parts = content.replace(/\s/, '').split(',')
    let config = {}
    parts.forEach(function (part) {
      let params = part.split('=')
      config[params[0]] = params[1]
    })
    let appId = config['app-id']
    let openUrl = config['app-argument']
    let installAppUrl = 'https://itunes.apple.com/us/app/id' + appId
    let openInAppUrl = openUrl || installAppUrl
    openButton.setup(openButton1, openInAppUrl, installAppUrl)
  }

  andriodAppBanner () {
    let self = this
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

    fetchJsonp(this.manifestHref).then(function (res) {
      return res.json()
    }).then(function (data) {
      let apps = data.related_applications
      if (!apps) {
        self.element.remove()
      }
      for (let i = 0; i < apps.length; i++) {
        let app = apps[i]
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
  firstInviewCallback () {
    let self = this
    let element = self.element
    preProcess.isDismissed(element.id)
    util.css(this.element, {
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

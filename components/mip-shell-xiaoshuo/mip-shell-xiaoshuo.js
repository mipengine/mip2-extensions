/**
 * @file 极速服务 小说shell
 * @author liangjiaying@baidu.com (JennyL)
 * @author liujing37
 */

import './mip-shell-xiaoshuo.less'
import Catalog from './feature/catalog' // 侧边栏目录
import Footer from './feature/footer' // 底部控制栏
import Header from './feature/header' // shell导航头部
import {
  PageStyle,
  FontSize
} from './feature/setting' // 背景色调整，字体大小调整

import NovelEvents from './common/events'
import Strategy from './ad/strategyControl'
import {initAdByCache} from './ad/strategyCompute'
import {getJsonld, scrollBoundary, getCurrentWindow} from './common/util'
import state from './common/state'
import {sendWebbLog, sendTCLog, sendWebbLogCommon, sendWebbLogLink} from './common/log' // 日志

let novelEvents = new NovelEvents()
let strategy = new Strategy()
let util = MIP.util

export default class MipShellNovel extends MIP.builtinComponents.MipShell {
  // 继承基类 shell, 扩展小说shell
  constructor (...args) {
    super(...args)
    this.transitionContainsHeader = false
    // 处理浏览器上下滚动边界，关闭弹性
    scrollBoundary()
  }

  // 通过小说JS给dom添加预渲染字段
  connectedCallback () {
    // 从结果页进入小说阅读页加上预渲染的标识prerender，但是内部的每页不能加，会影响翻页内的预渲染
    if (this.element.getAttribute('prerender') !== null) {
      this.element.removeAttribute('prerender')
    }
    if (this.element.getAttribute('prerender') == null && MIP.viewer.page.isRootPage) {
      this.element.setAttribute('prerender', '')
    }
    // 页面初始化的时候获取缓存的主题色和字体大小修改整个页面的样式
    this.initPageLayout()
  }

  /**
   * 页面初始化的时候获取缓存的主题色和字体大小修改整个页面的样式
   *
   * @private initPageLayout
   */
  initPageLayout () {
    // 创建模式切换（背景色切换）
    this.pageStyle = new PageStyle()
    // 承接emit & broadcast事件：所有页面修改页主题 & 字号
    window.addEventListener('changePageStyle', (e, data) => {
      if (e.detail[0] && e.detail[0].theme) {
        // 修改主题
        this.pageStyle.update(e, {
          theme: e.detail[0].theme
        })
      } else if (e.detail[0] && e.detail[0].fontSize) {
        // 修改字号
        this.pageStyle.update(e, {
          fontSize: e.detail[0].fontSize
        })
      } else {
        // 初始化，从缓存中获取主题和字号apply到页面
        this.pageStyle.update(e)
      }
      document.body.classList.add('show-xiaoshuo-container')
      // 加载动画完成，发送白屏日志
      sendWebbLog('whitescreen')
      // 初始化页面结束后需要把「mip-shell-xiaoshuo-container」的内容页显示
      let xiaoshuoContainer = document.querySelector('.mip-shell-xiaoshuo-container')
      if (xiaoshuoContainer) {
        xiaoshuoContainer.classList.add('show-xiaoshuo-container')
      }
    })
    // 初始化页面时执行一次背景色+字号初始化
    window.MIP.viewer.page.emitCustomEvent(window, false, {
      name: 'changePageStyle'
    })
  }

  // 基类方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe颜色设置，通知所有iframe和根页面颜色改变
  bindAllEvents () {
    super.bindAllEvents()
    // 初始化所有内置对象
    // 创建模式切换（背景色切换）
    const {isRootPage, novelInstance, originalUrl} = state(window)
    const pageType = novelInstance.currentPageMeta.pageType || ''
    let zonghengPattern = /www.xmkanshu.com/g
    let iqiyiPattern = /wenxue.m.iqiyi.com/g
    let isZongheng = zonghengPattern.test(originalUrl)
    let isIqiyi = iqiyiPattern.test(originalUrl)
    let site
    if (isZongheng) {
      site = 'zongheng'
    }
    if (isIqiyi) {
      site = 'iqiyi'
    }
    sendTCLog('interaction', {
      type: 'b',
      action: 'pageShow'
    }, {
      show: 'pageShow',
      isRootPage: isRootPage,
      site: site
    })
    let prePageButton = document.querySelector('.navigator a:first-child')
    let nextPageButton = document.querySelector('.navigator a:last-child')
    // 监控页面底部上一页按钮跳转是否异常，异常发送异常日志
    sendWebbLogLink(prePageButton, 'prePageButton')
    // 监控页面底部下一页按钮跳转是否异常，异常发送异常日志
    sendWebbLogLink(nextPageButton, 'nextPageButton')
    // 用来记录翻页的次数，主要用来触发品专的广告
    novelInstance.novelPageNum++
    if (novelInstance.currentPageMeta.pageType === 'page') {
      novelInstance.readPageNum++
    }
    // 如果有前端广告缓存，则走此处的逻辑
    initAdByCache(novelInstance)

    // 暴露给外部html的调用方法，显示底部控制栏
    // 使用 on="tap:xiaoshuo-shell.showShellFooter"调用
    this.addEventAction('showShellFooter', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, true, {
        name: 'showShellFooter'
      })
    })
    // 暴露给外部html的调用方法, 显示目录侧边栏
    this.addEventAction('showShellCatalog', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, true, {
        name: 'showShellCatalog'
      })
    })
    // 功能绑定：背景色切换 使用 on="tap:xiaoshuo-shell.changeMode"调用
    this.addEventAction('changeMode', function (e, theme) {
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'changePageStyle',
        data: {
          theme: theme
        }
      })
    })

    // 绑定底部弹层控制条拖动事件
    this.addEventAction('showFontAdjust', e => this.fontSize.showFontBar(e))
    // 功能绑定：字体大小切换 使用 on="tap:xiaoshuo-shell.changeFont(bigger)"调用
    this.addEventAction('changeFont', (e, size) => {
      this.fontSize.changeFont(size)
    })

    // 绑定弹层点击关闭事件
    if (this.$buttonMask) {
      this.$buttonMask.onclick = this.closeEverything.bind(this)
    }

    strategy.eventAllPageHandler()
    // 绑定小说每个页面的监听事件，如翻页，到了每章最后一页
    novelEvents.bindAll()

    // 发送webb性能日志 , 请求common时 ,common 5s 请求失败，发送common异常日志
    if (document.querySelector('mip-custom')) {
      sendWebbLogCommon()
    }

    // 当页面翻页后，需要修改footer中【上一页】【下一页】链接
    if (!isRootPage) {
      let jsonld = getJsonld(window)
      window.MIP.viewer.page.emitCustomEvent(window.parent, false, {
        name: 'updateShellFooter',
        data: {
          'jsonld': jsonld
        }
      })
    }
    window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
      name: 'current-page-ready'
    })

    // 由于广告加载完成时才改变渲染完成字段，所以观察者模式监听广告渲染是否成功字段 window.MIP.ad
    setTimeout(() => {
      let name
      window.MIP.ad = {}
      function observer (oldVal, newVal) {
        if (newVal === true && (pageType !== 'detail')) {
          sendTCLog('interaction', {
            type: 'b',
            action: 'adShow'
          }, {
            show: 'adShow',
            hasAd: true,
            site: site
          })
          // 广告渲染是否成功字段，成功true，默认false，为监控show值改变，打点后置为false
          window.MIP.ad.show = false
        }
      }
      // 观察者模式监听广告渲染是否成功字段，定义广告show属性及其set和get方法
      Object.defineProperty(window.MIP.ad, 'show', {
        enumerable: true,
        configurable: true,
        get: function () {
          return name
        },
        set: function (val) {
          // 调用处理函数
          observer(name, val)
          name = val
        }
      })
    }, 0)
  }

  // 基类方法，翻页之后执行的方法
  // 记录翻页的白屏
  afterSwitchPage (options) {
    // 用于记录页面加载完成的时间
    const startRenderTime = novelEvents.timer
    const currentWindow = getCurrentWindow()
    let endRenderTimer = null
    currentWindow.onload = function () {
      endRenderTimer = new Date()
    }
    // 页面加载完成，记录时间，超过5s发送白屏日志
    setTimeout(function () {
      if (!endRenderTimer || endRenderTimer - startRenderTime > 5000) {
        sendWebbLog('stability', {
          msg: 'whiteScreen'
        })
      }
    }, 5000)
  }

  // 基类root方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe内部emitEvent, 调用根页面的shell bar弹出效果
  bindRootEvents () {
    super.bindRootEvents()
    // 承接emit事件：根页面底部控制栏内容更新
    window.addEventListener('updateShellFooter', (e) => {
      this.footer.updateDom(e.detail[0] && e.detail[0].jsonld)
    })
    // 承接emit事件：根页面展示底部控制栏
    window.addEventListener('showShellFooter', (e, data) => {
      this.footer.show(this)
      this.header.show()
      let swipeDelete = new util.Gesture(this.$buttonMask, {
        preventX: true
      })
      swipeDelete.on('swipeup', () => {
        this.closeEverything()
      })
      swipeDelete.on('swipedown', () => {
        this.closeEverything()
      })
    })
    // 承接emit事件：显示目录侧边栏
    window.addEventListener('showShellCatalog', (e, data) => {
      this.catalog.show(this)
      this.footer.hide()
      this.header.hide()
    })

    strategy.eventRootHandler()
    novelEvents.bindRoot()
  }

  /**
   * 基类root方法：异步初始化。用于除头部bar之外的元素，次方法是同步渲染，需要渲染初始的内容
   */
  renderOtherPartsAsync () {
    this.asyncInitObject()
  }

  /**
   * 异步渲染所有内置对象，包括底部控制栏，侧边栏，字体调整按钮，背景颜色模式切换
   *
   * @private asyncInitObject：小说内部私有方法，用于异步渲染逻辑
   */
  asyncInitObject () {
    let configMeta = this.currentPageMeta
    // 创建底部 bar
    this.footer = new Footer(configMeta.footer)
    this.footer.updateDom(getJsonld(window))
    // 创建目录侧边栏
    this.catalog = new Catalog(configMeta.catalog, configMeta.book)
    this.header = new Header(this.$el)
    // 创建字体调整事件
    this.fontSize = new FontSize()
    // 绑定 Root shell 字体bar拖动事件
    this.fontSize.bindDragEvent()
  }

  // 基类方法：页面跳转时，解绑当前页事件，防止重复绑定
  unbindHeaderEvents () {
    super.unbindHeaderEvents()
    // 在页面跳转的时候解绑之前页面的点击事件，避免事件重复绑定
    if (this.jumpHandler) {
      // XXX: window.MIP.util.event.deligate 返回了一个方法。再调用这个方法，就是解绑
      this.jumpHandler()
      this.jumpHandler = undefined
    }
  }

  /**
   * 关闭所有元素，包括弹层、目录、设置栏
   * @private closeEverything：关闭所有元素，包括弹层、目录、设置栏
   */

  closeEverything (e) {
    // 关闭所有可能弹出的bar
    this.toggleDOM(this.$buttonWrapper, false)
    this.footer.hide()
    this.header.hide()
    this.catalog.hide()
    this.fontSize.hideFontBar()
    // 关闭黑色遮罩
    this.toggleDOM(this.$buttonMask, false)
  }

  // 基类方法 每个页面执行：绑定头部弹层事件。
  bindHeaderEvents () {
    super.bindHeaderEvents()
    let event = window.MIP.util.event
    let me = this

    // 当页面目录点击触发跳转时，关闭所有的浮层（底部控件触发不关闭浮层）
    this.jumpHandler = event.delegate(document.documentElement, '.mip-shell-catalog-wrapper [mip-link]', 'click', function (e) {
      me.closeEverything()
    })
    // 当页面左上角返回按钮点击时，关闭所有的浮层
    this.jumpHandler = event.delegate(document.documentElement, '.mip-shell-header-wrapper a', 'click', function (e) {
      me.closeEverything()
      // 发送tc日志
      sendTCLog('interaction', {
        type: 'b',
        action: 'backButton'
      })
    })
  }

  // 基类方法: 处理头部自定义按钮点击事件，由于没有按钮，置空
  // handleShellCustomButton (buttonName) {
  // 如果后期需要增加bar按钮，增加如下配置：
  // "header": {
  //     "show": true,
  //     "title": "神武天帝",
  //     "buttonGroup": [
  //         {"name": "setting", "text": "设置"},
  //         {"name": "cancel", "text": "取消"}
  //     ]
  // }
  // }

  // 基类方法：页面跳转后shell可刷新
  // refreshShell (...args) {
  //   super.refreshShell(...args)
  // }

  // 基类方法 非root执行：页面跳转后更新shell
  // updateOtherParts () {
  //   super.updateOtherParts()
  //   // 重新渲染footer
  //   // this.footer._render(this.currentPageMeta.footer)
  // }

  // 基类方法，设置默认的shellConfig
  processShellConfig (shellConfig) {
    MIP.novelInstance = this
    this.shellConfig = shellConfig
    this.novelPageNum = 0
    this.currentPageType = []
    shellConfig.routes.forEach(routerConfig => {
      routerConfig.meta.header.bouncy = false
    })
  }

  // 基类方法，在页面翻页时页面由于alwaysReadOnLoad为true重新刷新，因此shell的config需要重新配置
  // matchIndex是用来标识它符合了哪个路由，根据不同的路由修改不同的配置
  processShellConfigInLeaf (shellConfig, matchIndex) {
    shellConfig.routes[matchIndex].meta.header.bouncy = false
  }

  prerenderAllowed () {
    return true
  }
}

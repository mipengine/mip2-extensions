/**
 * @file 极速服务 小说shell
 * @author liangjiaying@baidu.com (JennyL)
 * @author liujing37
 */

import './mip-shell-xiaoshuo.less'
import Catalog from './feature/catalog' // 侧边栏目录
import Footer from './feature/footer' // 底部控制栏
import Header from './feature/header' // shell导航头部
import {Constant} from './common/constant-config'
import {
  PageStyle,
  FontSize
} from './feature/setting' // 背景色调整，字体大小调整

import XiaoshuoEvents from './common/events'
import Strategy from './ad/strategy'
import {getJsonld, scrollBoundary, getCurrentWindow} from './common/util'
import {sendWebbLog, sendTCLog} from './common/log' // 日志
import { setTimeout } from 'timers'
// import { log } from 'util'

let xiaoshuoEvents = new XiaoshuoEvents()
let strategy = new Strategy()
let util = MIP.util

export default class MipShellXiaoshuo extends MIP.builtinComponents.MipShell {
  // 继承基类 shell, 扩展小说shell
  constructor (...args) {
    super(...args)
    this.transitionContainsHeader = false
    // 处理浏览器上下滚动边界，关闭弹性
    scrollBoundary()
    this.pageNum = 0
  }

  // 基类方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe颜色设置，通知所有iframe和根页面颜色改变
  bindAllEvents () {
    super.bindAllEvents()
    // 初始化所有内置对象
    // 创建模式切换（背景色切换）
    this.pageStyle = new PageStyle()
    const isRootPage = MIP.viewer.page.isRootPage
    // 用来记录翻页的次数，主要用来触发品专的广告
    let currentWindow = isRootPage ? window : window.parent
    currentWindow.MIP.mipshellXiaoshuo.novelPageNum++

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
    window.MIP.viewer.page.emitCustomEvent(window, true, {
      name: 'changePageStyle'
    })

    strategy.eventAllPageHandler()

    // 绑定小说每个页面的监听事件，如翻页，到了每章最后一页
    xiaoshuoEvents.bindAll()
    // 获取当前页面的数据，以及需要预渲染的链接
    let jsonld = getJsonld(getCurrentWindow())
    // 预渲染
    this.readerPrerender(jsonld)
  }

  /**
   * 小说预渲染
   *
   * @param {Object} jsonld 模板数据，用于更新footer的链接
   */
  readerPrerender (jsonld) {
    let nextPageUrl = jsonld.nextPage.url
    let prePageUrl = jsonld.previousPage.url
    if (window.MIP.util.isCacheUrl(location.href)) { // 处于cache下，需要转换cacheUrl
      window.MIP.viewer.page.prerender([this.getCacheUrl(nextPageUrl), this.getCacheUrl(prePageUrl)])
        .then(iframes => {
          console.log('prerender done')
          this.updateFooterDom()
        })
    } else {
      window.MIP.viewer.page.prerender([nextPageUrl, prePageUrl])
        .then(iframes => {
          console.log('prerender done')
          this.updateFooterDom()
        })
    }
  }

  /**
   * 拼接cacheUrl
   *
   * @param {string} url 需要被拼接的url
   * @returns {string} 返回的cacheURl
   */
  getCacheUrl (url) {
    let netUrl = url.split('/')[2].split('.').join('-')
    return `https://${netUrl}.mipcdn.com${MIP.util.makeCacheUrl(url)}`
  }

  /**
   * 更新footer链接
   *
   */
  updateFooterDom () {
    // 页面配置的数据
    let footerConfig = getJsonld(getCurrentWindow())
    if (window.MIP.util.isCacheUrl(location.href)) { // cache页，需要改变翻页的地址为cache地址
      footerConfig.nextPage.url = this.getCacheUrl(footerConfig.nextPage.url)
      footerConfig.previousPage.url = this.getCacheUrl(footerConfig.previousPage.url)
    }
    window.MIP.viewer.page.emitCustomEvent(getCurrentWindow().parent, false, {
      name: 'updateShellFooter',
      data: {
        'jsonld': footerConfig
      }
    })
  }

  /**
   * 更新footer，禁用翻页
   *
   */
  updateFooterDomDisabled () {
    let footerConfig = getJsonld(getCurrentWindow())
    footerConfig.nextPage.url = ''
    footerConfig.previousPage.url = ''
    // getCurrentWindow是为了兼容结果页，结果页的window是baidu.com，会跨域，需要获取当前window
    window.MIP.viewer.page.emitCustomEvent(getCurrentWindow().parent, false, {
      name: 'updateShellFooter',
      data: {
        'jsonld': footerConfig
      }
    })
  }

  // 基类方法，翻页之后执行的方法
  // 记录翻页的白屏
  afterSwitchPage (params) {
    console.log(params)
    // 如果不是预渲染的页面而是已经打开过的页面，手动触发更新footer
    if (!params.isPrerender) {
      this.updateFooterDom()
    }
    // 处理下容错，3s发起检测footer的链接是否为空，是则重新更新footer
    setTimeout(() => {
      let nextBtn = this.footer.$footerWrapper.querySelector('.page-next')
      let previousBtn = this.footer.$footerWrapper.querySelector('.page-previous')
      if (nextBtn.href === '' && previousBtn.href === '') { // footer的链接为空，重新更新footer
        this.updateFooterDom()
      }
    }, 3000)
    // 用于记录页面加载完成的时间
    const startRenderTime = xiaoshuoEvents.timer
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

    // 承接下一页点击事件
    window.addEventListener(Constant.NEXT_PAGE_BUTTON_CLICK, e => {
      let btn = this.footer.$footerWrapper.querySelector('.page-next')
      if (btn.href) { // 翻页链接空白则阻止
        setTimeout(() => {
          this.updateFooterDomDisabled()
        }, 16)
      }
    })

    // 承接上一页点击事件
    window.addEventListener(Constant.PREVIOUS_PAGE_BUTTON_CLICK, e => {
      let btn = this.footer.$footerWrapper.querySelector('.page-previous')
      if (btn.href) { // 翻页链接空白则阻止
        setTimeout(() => {
          this.updateFooterDomDisabled()
        }, 16)
      }
    })

    strategy.eventRootHandler()
    xiaoshuoEvents.bindRoot()
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
    let footerConfig = getJsonld(window)
    if (window.MIP.util.isCacheUrl(location.href)) { // cache页，需要改变翻页的地址为cache地址
      footerConfig.nextPage.url = this.getCacheUrl(footerConfig.nextPage.url)
      footerConfig.previousPage.url = this.getCacheUrl(footerConfig.previousPage.url)
    }
    this.footer = new Footer(configMeta.footer)
    this.footer.updateDom(footerConfig)
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
    MIP.mipshellXiaoshuo = this
    this.shellConfig = shellConfig
    this.novelPageNum = 0
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

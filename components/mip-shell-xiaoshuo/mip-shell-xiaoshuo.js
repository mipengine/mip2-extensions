/**
 * @file 极速服务 小说shell
 * @author liangjiaying@baidu.com (JennyL)
 * TODO:
 * 1. 可以把继承的方法自己的方法分开
 * 2. 用 JSDoc @private 来标识私有函数
 */

import './mip-shell-xiaoshuo.less'
import Catalog from './feature/catalog' // 侧边栏目录
import Footer from './feature/footer' // 底部控制栏
import Header from './feature/header' // shell导航头部
import {
  PageStyle,
  FontSize
} from './feature/setting' // 背景色调整，字体大小调整

import XiaoshuoEvents from './common/events'
import Strategy from './ad/strategy'
import getJsonld from './common/util'
import state from './common/state'

let viewer = MIP.viewer
let xiaoshuoEvents = new XiaoshuoEvents()
let strategy = new Strategy()
let util = MIP.util
let timerScroll
let whiteScreen
let hasCustom = false

export default class MipShellXiaoshuo extends MIP.builtinComponents.MipShell {
  // 继承基类 shell, 扩展小说shell
  constructor (...args) {
    super(...args)
    timerScroll = setTimeout(() => {
      console.log('5s constructor ')
      whiteScreen = true
      viewer.sendMessage('stability-log', {
        info: {
          white: whiteScreen
        },
        dim: { pd: 'novel' }
      })
    }, 5000)
    // let timer1 = setTimeout(()=>{
    //   console.log("1s")
    //   super(...args)
    // },1000)
    console.log('window11111')
    // 发送白屏  (页面打开白屏超过5秒，文字不可见) 日志
    // this.whitecreen()
    this.transitionContainsHeader = false
    // 处理浏览器上下滚动边界，关闭弹性
    this._scrollBoundary()

    console.log('window333333')
  }

  // // 发送白屏日志打点
  // build () {
  //   timer = setTimeout(()=>{
  //     console.log("白屏")
  //     console.log("window")
  //     console.log(window)
  //     console.log("Top")
  //     console.log(top)
  //   },0)
  // }

  // 发送 搜索点出/二跳 日志
  sendIsRootPageMessage (isRootPage) {
    viewer.sendMessage('interaction-log', {
      info: {
        isRootPage: isRootPage,
        search: 'click'
      },
      dim: { pd: 'novel' }
    })
  }

  // 基类方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe颜色设置，通知所有iframe和根页面颜色改变
  bindAllEvents () {
    console.log('bindAllEvents1')
    super.bindAllEvents()
    console.log('bindAllEvents2d')
    // 初始化所有内置对象
    // 创建模式切换（背景色切换）
    this.pageStyle = new PageStyle()
    const isRootPage = MIP.viewer.page.isRootPage

    if (isRootPage) {
      this.sendIsRootPageMessage(isRootPage)
    }
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
      this.$buttonMask.onclick = this._closeEverything.bind(this)
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
    //  小说最后一个事件执行完后
    //  非白屏，清除发送，测得白屏率
    whiteScreen = false
    clearTimeout(timerScroll)

    //  文末凤巢广告填充率 发送日志
    this.customReady()
  }

  //  文末凤巢广告填充率 发送日志
  customReady () {
    let currentWindow = this.getCurrentWindow()
    const {isLastPage} = state(currentWindow)
    if (isLastPage) {
      let custom = document.querySelector('mip-custom')
      hasCustom = !!(custom && custom.childNodes && !(custom.style.display === 'none'))
      if (!hasCustom) {
        viewer.sendMessage('stability-log', {
          info: {
            mipCustom: hasCustom
          },
          dim: { pd: 'novel' }
        })
      }
    }
  }

  getCurrentWindow () {
    let pageId = window.MIP.viewer.page.currentPageId
    let pageInfo = window.MIP.viewer.page.getPageById(pageId)
    return pageInfo.targetWindow
  }

  // 基类root方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe内部emitEvent, 调用根页面的shell bar弹出效果
  bindRootEvents () {
    //
    // let timer1 = setTimeout(()=>{
    //   console.log("3s bindRootEvents ")
    //
    // },3000)

    console.log('bindRootEvents1')
    super.bindRootEvents()
    console.log('bindRootEvents2')
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
        this._closeEverything()
      })
      swipeDelete.on('swipedown', () => {
        this._closeEverything()
      })
    })
    // 承接emit事件：显示目录侧边栏
    window.addEventListener('showShellCatalog', (e, data) => {
      this.catalog.show(this)
      this.footer.hide()
      this.header.hide()
    })

    strategy.eventRootHandler()
    xiaoshuoEvents.bindRoot()
  }

  // 基类root方法：初始化。用于除头部bar之外的元素
  renderOtherParts () {
    console.log('renderOtherParts')
    super.renderOtherParts()
    // 初始化所有内置对象，包括底部控制栏，侧边栏，字体调整按钮，背景颜色模式切换
    this._initAllObjects()
  }

  // 自有方法：关闭所有元素，包括弹层、目录、设置栏
  _closeEverything (e) {
    console.log('_closeEverything')
    // 关闭所有可能弹出的bar
    this.toggleDOM(this.$buttonWrapper, false)
    this.footer.hide()
    this.header.hide()
    this.catalog.hide()
    this.fontSize.hideFontBar()
    // 关闭黑色遮罩
    this.toggleDOM(this.$buttonMask, false)
  }

  // 自有方法 仅root：初始化所有内置对象，包括底部控制栏，侧边栏，字体调整按钮，背景颜色模式切换
  _initAllObjects () {
    console.log('_initAllObjects')
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

  // 基类方法 每个页面执行：绑定头部弹层事件。
  bindHeaderEvents () {
    super.bindHeaderEvents()

    // let timer1 = setTimeout(()=>{
    //   console.log("3s bindHeaderEvents ")
    //
    // },3000)

    //  模拟白屏
    // while (true) {
    //   console.log("ddd")
    // }

    console.log('bindHeaderEvents2')
    let event = window.MIP.util.event
    let me = this

    // 当页面目录点击触发跳转时，关闭所有的浮层（底部控件触发不关闭浮层）
    this.jumpHandler = event.delegate(document.documentElement, '.mip-shell-catalog-wrapper [mip-link]', 'click', function (e) {
      me._closeEverything()
    })
    // 当页面左上角返回按钮点击时，关闭所有的浮层
    this.jumpHandler = event.delegate(document.documentElement, '.mip-shell-header-wrapper a', 'click', function (e) {
      me._closeEverything()
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
    // let timer1 = setTimeout(()=>{
    //   console.log("3s processShellConfig ")
    //
    // },3000)
    console.log('processShellConfig')
    MIP.mipshellXiaoshuo = this
    this.shellConfig = shellConfig
    shellConfig.routes.forEach(routerConfig => {
      routerConfig.meta.header.bouncy = false
    })
  }

  // 基类方法，在页面翻页时页面由于alwaysReadOnLoad为true重新刷新，因此shell的config需要重新配置
  // matchIndex是用来标识它符合了哪个路由，根据不同的路由修改不同的配置
  processShellConfigInLeaf (shellConfig, matchIndex) {
    console.log('processShellConfigInLeaf')
    shellConfig.routes[matchIndex].meta.header.bouncy = false
  }
  /**
   * 滚动边界处理
   */
  _scrollBoundary () {
    console.log('_scrollBoundary')

    let touchStartEvent
    let {
      rect,
      css
    } = MIP.util
    // 收集body child元素 并进行包裹
    let scrollaBoundaryTouch = document.createElement('div')
    let offsetHeight
    let bodyPaddingTop
    let body = document.body
    let touchTarget
    let stopProFun = e => e.stopPropagation()

    scrollaBoundaryTouch.setAttribute('mip-shell-scrollboundary', true);
    [].slice.call(body.children).forEach(child => {
      if (/^(SCRIPT|IFRAME|MIP-SHELL|MIP-DATA)/.test(child.nodeName)) {
        return
      }
      scrollaBoundaryTouch.appendChild(child)
    })
    body.appendChild(scrollaBoundaryTouch)

    // 添加事件处理
    scrollaBoundaryTouch.addEventListener('touchstart', e => {
      touchStartEvent = e
      // 内滚 兼容处理
      touchTarget = this.getClosestScrollElement(e.target)
      if (touchTarget) {
        touchTarget.addEventListener('touchmove', stopProFun)
      }
    })

    scrollaBoundaryTouch.addEventListener('touchmove', e => {
      let touchRect = e.targetTouches[0]
      let startTouchReact = touchStartEvent.targetTouches[0]

      // 兼容模式处理
      offsetHeight = document.compatMode === 'BackCompat'
        ? document.body.clientHeight
        : document.documentElement.clientHeight

      bodyPaddingTop = bodyPaddingTop || parseInt(css(body, 'paddingTop'), 10)
      let scrollTop = body.scrollTop || rect.getScrollTop()
      let scrollHeight = rect.getElementRect(scrollaBoundaryTouch).height + bodyPaddingTop

      // 到达顶部时 && 是向下滚动操作
      // 到达底部时 && 并且 向上滚动操作
      let isprevent = (
        touchRect.pageY >= startTouchReact.pageY &&
        touchRect.clientY > startTouchReact.clientY &&
        scrollTop < 5) ||
        (
          touchRect.pageY < startTouchReact.pageY &&
          scrollTop + offsetHeight >= scrollHeight
        )
      if (isprevent) {
        e.preventDefault()
      }
      e.stopPropagation()
    })

    scrollaBoundaryTouch.addEventListener('touchend', () => {
      if (touchTarget) {
        touchTarget.removeEventListener('touchmove', stopProFun)
      }
    })
  }

  /**
   * 获取上级可scroll的元素
   *
   * @param {Object} element 目标元素
   */
  getClosestScrollElement (element) {
    console.log('getClosestScrollElement')
    while (element && !element.getAttribute('mip-shell-scrollboundary')) {
      if (MIP.util.css(element, 'overflow-y') === 'auto' && element.clientHeight < element.scrollHeight) {
        return element
      }
      element = element.parentNode
    }
    return null
  }
}

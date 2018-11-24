import {setTimeout, clearTimeout} from 'timers'
import {sendTCLog} from './log'
import {getCacheUrl, getJsonld, getPrerenderJsonld, getCurrentWindow} from './util'
import state from './state'
import './../mip-shell-xiaoshuo.less'

let currentWindow = getCurrentWindow()
let reader = currentWindow.document.querySelector('#mip-reader-warp')
let timer
let pageIdQuery = {
  pre: '',
  next: ''
}

/**
 * 无限下拉loading动画
 */
function loadingDom () {
  return `<div class="loading-view seen-list-book-loading">
            <span data-v-4e3483cd="" class="circle"></span>
            <span data-v-4e3483cd="" class="loading-label">正在加载...</span>
          </div>`
}

export default class Scroll {
  constructor () {
    let jsonld = getPrerenderJsonld()
    pageIdQuery.pre = getCacheUrl(jsonld.previousPage.url)
    pageIdQuery.next = getCacheUrl(jsonld.nextPage.url)
    this.flag = {
      pre: true,
      next: true
    }
    this.loading = false
  }
  /**
   * 初始化小说阅读器环境
   *
   * @public
   */
  init () {
    // 添加正在加载样式
    let div = document.createElement('div')
    div.setAttribute('id', 'loading1')
    let loadingHTML = loadingDom()
    div.innerHTML = loadingHTML
    reader.appendChild(div)
  }
  init2 () {
    // 添加正在加载样式
    let warp = currentWindow.document.querySelector('#mip-reader-warp > div')
    let div = document.createElement('div')
    div.setAttribute('id', 'loading2')
    let loadingHTML = loadingDom()
    div.innerHTML = loadingHTML
    reader.insertBefore(div, warp)
  }
  /**
   * 滚动开始函数
   *
   * @public
   */
  start () {
    clearTimeout(timer)
    if (!this.isScrollToPageBottom() && !this.isScrollToPageTop()) {
      timer = setTimeout(this.start.bind(this), 500)
    } else if (this.isScrollToPageBottom()) {
      if (this.loading) {
        return
      }
      if (!pageIdQuery.next) {
        if (this.flag.next) {
          this.flag.next = false
          this.loadingStr('loading1', '您已阅读完全部更新章节')
          this.loading = false
        }
        clearTimeout(timer)
        timer = setTimeout(this.start.bind(this), 500)
        return
      }
      this.loading = true
      this.prerenderNext(pageIdQuery.next)
    } else if (this.isScrollToPageTop()) {
      if (this.loading) {
        return
      }
      if (!pageIdQuery.pre) {
        if (this.flag.pre) {
          this.flag.pre = false
          this.loadingStr('loading2', '您已阅读到第一章')
          this.loading = false
        }
        clearTimeout(timer)
        timer = setTimeout(this.start.bind(this), 500)
        return
      }
      this.loading = true
      this.prerenderPre(pageIdQuery.pre)
    }
  }

  destroy () {
    clearTimeout(timer)
  }

  prerenderNext (url) {
    const {isRootPage} = state(window)
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let jsonld = getJsonld(iframe[0].contentWindow)
        let {dom, id} = this.getPageDom(iframe[0], pageId, jsonld.currentPage)
        this.appendDom(dom, id)
        pageIdQuery.next = getCacheUrl(jsonld.nextPage.url)
        currentWindow.MIP.viewer.page.children = []
        if (!isRootPage) {
          currentWindow.parent.MIP.viewer.page.children = [window.MIP.viewer.page]
        }
        iframe[0].parentNode.removeChild(iframe[0])
        this.tcLog()
        this.loading = false
        this.start()
      }
    }).catch(() => {
      this.loadingError('loading1')
    })
  }

  prerenderPre (url) {
    const {isRootPage} = state(window)
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let jsonld = getJsonld(iframe[0].contentWindow)
        let {dom, id} = this.getPageDom(iframe[0], pageId, jsonld.currentPage)
        this.insertDom(dom, id)
        pageIdQuery.pre = getCacheUrl(jsonld.previousPage.url)
        currentWindow.MIP.viewer.page.children = []
        if (!isRootPage) {
          currentWindow.parent.MIP.viewer.page.children = [window.MIP.viewer.page]
        }
        iframe[0].parentNode.removeChild(iframe[0])
        this.tcLog()
        this.loading = false
        setTimeout(this.start.bind(this), 0)
      }
    }).catch(() => {
      this.loadingError('loading2')
    })
  }

  getPageDom (iframe, pageId, currentPage) {
    let nextdocument = iframe.contentWindow.document
    let readwarp = nextdocument.getElementById('mip-reader-warp').childNodes
    readwarp[1].style.padding = '0 .32rem'
    readwarp[1].lastElementChild.style.display = 'none'

    if (currentPage.isFirstPage !== undefined && !currentPage.isFirstPage) {
      let title = readwarp[1].querySelector('h2.title')
      title.style.display = 'none'
    } else {
      let title = readwarp[1].querySelector('h2.title')
      title.style.margin = '1.5rem 0'
    }

    let downloadNode = readwarp[1].querySelector('.zhdown-inner') || readwarp[1].querySelector('.top-download') || ''
    if (downloadNode) {
      downloadNode.style.display = 'none'
    }
    return {
      dom: readwarp[1],
      id: pageId
    }
  }

  insertDom (dom, id) {
    let warp = currentWindow.document.querySelector('#mip-reader-warp > #loading2 + div')
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, warp)
    let height = div.offsetHeight + 49
    currentWindow.MIP.viewport.setScrollTop(height)
  }

  appendDom (dom, id) {
    let loading1 = document.querySelector('#loading1')
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, loading1)
  }

  getViewportSize (w) {
    return {w: document.documentElement.clientWidth, h: document.documentElement.clientHeight}
  }

  loadingStr (id, str) {
    let div = document.getElementById(id)
    div.querySelector('.circle').style.display = 'none'
    div.querySelector('.loading-label').innerHTML = str
  }

  /**
   * 判断滚动条是否在页面底部
   *
   * @private isScrollToPageBottom：小说内部私有方法，判断滚动条是否在页面底部
   */
  isScrollToPageBottom () {
    // 文档高度
    let documentHeight = reader.offsetHeight
    let viewPortHeight = currentWindow.MIP.viewport.getRect().height
    let scrollHeight = currentWindow.MIP.viewport.getScrollTop()
    return documentHeight - viewPortHeight - scrollHeight < 10
  }
  /**
   * 发送pv展现日志
   *
   * @private
   */
  tcLog () {
    sendTCLog('interaction', {
      type: 'o',
      action: 'unlimitedPulldownPageShow'
    })
  }
  /**
   * 判断是否触顶
   *
   * @private
   */
  isScrollToPageTop () {
    let scrollHeight = currentWindow.MIP.viewport.getScrollTop()
    return scrollHeight < 2
  }
  /**
   * 加载失败函数
   *
   * @private
   */

  loadingError (id) {
    clearTimeout(timer)
    this.loadingStr(id, '加载失败，点击刷新')
    this.loading = false
    let dom = document.getElementById(id)
    dom.onclick = () => {
      dom.innerHTML = loadingDom()
      this.start()
    }
  }
}

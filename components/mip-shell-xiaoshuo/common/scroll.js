import {setTimeout, clearTimeout} from 'timers'
import {sendTCLog} from './log'
import {getCacheUrl, getJsonld, getPrerenderJsonld, getCurrentWindow} from './util'
import './../mip-shell-xiaoshuo.less'

let currentWindow = getCurrentWindow()
let reader = currentWindow.document.querySelector('#mip-reader-warp')
let timer
let pageIdQuery = {
  pre: '',
  next: ''
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
  }
  /**
   * 滚动开始函数
   *
   * @public
   */
  start () {
    clearTimeout(timer)
    if (!this.isScrollToPageBottom() && !this.isScrollToPageTop()) {
      timer = setTimeout(this.start.bind(this), 900)
    } else if (this.isScrollToPageBottom()) {
      if (document.getElementById('loading')) {
        return
      }
      if (!pageIdQuery.next) {
        if (this.flag.next) {
          this.loading('已经到达最后一页')
          this.flag.next = false
          setTimeout(this.removeLoading.bind(this), 1000)
        } else {
          clearTimeout(timer)
          timer = setTimeout(this.start.bind(this), 900)
        }
        return
      }
      this.loading('正在加载中...')
      this.prerenderNext(pageIdQuery.next)
    } else if (this.isScrollToPageTop()) {
      if (document.getElementById('loading')) {
        return
      }
      if (!pageIdQuery.pre) {
        if (this.flag.pre) {
          this.loading('已经到达第一页')
          this.flag.pre = false
          setTimeout(this.removeLoading.bind(this), 1000)
        } else {
          clearTimeout(timer)
          timer = setTimeout(this.start.bind(this), 900)
        }
        return
      }
      this.loading('正在加载中...')
      this.prerenderPre(pageIdQuery.pre)
    }
  }

  destroy () {
    clearTimeout(timer)
    let div = document.getElementById('loading')
    div && document.body.removeChild(div)
  }

  prerenderNext (url) {
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let jsonld = getJsonld(iframe[0].contentWindow)
        let {dom, id} = this.getPageDom(iframe[0], pageId, jsonld.currentPage)
        this.appendDom(dom, id)
        pageIdQuery.next = getCacheUrl(jsonld.nextPage.url)
        currentWindow.MIP.viewer.page.children = []
        iframe[0].parentNode.removeChild(iframe[0])
        this.tcLog()
        this.removeLoading()
      }
    }).catch(() => {
      this.getError()
    })
  }

  prerenderPre (url) {
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let jsonld = getJsonld(iframe[0].contentWindow)
        let {dom, id} = this.getPageDom(iframe[0], pageId, jsonld.currentPage)
        this.insertDom(dom, id)
        pageIdQuery.pre = getCacheUrl(jsonld.previousPage.url)
        currentWindow.MIP.viewer.page.children = []
        iframe[0].parentNode.removeChild(iframe[0])
        this.tcLog()
        setTimeout(this.removeLoading.bind(this), 0)
      }
    }).catch(() => {
      this.getError()
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
    let warp = currentWindow.document.querySelector('#mip-reader-warp > div')
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, warp)
    let height = div.offsetHeight
    currentWindow.MIP.viewport.setScrollTop(height)
  }

  appendDom (dom, id) {
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.appendChild(div)
  }

  getViewportSize (w) {
    return {w: document.documentElement.clientWidth, h: document.documentElement.clientHeight}
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
  getError () {
    this.loadingError()
  }
  loading (str) {
    let div = document.createElement('div')
    div.innerHTML = str
    div.setAttribute('id', 'loading')
    document.body.appendChild(div)
  }

  loadingError () {
    let div = document.getElementById('loading')
    if (div) {
      div.innerHTML = '加载失败, 点击刷新'
    }
    div.onclick = this.removeLoading()
  }
  removeLoading () {
    let div = document.getElementById('loading')
    div && document.body.removeChild(div)
    this.start()
  }
}

import {setTimeout, clearTimeout} from 'timers'
import {getCacheUrl, getJsonld, getPrerenderJsonld, getCurrentWindow} from './util'
import './../mip-shell-xiaoshuo.less'

let reader = document.querySelector('#mip-reader-warp')
let warp = document.querySelector('#mip-reader-warp > .reader')
let currentWindow = getCurrentWindow()
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
  }

  start () {
    clearTimeout(timer)
    if (!this.isScrollToPageBottom() && !this.isScrollToPageTop()) {
      timer = setTimeout(this.start.bind(this), 900)
    } else if (this.isScrollToPageBottom()) {
      if (document.getElementById('loadingNext')) {
        return
      }
      this.loadingNext()
      // let url = pageIdQuery[pageIdQuery.length-1]
      // currentWindow.MIP.viewer.page.replace(url, {skipRender: true})

      this.prerenderNext(pageIdQuery.next)
    } else if (this.isScrollToPageTop()) {
      if (document.getElementById('loadingPre')) {
        return
      }
      this.loadingPre()
      // let url = pageIdQuery[0]
      // currentWindow.MIP.viewer.page.replace(url, {skipRender: true})
      this.prerenderPre(pageIdQuery.pre)
    }
  }

  prerenderNext (url) {
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let {dom, id} = this.getPageDom(iframe[0], pageId)
        this.appendDom(dom, id)
        let jsonld = getJsonld(iframe[0].contentWindow)
        pageIdQuery.next = getCacheUrl(jsonld.nextPage.url)
        currentWindow.MIP.viewer.page.children = []
        iframe[0].parentNode.removeChild(iframe[0])
        this.removeNextLoading()
      }
    })
  }

  prerenderPre (url) {
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let {dom, height, id} = this.getPageDom(iframe[0], pageId)
        this.insertDom(dom, id, height)
        let jsonld = getJsonld(iframe[0].contentWindow)
        pageIdQuery.pre = getCacheUrl(jsonld.previousPage.url)
        currentWindow.MIP.viewer.page.children = []
        iframe[0].parentNode.removeChild(iframe[0])
        this.removePreLoading()
      }
    })
  }

  getPageDom (iframe, pageId) {
    // iframe.style.left = 9999999
    // iframe.style.position = 'absolute'
    // iframe.style.display = 'block'
    let nextdocument = iframe.contentWindow.document
    let readwarp = nextdocument.getElementById('mip-reader-warp').childNodes
    return {
      dom: readwarp[1],
      id: pageId,
      height: 2713
    }
  }

  insertDom (dom, id, height) {
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, warp)
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
    return documentHeight - viewPortHeight - scrollHeight < 1000
  }

  isScrollToPageTop () {
    let scrollHeight = currentWindow.MIP.viewport.getScrollTop()
    return scrollHeight < 2
  }

  loadingNext () {
    let div = document.createElement('div')
    div.innerHTML = '正在加载后续章节'
    div.setAttribute('id', 'loadingNext')
    document.body.appendChild(div)
  }

  loadingPre () {
    let div = document.createElement('div')
    div.innerHTML = '正在加载前面章节'
    div.setAttribute('id', 'loadingPre')
    document.body.appendChild(div)
  }

  loadingError () {
    let div = document.getElementById('loading')
    if (div) {
      div.innerHTML = '加载失败'
    }
  }
  removePreLoading () {
    let div = document.getElementById('loadingPre')
    div && document.body.removeChild(div)
    this.start()
  }

  removeNextLoading () {
    let div = document.getElementById('loadingNext')
    div && document.body.removeChild(div)
    this.start()
  }
}

/**
 * file: 无限下拉demo文件
 *
 * 因为是demo，小流量上线，没有改变原有dom结构，所以文件中涉及大量js操作dom
 * @author: guoshuang
 */

import {setTimeout, clearTimeout} from 'timers'
import {getCacheUrl, getJsonld, getPrerenderJsonld, getCurrentWindow, getParamFromString} from './util'
import {sendReadTypePvTcLog} from './log'
import './../mip-shell-xiaoshuo.less'

let currentWindow = getCurrentWindow()
let reader = currentWindow.document.querySelector('#mip-reader-warp')

let pageIdQuery = {
  pre: '',
  next: ''
}

/**
 * 无限下拉loading动画
 */
function loadingDom () {
  return '<div class="loading-view seen-list-book-loading"><span data-v-4e3483cd="" class="circle"></span><span data-v-4e3483cd="" class="loading-label">正在加载...</span></div>'
}

export default class Scroll {
  constructor () {
    let jsonld = getPrerenderJsonld()
    pageIdQuery.previousPage = getCacheUrl(jsonld.previousPage.url)
    pageIdQuery.nextPage = getCacheUrl(jsonld.nextPage.url)
    // 是否存在上一页、下一页的标记
    this.flag = {
      pre: true,
      next: true
    }
    // 是否加载中
    this.loading = false
    // 是否渲染失败
    this.loadingErrorFlag = false
    this.timer = null
  }

  /**
   * 初始化小说阅读器环境
   *
   * @public
   */
  init () {
    // 给body上添加无限下拉标识
    currentWindow.document.body.setAttribute('load-type', 'infinite')
    this.initLoadingTop()
    // 添加正在加载样式
    let div = document.createElement('div')
    div.setAttribute('id', 'infinite-loading-bottom')
    let loadingHTML = loadingDom()
    div.innerHTML = loadingHTML
    reader.appendChild(div)
  }

  /**
   * 小说阅读器顶部添加loading
   *
   * @private
   */
  initLoadingTop () {
    // 添加正在加载样式
    let warp = currentWindow.document.querySelector('#mip-reader-warp > div')
    let div = document.createElement('div')
    div.setAttribute('id', 'infinite-loading-top')
    let loadingHTML = loadingDom()
    div.innerHTML = loadingHTML
    reader.insertBefore(div, warp)
    // 按照ue指示，设定首屏title与浏览器上边距之间的距离
    currentWindow.MIP.viewport.setScrollTop(70)
  }

  /**
   * 滚动开始函数
   *
   * @public
   */
  start () {
    clearTimeout(this.timer)
    if (!this.isScrollToPageBottom() && !this.isScrollToPageTop()) {
      // center
      this.timer = setTimeout(this.start.bind(this), 500)
    } else if (this.isScrollToPageBottom()) {
      // bottom
      if (this.loading) {
        return
      }
      if (!pageIdQuery.nextPage) {
        if (this.flag.next) {
          this.flag.next = false
          this.loadingStr('infinite-loading-bottom', '您已阅读完全部更新章节')
          this.loading = false
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(this.start.bind(this), 500)
        return
      }
      this.loading = true
      this.prerender(pageIdQuery.nextPage, this.appendDom, 'nextPage', 'infinite-loading-bottom')
    } else if (this.isScrollToPageTop()) {
      // top
      if (this.loading) {
        return
      }
      if (!pageIdQuery.previousPage) {
        if (this.flag.pre) {
          this.flag.pre = false
          this.loadingStr('infinite-loading-top', '您已阅读到第一章')
          this.loading = false
        }
        clearTimeout(this.timer)
        this.timer = setTimeout(this.start.bind(this), 500)
        return
      }
      this.loading = true
      this.prerender(pageIdQuery.previousPage, this.insertDom, 'previousPage', 'infinite-loading-top')
    }
  }

  /**
   * 获取iframe中的文章dom
   *
   * @param {string} url 目标url
   * @param {Function} fn 插入iframe的方式
   * @param {string} direction 更新上一页或者下一页的url
   * @param {string} loadingId 触顶或触底loading的dom id
   *
   * @private
   */
  prerender (url, fn, direction, loadingId) {
    // 启动弱网判断
    let weakTimer = this.weakNetwork(loadingId)
    window.MIP.viewer.page.prerender([url]).then(iframe => {
      if (this.loadingErrorFlag) {
        return
      }
      // 弱网、无网络的情况下，只返回iframe，iframe.contentWindow不会挂载mip
      if (iframe[0] && iframe[0].contentWindow && iframe[0].contentWindow.MIP) {
        clearTimeout(weakTimer) // 获取成功，清除弱网机制
        let pageId = getCacheUrl(iframe[0].contentWindow.MIP.viewer.page.pageId)
        let jsonld = getJsonld(iframe[0].contentWindow)
        let {dom, id} = this.getPageDom(iframe[0], pageId, jsonld.currentPage)
        fn(dom, id)
        // 更新触顶或触底的url
        pageIdQuery[direction] = getCacheUrl(jsonld[direction].url)
        // 清空当前children，防止超过限制报错
        currentWindow.MIP.viewer.page.children = []
        // 纵横神策pv埋点
        this.saLog(jsonld, iframe[0].contentWindow)
        // 发送tc无限下拉展现日志
        sendReadTypePvTcLog('unlimitedPulldown')
        // 移除页面上iframe
        iframe[0].parentNode.removeChild(iframe[0])
        this.loading = false
        setTimeout(this.start.bind(this), 0)
      } else {
        this.loadingError(loadingId)
      }
    }).catch(() => {
      this.loadingError(loadingId)
    })
  }

  /**
   * 获取iframe中的文章dom
   *
   * @param {Object} iframe 目标iframe
   * @param {string} pageId iframe对应的pageid
   * @param {Object} currentPage 当前页的jsonld.currentPage
   *
   * @private
   *
   * return dom 处理后的阅读器dom元素
   * return id  本页的pageid
   */
  getPageDom (iframe, pageId, currentPage) {
    let nextdocument = iframe.contentWindow.document
    let readwarp = nextdocument.getElementById('mip-reader-warp').childNodes
    // 判断是否有添加 show-xiaoshuo-container
    // 解决偶现获取到了dom，但是由于js阻塞引起的没有添加show-xiaoshuo-container样式类，导致文中出现一片空白的情况
    let readwarpClass = readwarp[1].className || []
    readwarpClass = readwarpClass.split(' ')
    if (readwarpClass.indexOf('show-xiaoshuo-container') < 0) {
      readwarp[1].className = readwarp[1].className + ' show-xiaoshuo-container'
    }

    readwarp[1].style.padding = '0 .32rem'
    readwarp[1].lastElementChild.style.display = 'none'

    // 如果不是这一章第一节，就删掉当前页的title
    // 因为源站还是翻页的方式，只是cache下是无限下拉，所以需要手动干掉
    if (currentPage.isFirstPage !== undefined && !currentPage.isFirstPage) {
      let title = readwarp[1].querySelector('h2.title')
      title.style.display = 'none'
    } else {
      // 是这一章第一节，增加title上下的margin
      let title = readwarp[1].querySelector('h2.title')
      // 按照ue要求修改title的上下间距
      title.style.padding = '57px 0 21px'
    }

    // 隐藏下载按钮
    let downloadNode = readwarp[1].querySelector('.zhdown-inner') || readwarp[1].querySelector('.top-download') || ''
    if (downloadNode) {
      downloadNode.style.display = 'none'
    }

    return {
      dom: readwarp[1],
      id: pageId
    }
  }

  /**
   * 向上插入dom元素
   *
   * @param {Object} dom 目标dom元素
   * @param {string} id 目标dom元素对应的pageid
   *
   * @private
   */
  insertDom (dom, id) {
    let warp = currentWindow.document.querySelector('#mip-reader-warp > #infinite-loading-top + div')
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, warp)
    // 获取页面滚动的高度 当前视口的高度 + 获取的div的高度
    let height = currentWindow.MIP.viewport.getScrollTop() + div.offsetHeight
    // 插入元素后，滚动到当前高度
    currentWindow.MIP.viewport.setScrollTop(height)
  }

  /**
   * 向下插入dom元素
   *
   * @param {Object} dom 目标dom元素
   * @param {string} id 目标dom元素对应的pageid
   *
   * @private
   */
  appendDom (dom, id) {
    let loadingbottom = document.querySelector('#infinite-loading-bottom')
    let div = document.createElement('div')
    div.setAttribute('id', id)
    div.appendChild(dom)
    reader.insertBefore(div, loadingbottom)
  }

  /**
   * 发送pv展现日志
   *
   * @param {Object} jsonld 目标jsonld
   * @param {Object} currentWindow 目标window
   * @private
   */
  saLog (jsonld, currentWindow) {
    let bkid = getParamFromString(currentWindow.location.href, 'bkid')
    let crid = getParamFromString(currentWindow.location.href, 'crid')
    // 神策展现埋点,目前只针对纵横
    window.sa.track('viewReadPage2', {
      $title: decodeURI(jsonld.currentPage.chapterName),
      $url: currentWindow.location.href,
      $referrer: currentWindow.document.referrer,
      paltform: '10000',
      channel: 'bdgfh',
      'page_path': '/book/mip/read',
      'book_id': bkid,
      'chapter_id': crid,
      'read_type': 'waterfall'
    })
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
    return documentHeight - viewPortHeight - scrollHeight < 5
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
   * 阻尼字段
   *
   * @param {string} id 触顶阻尼或者触底阻尼的id
   * @param {string} str 阻尼文本
   * @private
   */
  loadingStr (id, str) {
    let div = document.getElementById(id)
    div.querySelector('.circle').style.display = 'none'
    div.querySelector('.loading-label').innerHTML = str
  }

  /**
   * 加载失败函数
   *
   * @param {string} id 当前loading元素的id
   *
   * @private
   */
  loadingError (id) {
    clearTimeout(this.timer)
    this.loadingStr(id, '加载失败，点击刷新')
    this.loading = false
    let dom = document.getElementById(id)
    let one = 1 // 防止事件重复绑定
    dom.addEventListener('click', () => {
      if (one) {
        dom.innerHTML = loadingDom()
        this.loadingErrorFlag = false
        this.start()
        dom.removeEventListener('click', () => {})
        one = 0
      }
    })
  }
  /**
   * 弱网策略
   *
   * @param {string} id 当前loading元素的id
   *
   * @private
   */
  weakNetwork (id) {
    let timer = setTimeout(() => {
      if (this.loading) {
        this.loadingError(id)
        this.loadingErrorFlag = true
      }
    }, 5000)
    return timer
  }
}

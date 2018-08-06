/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @param {string} author - liujing.
 */

import {Constant} from '../constant-config'
import state from '../common/state'

export default class Strategy {
  constructor (config) {
    this.globalAd = false
    this.pageAd = false
    this.adCustomReady = false
    this.fromSearch = 0
    this.novelData = {}
    this.shellReady = false
  }
  /**
   * 根据当前的页面状态获取相关的广告策略
   */
  strategyStatic () {
    // 修改出广告的策略
    let currentWindow = this.getCurrentWindow()
    const {isLastPage, currentPage, chapterName, rootPageId} = state(currentWindow)
    let novelData = {
      isLastPage: isLastPage,
      chapter: currentPage.chapter,
      page: currentPage.page,
      chapterName: chapterName
    }
    this.changeStrategy()
    // 全局的广告
    if (this.globalAd) {
      window.MIP.viewer.page.emitCustomEvent(window.parent, true, {
        name: 'showAdvertising',
        data: {
          customId: rootPageId
        }
      })
    }
    // 页内的广告
    if (this.pageAd) {
      let data = {
        customId: currentPage.id
      }
      if (this.fromSearch === 1) {
        Object.assign(data, {fromSearch: this.fromSearch})
      }
      Object.assign(data, {novelData})
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'showAdvertising',
        data
      })
    }
  }

  getCurrentWindow () {
    let pageId = window.MIP.viewer.page.currentPageId
    let pageInfo = window.MIP.viewer.page.getPageById(pageId)
    return pageInfo.targetWindow
  }

  /**
   * 修改出广告的策略
   *
   * @returns {Object} 修改出广告的策略
   */
  changeStrategy () {
    let currentWindow = this.getCurrentWindow()
    const {isLastPage, isRootPage, nextPage} = state(currentWindow)
    if (isRootPage) {
      this.fromSearch = 1
    } else {
      this.fromSearch = 0
    }
    if (isLastPage) {
      this.pageAd = true
    }
    // 品专第二页广告
    if (+nextPage.page === 2) {
      this.globalAd = true
    }
  }

  /**
   * 异步获取广告的展示策略.
   *
   * @todo 后期异步的获取相关的广告策略
   * @async 异步获取相广告策略
   */
  asyncUpdataStrategy () {
    // TODO:fetch请求后端接口获取广告策略
  }

  /**
   * 所有page事件的处理.
   */
  eventAllPageHandler () {
    /**
     * 监听上一页按钮被点击事件'PREVIOUS_PAGE'
     *
     * @method
     * @param {module:constant-config~event:PREVIOUS_PAGE} e - A event.
     * @listens module:constant-config~event:PREVIOUS_PAGE
     */
    window.addEventListener(Constant.PREVIOUS_PAGE, e => {
      this.strategyStatic()
    })

    /**
     * 监听下一页按钮被点击事件'NEXT_PAGE_BUTTON_CLICK'
     *
     * @method
     * @param {module:constant-config~event:NEXT_PAGE} e - A event.
     * @listens module:constant-config~event:NEXT_PAGE
     */
    window.addEventListener(Constant.NEXT_PAGE, e => {
      this.strategyStatic()
    })

    /**
     * 当前页ready,状态可获取'CURRENT_PAGE_READY'
     *
     * @method
     * @param {module:constant-config~event:CURRENT_PAGE_READY} e - A event.
     * @listens module:constant-config~event:CURRENT_PAGE_READY
     */
    window.addEventListener(Constant.CURRENT_PAGE_READY, e => {
      this.pageAd = true
      if (window.MIP.viewer.page.isRootPage) {
        this.strategyStatic()
      }
    })
  }

  /**
   * 所有root事件的处理.
   */
  eventRootHandler () {
    /**
     * 监听mip-custom ready状态：此情况为了兼容如果小说shell优先加载custom无法监听请求事件的问题
     *
     * @method
     * @param {module:constant-config~event:customReady} e - A event.
     * @listens module:constant-config~event:customReady
     */
    window.addEventListener('customReady', e => {
      if (this.pageAd) {
        this.adCustomReady = true
        this.strategyStatic()
      }
    })
  }
}

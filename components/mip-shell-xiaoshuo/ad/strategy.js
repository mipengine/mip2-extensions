/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @author liujing
 */

import {Constant} from '../common/constant-config'
import state from '../common/state'
import {getCurrentWindow} from '../common/util'

export default class Strategy {
  constructor (config) {
    this.globalAd = false
    this.pageAd = false
    this.fromSearch = 0
  }
  /**
   * 根据当前的页面状态获取相关的广告策略
   */
  strategyStatic () {
    // 修改出广告的策略
    // 梳理广告的novelData
    let novelData = this.getNovelData()
    let currentWindow = getCurrentWindow()
    const {currentPage, rootPageId} = state(currentWindow)
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

  getNovelData () {
    const currentWindow = getCurrentWindow()
    const {isLastPage, currentPage, chapterName, originalUrl, isRootPage} = state(currentWindow)
    const rootWindow = isRootPage ? window : window.parent
    const name = rootWindow.MIP.mipshellXiaoshuo.currentPageMeta.header.title || ''
    const officeId = rootWindow.MIP.mipshellXiaoshuo.currentPageMeta.officeId || ''
    const novelPageNum = rootWindow.MIP.mipshellXiaoshuo.novelPageNum || ''

    // 基础novelData数据
    let novelData = {
      isLastPage,
      chapter: currentPage.chapter,
      page: currentPage.page,
      chapterName,
      originalUrl,
      name,
      officeId,
      silentFollow: isRootPage
    }
    // TODO: 当结果页卡片入口为断点续读时，添加entryFrom: 'from_nvl_toast', 需要修改SF里记录到hash里，等SF修改完成，此处添加
    // 当第二次翻页时候，需要告知后端出品专广告
    if (novelPageNum === 2) {
      Object.assign(novelData, {isSecondPage: true})
    }
    return novelData
  }

  /**
   * 修改出广告的策略
   *
   * @returns {Object} 修改出广告的策略
   */
  changeStrategy () {
    const currentWindow = getCurrentWindow()
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
      this.strategyStatic()
    })
  }
}

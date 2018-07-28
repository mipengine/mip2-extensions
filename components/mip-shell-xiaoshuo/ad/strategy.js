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
  }

  /**
   * 初始化事件监听.
   */
  init () {
    // TODO: 用于后期需要异步获取策略
    // this.asyncUpdataStrategy()
    // 监听阅读器的所有行为
    this.eventHandler()
  }

  /**
   * 根据当前的页面状态获取相关的广告策略
   */
  strategyStatic () {
    // 修改出广告的策略
    this.changeStrategy()
    const {rootPageId, currentPage} = state
    // 全局的广告
    if (this.globalAd) {
      window.MIP.viewer.page.emitCustomEvent(window.parent, true, {
        name: 'showAdvertising',
        data: {
          customId: rootPageId()
        }
      })
    }
    // 页内的广告
    if (this.pageAd) {
      let data = {
        customId: currentPage().id
      }
      if (this.fromSearch === 1) {
        Object.assign(data, {fromSearch: this.fromSearch})
      }
      Object.assign(data, {novelData: this.novelData})
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'showAdvertising',
        data
      })
    }
  }

  /**
   * 修改出广告的策略
   *
   * @returns {Object} 修改出广告的策略
   */
  changeStrategy () {
    const {isChapterEnd, isRootPage, nextPage} = state
    if (isRootPage()) {
      this.fromSearch = 1
    } else {
      this.fromSearch = 0
    }
    if (isChapterEnd()) {
      this.pageAd = true
    }
    // 品专第二页广告
    if (+nextPage().page === 2) {
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
   * 所有root事件的处理.
   */
  eventHandler () {
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
     * 定制化MIP组件可用事件'MIP_CUSTOM_ELEMENT_READY'
     *
     * @method
     * @param {module:constant-config~event:MIP_CUSTOM_ELEMENT_READY} e - A event.
     * @listens module:constant-config~event:MIP_CUSTOM_ELEMENT_READY
     */
    window.addEventListener(Constant.MIP_CUSTOM_ELEMENT_READY, e => {
      let customId = e && e.detail && e.detail[0] && e.detail[0].customId
      if (state.currentPage().id === customId) {
        this.adCustomReady = true
      }
    })

    /**
     * 当前页ready,状态可获取'CURRENT_PAGE_READY'
     *
     * @method
     * @param {module:constant-config~event:CURRENT_PAGE_READY} e - A event.
     * @listens module:constant-config~event:CURRENT_PAGE_READY
     */
    // let currentWindow = state.isRootPage() ? window : window.parent
    window.addEventListener(Constant.CURRENT_PAGE_READY, e => {
      this.novelData = e && e.detail && e.detail[0] && e.detail[0].novelData
      this.pageAd = true
      this.strategyStatic()
    })
  }
}

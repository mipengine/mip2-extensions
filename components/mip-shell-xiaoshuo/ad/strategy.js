/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @param {string} author - liujing.
 */

import {Constant} from '../constant-config'
import state from '../common/state'

class Strategy {
  constructor (config) {
    this.globalAd = false
    this.pageAd = false
    this.nextPageRead = false
  }
  /**
   * 初始化所有的状态.
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
    // 获取最新的页面状态
    const state = this.getState()
    // 修改出广告的策略
    this.changeStrategy()
    const {globalCustomId, pageCunstomId} = state
    if (this.globalAd) {
      window.MIP.viewer.page.emitCustomEvent(window.parent, true, {
        name: 'showAdvertising',
        data: {
          customId: globalCustomId
        }
      })
    }
    if (this.pageAd) {
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'showAdvertising',
        data: {
          customId: pageCunstomId
        }
      })
    }
  }

  /**
   * 修改出广告的策略
   *
   * @returns {Object} 修改出广告的策略
   */
  changeStrategy () {
    this.globalAd = true
    this.pageAd = true
  }

  /**
   * 获取当前的页面状态
   *
   * @returns {Object} 返回当前页面状态的对象
   */
  getState () {
    return {
      isRootPage: state.isRootPage,
      currentPage: state.currentPage,
      nextPage: state.nextPage,
      previousPage: state.previousPage,
      isChapterEnd: state.isChapterEnd,
      pageCunstomId: state.pageId,
      globalCustomId: state.globalCustomId
    }
  }

  /**
   * 异步获取广告的展示策略.
   *
   * @todo 后期异步的获取相关的广告策略
   * @async 异步获取相广告策略
   */
  asyncUpdataStrategy () {
    const fetchJsonp = window.fetchJsonp || {}
    fetchJsonp('xxx', {
      jsonpCallback: 'cb'
    }).then(function (res) {
      return res.json()
    }).then(function (data) {
      console.log(data)
    })
  }

  /**
   * 所有事件的处理.
   */
  eventHandler () {
    let self = this
    /**
     * 监听上一页按钮被点击事件'PREVIOUS_PAGE_BUTTON_CLICK'
     *
     * @method
     * @param {module:constant-config~event:PREVIOUS_PAGE_BUTTON_CLICK} e - A event.
     * @listens module:constant-config~event:PREVIOUS_PAGE_BUTTON_CLICK
     */
    window.addEventListener(Constant.PREVIOUS_PAGE_BUTTON_CLICK, e => {
      self.strategyStatic()
    })

    /**
     * 监听下一页按钮被点击事件'NEXT_PAGE_BUTTON_CLICK'
     *
     * @method
     * @param {module:constant-config~event:NEXT_PAGE_BUTTON_CLICK} e - A event.
     * @listens module:constant-config~event:NEXT_PAGE_BUTTON_CLICK
     */
    window.addEventListener(Constant.NEXT_PAGE_BUTTON_CLICK, e => {
      self.strategyStatic()
    })

    /**
     * 监听上一页按钮被点击事件'AT_CHAPTER_END'
     *
     * @method
     * @param {module:constant-config~event:AT_CHAPTER_END} e - A event.
     * @listens module:constant-config~event:AT_CHAPTER_END
     */
    window.addEventListener(Constant.AT_CHAPTER_END, e => {
      self.strategyStatic()
    })

    /**
     * 本页是本章最后一页'AT_CHAPTER_END'
     *
     * @method
     * @param {module:constant-config~event:AT_CHAPTER_END} e - A event.
     * @listens module:constant-config~event:AT_CHAPTER_END
     */
    window.addEventListener(Constant.AT_CHAPTER_END, e => {
      self.strategyStatic()
    })

    /**
     * 获取'AT_CHAPTER_END'
     *
     * @method
     * @param {module:constant-config~event:AT_CHAPTER_END} e - A event.
     * @listens module:constant-config~event:AT_CHAPTER_END
     */
    window.addEventListener(Constant.MIP_CUSTOM_ELEMENT_READY, e => {
      const state = this.getState()
      let customId = e && e.detail && e.detail[0] && e.detail[0].customId
      if (state.nextPageId() === customId) {
        this.nextPageRead = true
        self.strategyStatic()
      }
    })
  }
}

export default Strategy

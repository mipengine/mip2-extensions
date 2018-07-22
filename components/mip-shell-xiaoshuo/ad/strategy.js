/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @param {string} author - liujing.
 */

import {Constant} from '../constant-config'
import state from '../common/state'

let globalAd = false
let pageAd = false

class Strategy {
  constructor (config) {
    this.state = true
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
    const state = this.getState()
    // TODO: 根据当前的状态更新是否需要触发全局custom的请求和渲染事件
    const {globalCustomId, pageCunstomId} = state
    if (globalAd) {
      window.MIP.viewer.page.emitCustomEvent(window.parent, true, {
        name: 'showAdvertising',
        data: {
          customId: globalCustomId
        }
      })
    }
    if (pageAd) {
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'showAdvertising',
        data: {
          customId: pageCunstomId
        }
      })
    }
  }

  /**
   * 获取当前的页面状态ss
   *
   * @returns {Object} 返回当前页面状态的对象
   */
  getStrategy () {
    return {}
  }

  /**
   * 获取当前的页面状态ss
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
  }
}

export default Strategy

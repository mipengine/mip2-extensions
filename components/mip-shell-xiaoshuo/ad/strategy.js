/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @param {string} author - liujing.
 */

import {Constant} from '../constant-config'
import state from '../common/state'

const extend = MIP.util.fn.extend

class Strategy {
  constructor (config) {
    this.globalAd = false
    this.pageAd = false
    this.adCustomRead = false
    this.fromSearch = 0
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
    // 修改出广告的策略
    this.changeStrategy()
    const {rootPageId, currentPage, isChapterEnd, chapterName} = state
    if (this.globalAd) {
      window.MIP.viewer.page.emitCustomEvent(window.parent, true, {
        name: 'showAdvertising',
        data: {
          customId: rootPageId
        }
      })
    }
    if (this.pageAd) {
      let data = {
        customId: currentPage().id
      }
      if (this.fromSearch === 1) {
        extend(data, {fromSearch: this.fromSearch})
      }
      if (currentPage() && currentPage().chapter !== null && currentPage().page !== null && chapterName()) {
        let novelData = {
          isChapterEnd: isChapterEnd(),
          chapter: currentPage().chapter,
          page: currentPage().page,
          chapterName: chapterName()
        }
        extend(data, {novelData})
      }
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
    const {isChapterEnd} = state
    if (this.fromSearch === 1 || isChapterEnd) {
      this.pageAd = true
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
     * 搜索点出的第一页'AT_CHAPTER_END'
     *
     * @method
     * @param {module:constant-config~event:AT_CHAPTER_END} e - A event.
     * @listens module:constant-config~event:AT_CHAPTER_END
     */
    window.addEventListener(Constant.IN_ROOT_PAGE, e => {
      self.fromSearch = 1
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
      let customId = e && e.detail && e.detail[0] && e.detail[0].customId
      if (state.nextPage().id === customId) {
        this.adCustomRead = true
        self.strategyStatic()
      }
    })
  }
}

export default Strategy

/**
 * 小说的广告策略模块.
 * @constructor
 * @param {string} title - 小说的广告策略模块.
 * @author liujing
 */

import {Constant} from '../common/constant-config'
import state from '../common/state'
import {getCurrentWindow, getRootWindow, getHashData} from '../common/util'
import {
  initFirstFetchCache
} from './strategyCompute'

export default class strategyControl {
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
    const currentWindow = getCurrentWindow()
    const {currentPage, rootPageId} = state(currentWindow)
    this.changeStrategy()
    let data = {
      customId: currentPage.id
    }
    if (this.fromSearch === 1) {
      Object.assign(data, {fromSearch: this.fromSearch})
    }
    Object.assign(data, {novelData})
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
      const rootWindow = getRootWindow(currentWindow)
      rootWindow.MIP.viewer.page.broadcastCustomEvent({
        name: 'showAdvertising',
        data
      })
    }
    // 只发请求，忽略该次的任何操作
    if (novelData.ignoreSendLog && novelData.showedAds) {
      window.MIP.viewer.page.emitCustomEvent(currentWindow, false, {
        name: 'ignoreSendLogFetch',
        data
      })
    }
  }

  getNovelData () {
    const currentWindow = getCurrentWindow()
    const {isLastPage, currentPage, chapterName, originalUrl, isRootPage, novelInstance} = state(currentWindow)
    const name = novelInstance.currentPageMeta.header.title || ''
    const officeId = novelInstance.currentPageMeta.officeId || ''
    const novelPageNum = novelInstance.novelPageNum || ''
    const pageType = novelInstance.currentPageMeta.pageType || ''
    const isNeedAds = novelInstance.adsCache == null ? true : novelInstance.adsCache.isNeedAds
    const novelInstanceId = novelInstance.novelInstanceId
    const latestChapterId = novelInstance.catalog.getLatestChapterId()
    // 基础novelData数据
    let novelData = {
      isLastPage,
      chapter: currentPage.chapter,
      page: currentPage.page,
      chapterName,
      originalUrl,
      name,
      officeId,
      pageType,
      silentFollow: isRootPage,
      isNeedAds,
      novelInstanceId,
      latestChapterId
    }
    // TODO: 当结果页卡片入口为断点续读时，添加entryFrom: 'from_nvl_toast', 需要修改SF里记录到hash里，等SF修改完成，此处添加
    // 当第二次翻页时候，需要告知后端出品专广告
    if (novelPageNum === 2) {
      Object.assign(novelData, {isSecondPage: true})
    }
    if (isNeedAds && novelInstance.adsCache) {
      novelInstance.adsCache = undefined
    }
    if (novelInstance.adsCache && novelInstance.adsCache.fetchTpl && novelInstance.adsCache.fetchTpl.length !== 0) {
      Object.assign(novelData, {tpl: novelInstance.adsCache.fetchTpl})
    }
    if (novelInstance.adsCache != null &&
      novelInstance.adsCache.showedAds &&
      JSON.stringify(novelInstance.adsCache.showedAds) !== '{}') {
      Object.assign(novelData, {showedAds: novelInstance.adsCache.showedAds})
    }
    if (novelInstance.adsCache != null && novelInstance.adsCache.isFirstFetch) {
      Object.assign(novelData, {ignoreSendLog: true})
    }
    if (getHashData('srcid')) {
      Object.assign(novelData, {frsrcid: getHashData('srcid')})
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
    const currentWindow = getCurrentWindow()
    const {isRootPage} = state(currentWindow)
    const rootWindow = isRootPage ? window : window.parent

    let listen = function (target, name, handler) {
      target.addEventListener(name, handler)
      return () => target.removeEventListener(name, handler)
    }

    let customReadyUnlistener
    let shellReadyUnlistener

    let customHandler = e => {
      this.pageAd = true
      this.strategyStatic()

      customReadyUnlistener && customReadyUnlistener()
      shellReadyUnlistener && shellReadyUnlistener()

      Promise.all([
        new Promise(resolve => (customReadyUnlistener = listen(rootWindow, 'customReady', resolve))),
        new Promise(resolve => (shellReadyUnlistener = listen(rootWindow, Constant.CURRENT_PAGE_READY, resolve)))
      ]).then(customHandler)
    }

    // 针对 rootPage 分两种情况：
    // 1. mip-custom 先加载完成: mip-custom 组件发出的 customReady 事件失效，主动发一个事件触发 custom 再发一次
    // 2. xiaoshuo-shell 先加载完成: 此时已经注册了监听 customReady 事件，customReadyConfirm 事件发出无效
    customReadyUnlistener = listen(rootWindow, 'customReady', customHandler)
    window.MIP.viewer.page.emitCustomEvent(window, true, {
      name: 'customReadyConfirm',
      data: {}
    })

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
  }

  /**
   * novel shell需要处理的事情 —— 绑在root页上
   */
  eventRootHandler () {
    /**
     * 定制化广告的请求返回的数据，需要通过相关的schema计算出当前页需要渲染的广告数据
     *
     * @method
     * @param {module:constant-config~event:adDataReady} e - A event.
     * @listens adDataReady 监听定制化
     */
    window.addEventListener('adDataReady', e => {
      const adData = (e && e.detail && e.detail[0]) || {}
      const currentWindow = getCurrentWindow()
      const {novelInstance = {}} = state(currentWindow)
      // 当广告是第一次请求回来，需要初始化广告的策略的缓存数据
      if (novelInstance.adsCache == null) {
        // 第一次请求的时候需要初始化fetch的数据，并且计算出当前的广告数据
        initFirstFetchCache(adData, novelInstance)
      }
      const adStrategyCacheData = novelInstance.adsCache.adStrategyCacheData
      // 计算出需要出的广告数据
      if (novelInstance.adsCache != null && novelInstance.adsCache.isFirstFetch) {
        this.strategyStatic()
      }
      window.MIP.viewer.page.emitCustomEvent(currentWindow, false, {
        name: 'showAdStrategyCache',
        data: adStrategyCacheData
      })
    })
  }
}

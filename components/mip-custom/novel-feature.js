/**
 * @file mip-custom/novel
 * @author liujing37
 */
import dom from './dom'

let globalCustomElementInstance
let initElement

/**
 * 添加小说相关的事件监听
 *
 * @param {Object} e 事件
 */
function handler (e) {
  let me = globalCustomElementInstance
  let detailData = (e && e.detail && e.detail[0]) || {}
  me.customId = detailData.customId
  me.novelData = detailData.novelData
  if (detailData.fromSearch) {
    me.fromSearch = detailData.fromSearch
  }
  // XXX:解决window实例和组件实例的诡异的问题。。。。。。
  let novelInstance = window.MIP.viewer.page.isRootPage
    ? window.MIP.novelInstance
    : window.parent.MIP.novelInstance
  novelInstance = novelInstance || {}
  let adsCache = novelInstance.adsCache || {}
  if (me.customId === window.MIP.viewer.page.currentPageId &&
    me.element.querySelector('.mip-custom-placeholder')) {
    // 广告合并的策略

    if (!adsCache.isNeedAds && adsCache.directRender && adsCache.adStrategyCacheData) {
      me.render(adsCache.adStrategyCacheData, me.element)
    }
    //   common 正常发送
    window.MIP.setCommonFetch = true
    initElement.apply(me, [dom])
    window.removeEventListener('showAdvertising', handler)
  }
  // 当广告合并后首次请求后需要告知RD该页展现的广告，额外多一次广告请求，但是本次请求忽略
  if (me.customId === window.MIP.viewer.page.currentPageId &&
    adsCache.ignoreSendLog) {
    initElement.apply(me, [dom])
  }
}

/**
 * 添加小说相关的事件监听
 *
 * @param {Function} cb 回调函数，用来初始化ele
 */
function addNovelListener (cb) {
  let me = this
  dom.addPlaceholder(this)
  globalCustomElementInstance = this
  initElement = cb
  window.addEventListener('ignoreSendLogFetch', function (e) {
    let detailData = (e && e.detail && e.detail[0]) || {}
    me.customId = detailData.customId
    me.novelData = detailData.novelData
    initElement.apply(me, [dom])
  })
  // 监听小说shell播放的广告请求的事件
  window.addEventListener('showAdvertising', handler)
  // 当小说shell优先加载时——向小说shell发送custom已经ready的状态以方便后续事件的执行
  let shellWindow = window.MIP.viewer.page.isRootPage ? window : window.parent
  // 定制化再加确认事件事件防止
  window.addEventListener('customReadyConfirm', function () {
    window.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
      name: 'customReady',
      data: {
        customPageId: window.MIP.viewer.page.currentPageId
      }
    })
  })
  window.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
    name: 'customReady',
    data: {
      customPageId: window.MIP.viewer.page.currentPageId
    }
  })
}

/**
 * 小说的特殊参数——novelData 和 fromSearch
 *
 * @param {string} urlParam 实际的common的URL
 */
function addNovelDate (urlParam) {
  let url = urlParam
  if (this.novelData) {
    let novelData = encodeURIComponent(JSON.stringify(this.novelData))
    url = url + '&novelData=' + novelData
  }
  if (this.fromSearch) {
    url = url + '&fromSearch=' + this.fromSearch
  }
  return url
}

/**
 * 获取当前定制化页面的 window ——小说垂类
 *
 * @returns {window} 当前iframe的window
 */
function getCurrentWindow () {
  let pageId = window.MIP.viewer.page.currentPageId || ''
  let pageInfo = window.MIP.viewer.page.getPageById(pageId)
  return pageInfo.targetWindow
}

/**
 * 根据缓存数据渲染广告
 *
 * @param {Object} data fetch返回的数据
 * @param {HTMLElement} element 数据返回后需要渲染的element
 * @param {Promise.resolve} resolve promise
 */
function renderNovelCacheAdData (data, element, resolve) {
  let currentWindow = getCurrentWindow()
  let isRootPage = currentWindow.MIP.viewer.page.isRootPage
  let novelInstance = isRootPage ? window.MIP.novelInstance : window.parent.MIP.novelInstance
  let adsCache = novelInstance.adsCache || {}
  let rendered = false
  if (JSON.stringify(adsCache) === '{}') {
    // 当请求走的是小流量的广告合并时，需要走新的逻辑，用schema字段来区分，需要修改data.data
    let adTime = +new Date()
    data.data.adTime = adTime
    window.addEventListener('showAdStrategyCache', function (e) {
      let adData = (e && e.detail && e.detail[0]) || {}
      // 模板的前端渲染
      rendered = true
      resolve && resolve(adData)
    })
    window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
      name: 'adDataReady',
      data: {
        pageId: window.MIP.viewer.page.currentPageId,
        adData: data.data
      }
    })
  }
  if (!rendered && adsCache.directRender != null && !!adsCache.directRender === false) {
    // 当渲染cache广告的时候缺少tpl的时候，依赖于请求返回的tpl
    renderCacheDataByTpl(data, element, resolve)
  }
  if (!rendered && adsCache.noAdsRender != null && adsCache.noAdsRender) {
    renderCacheDataByTpl({ data: { data: {} } }, element, resolve)
  }
}

/**
 * 当渲染cache广告的时候缺少tpl的时候，依赖于请求返回的tpl
 *
 * @param {Object} data fetch返回的数据
 * @param {HTMLElement} element 数据返回后需要渲染的element
 * @param {Promise.resolve} resolve promise
 */
function renderCacheDataByTpl (data, element, resolve) {
  let currentWindow = getCurrentWindow()
  let isRootPage = currentWindow.MIP.viewer.page.isRootPage
  let novelInstance = isRootPage
    ? currentWindow.MIP.novelInstance
    : currentWindow.parent.MIP.novelInstance
  let adsCache = novelInstance.adsCache || {}
  let novelAds = (adsCache.adStrategyCacheData && adsCache.adStrategyCacheData.template) || []
  // 对小说传入的广告数据中的template进行遍历，把请求回来的tpl拼入
  if (novelAds) {
    novelAds.map(function (value) {
      // 由于template的结构是数组嵌套数组
      if (Array.isArray(value)) {
        value.map(function (ad) {
          if (ad.tpl == null && data.data.template[ad.tplName]) {
            ad.tpl = data.data.template[ad.tplName]
          }
        })
      }
    })
    Object.assign(adsCache.fetchedData.adData.template, data.data.template)
  }
  resolve && resolve(adsCache.adStrategyCacheData)
}

export default {
  addNovelListener,
  addNovelDate,
  renderNovelCacheAdData
}

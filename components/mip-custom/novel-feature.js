/**
 * @file 搜索合作页小说特性 novel-feature
 * @author liujing chenyongle
 *
 */

const {util} = MIP
let globalCustomElementInstance
let initElement

/**
 * 获取当前定制化页面的 window
 *
 * @returns {window} 当前 iframe 的 window
 */
function getCurrentWindow () {
  let pageId = window.MIP.viewer.page.currentPageId || ''
  let pageInfo = window.MIP.viewer.page.getPageById(pageId)
  return pageInfo.targetWindow
}
/**
 * 获取当前定制化页面的 root window
 *
 * @returns {window} 当前 iframe 的 root window
 */
function getRootWindow () {
  let win = getCurrentWindow()
  return win.MIP.viewer.page.isRootPage
    ? win
    : win.parent
}
/**
 * 根据当前 window 获取小说实例
 *
 * @param {window} win 当前 window
 * @returns {Object} 小说实例
 */
function getNovelInstance (win) {
  return win.MIP.viewer.page.isRootPage
    ? win.MIP.novelInstance
    : win.parent.MIP.novelInstance
}
/**
 * showAdvertising 事件处理
 *
 * @param {Event} e event
 */
function handler (e) {
  let me = globalCustomElementInstance
  let detailData = (e && e.detail && e.detail[0]) || {}
  let win = getCurrentWindow()
  let novelInstance = getNovelInstance(win)
  let adsCache = novelInstance.adsCache || {}

  me.customId = detailData.customId
  me.novelData = detailData.novelData

  if (detailData.fromSearch) {
    me.fromSearch = detailData.fromSearch
  }

  if (me.customId === win.MIP.viewer.page.currentPageId &&
    me.element.querySelector('.mip-custom-placeholder')) {
    win.MIP.setCommonFetch = true
    initElement.apply(me)
    win.removeEventListener('showAdvertising', handler)
  }

  if (me.customId === win.MIP.viewer.page.currentPageId &&
    adsCache.ignoreSendLog) {
    initElement.apply(me)
  }
}

/**
 * 监听小说 shell 的事件，进行相应的处理，再调回调进行渲染
 *
 * @param {Function} cb 回调函数
 */
function addNovelListener (cb) {
  let me = this
  let win = getCurrentWindow()
  globalCustomElementInstance = this
  initElement = cb
  win.addEventListener('ignoreSendLogFetch', e => {
    let detailData = (e && e.detail && e.detail[0]) || {}
    me.customId = detailData.customId
    me.novelData = detailData.novelData
    initElement.apply(me)
  })
  // 监听小说shell播放的广告请求的事件
  win.addEventListener('showAdvertising', handler)
  // 当小说shell优先加载时——向小说shell发送custom已经ready的状态以方便后续事件的执行
  let shellWindow = getRootWindow()
  // 定制化再加确认事件事件防止
  win.addEventListener('customReadyConfirm', function () {
    win.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
      name: 'customReady',
      data: {
        customPageId: win.MIP.viewer.page.currentPageId
      }
    })
  })
  win.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
    name: 'customReady',
    data: {
      customPageId: win.MIP.viewer.page.currentPageId
    }
  })
}
/**
 * 添加小说需要的特殊参数
 *
 * @param {string} urlParam url
 * @param {Object} novelData 小说传给 server 的参数
 * @param {string} fromSearch 小说需要的参数
 * @returns {string} 增加参数后的 url
 */
function addNovelData (urlParam, novelData, fromSearch) {
  let url = urlParam
  if (novelData) {
    url = url + '&novelData=' + encodeURIComponent(JSON.stringify(novelData))
  }
  if (fromSearch) {
    url = url + '&fromSearch=' + fromSearch
  }
  return url
}

/**
 * 根据 common 请求返回的数据，进行处理，然后 resolve 成 mip-custom 可以渲染的数据
 *
 * @param {Object} data common 请求返回的数据
 * @param {Promise.resolve} resolve Promise 的 resolve
 */
function renderWithNovelData (data, resolve) {
  let win = getCurrentWindow()
  let shellWindow = getRootWindow()
  let novelInstance = getNovelInstance(win)
  let adsCache = novelInstance.adsCache || {}
  let rendered = false
  if (JSON.stringify(adsCache) === '{}') {
    data.data.adTime = +new Date()
    win.addEventListener('showAdStrategyCache', e => {
      let adData = (e && e.detail && e.detail[0]) || {}
      // 模板的前端渲染
      rendered = true
      resolve && resolve(adData)
    })

    win.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
      name: 'adDataReady',
      data: {
        pageId: win.MIP.viewer.page.currentPageId,
        adData: data.data
      }
    })
  }
  // 将各种情况统一，这里需谨慎
  if ((!rendered && adsCache.directRender != null && !adsCache.ignoreSendLog) ||
    (!rendered && adsCache.noAdsRender != null && adsCache.noAdsRender)
  ) {
    renderWithNoCache(data, resolve)
  }
}

/**
 * 给 renderCacheDataByTpl 套一层事件，让 mip-custom 等待小说的 nocache 返回的数据
 *
 * @param {Object} data common 返回数据
 * @param {Promise.resolve} resolve promise
 */
function renderWithNoCache (data, resolve) {
  let win = getCurrentWindow()
  let shellWindow = getRootWindow()
  // 自测的时候发现不知道为啥会调用多次
  let once = true
  win.addEventListener('addNoCacheAds', function () {
    once && (renderCacheDataByTpl(data, resolve))
    once = false
  })
  win.MIP.viewer.page.emitCustomEvent(shellWindow, false, {
    name: 'noCacheAdDataReady',
    data: {
      pageId: win.MIP.viewer.page.currentPageId,
      adData: data.data
    }
  })
}

/**
 * 获取当前定制化页面的window——小说垂类
 *
 * @param {Object} data fetch返回的数据
 * @param {Promise.resolve} resolve promise
 */
function renderCacheDataByTpl (data, resolve) {
  let currentWindow = getCurrentWindow()
  let novelInstance = getNovelInstance(currentWindow)
  let adsCache = novelInstance.adsCache || {}
  let novelAds = (adsCache.adStrategyCacheData && adsCache.adStrategyCacheData.template) || []
  // 对小说传入的广告数据中的template进行遍历，把请求回来的tpl拼入
  if (novelAds) {
    novelAds.map(value => {
      // 由于template的结构是数组嵌套数组
      if (Array.isArray(value)) {
        value.map(ad => {
          if (ad.tpl == null && data.data.template[ad.tplName]) {
            ad.tpl = data.data.template[ad.tplName]
          }
        })
      }
    })
    util.fn.extend(adsCache.fetchedData.adData.template, data.data.template)
  }
  resolve && resolve(adsCache.adStrategyCacheData)
}

export default {
  addNovelListener,
  addNovelData,
  renderWithNovelData
}

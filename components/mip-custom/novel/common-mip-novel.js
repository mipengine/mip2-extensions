/**
 * @file 通用 mip 小说可以出广告，特性模仿自定制化小说，但是功能简化
 * @author chenyongle
 */
import {initFirstFetchCache} from './strategyCompute'
import novel from './novel-feature'
import {getHashData, getCurrentWindow, getRootWindow, state, getNovelInstanceId} from './util'
const rootWin = getRootWindow()
const currentWindow = getCurrentWindow()

function getNovelData () {
  let novelInstance = rootWin.MIP.novelInstance
  if (!novelInstance) {
    novelInstance = {
      currentPageMeta: {
        pageType: 'page'
      },
      novelInstanceId: getNovelInstanceId()
    }
    rootWin.MIP.novelInstance = novelInstance
  }

  const {originalUrl, isRootPage} = state(currentWindow)
  const pageType = novelInstance.currentPageMeta.pageType || ''
  let isNeedAds = novelInstance.adsCache == null ? true : novelInstance.adsCache.isNeedAds
  const novelInstanceId = novelInstance.novelInstanceId
  // 基础novelData数据
  let novelData = {
    originalUrl,
    pageType,
    silentFollow: isRootPage,
    isNeedAds,
    novelInstanceId
  }
  // TODO: 当结果页卡片入口为断点续读时，添加entryFrom: 'from_nvl_toast', 需要修改SF里记录到hash里，等SF修改完成，此处添加

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

  // 2019-4-30 为后端增加几个UA相关的字段
  let ua = window.navigator.userAgent
  novelData.ua = ua

  if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) {
    novelData.os = 'ios'
    let match = ua.match(/OS (\d+)_(\d+)_?(\d+)?/)
    if (match) {
      let version = match[1] + '.' + match[2]
      if (match[3]) {
        version += '.' + match[3]
      }
      novelData.ov = version
    }
  } else if (ua.indexOf('Android') !== -1) {
    novelData.os = 'android'
    let match = ua.match(/Android\s([^\s]+)/)
    if (match) {
      novelData.ov = match[1]
    }
  }

  // 只看手百，不看lite
  if (ua.indexOf('baiduboxapp') !== -1 && ua.indexOf('lite baiduboxapp') === -1 && ua.indexOf('info baiduboxapp') === -1) {
    let match = ua.match(/baiduboxapp\/([^\s]+)/)
    if (match) {
      novelData.ver = match[1]
    }
  }

  return novelData
}
function addNovelData (url) {
  let novelData = getNovelData()
  const fromSearch = currentWindow.MIP.viewer.page.isRootPage ? 1 : 0
  return novel.addNovelData(url, novelData, fromSearch)
}

function renderWithNovelData (data, resolve) {
  const {novelInstance} = state(currentWindow)
  initFirstFetchCache({adData: data.data}, novelInstance)
  resolve(novelInstance.adsCache.adStrategyCacheData)
}
export default {
  addNovelData,
  renderWithNovelData
}

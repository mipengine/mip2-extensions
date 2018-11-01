/**
 * 小说的广告策略schema计算模块.
 * @constructor
 * @author liujing
 */

import state from '../common/state'

const AD_DATA_CACHE = 600000

/**
 * 每次需要广告请求时，需要初始化广告队列的cache数据
 *
 * @param {object} customFetch的数据
 * @param {object} novelInstance 小说shell的实例
 */
export const initFirstFetchCache = (data, novelInstance = {}) => {
  const ads = data.adData.ads || {}
  let adsCache = {}
  // 把当前的广告数据挂载在小说实例下
  adsCache.fetchedData = JSON.parse(JSON.stringify(data))
  // 初始化该次广告请求的时间
  adsCache.novelInstanceTime = +new Date()

  // 初始化默认下一次翻页获取的是cache的请求，后期根据广告请求的计算，实际判断是否获取新的广告请求
  adsCache.isNeedAds = false

  // 初始化ads中广告的队列的adsInitLength、residueCount、errorAbnormal
  let adsCount = {}
  for (let i in ads) {
    let adsInitLength = ads[i].length
    let residueCount = ads[i].length
    let errorAbnormal = 0
    adsCount[i] = {
      adsInitLength,
      residueCount,
      errorAbnormal
    }
  }
  // 缓存当前页的广告队列的情况
  adsCache.adsCount = adsCount
  // 初始化是否是第一次请求
  adsCache.isFirstFetch = true
  // 所有的广告策略的数据全部挂载在adsCache的数据下
  novelInstance.adsCache = adsCache
  // 计算当前页的广告策略
  computeAdStragegyByPageType(novelInstance)
  // 计算出需要出的广告数据
  adsCache.adStategyCacheData = getRenderAdData(window)
  console.log(adsCache.adStategyCacheData)
}

/**
 * 当现有的广告需要从前端缓存中获取时，初始化相关的数据
 *
 * @param {object} novelInstance 小说shell的实例
 */
export const initAdByCache = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  // 从前端缓存广告中计算相关页面的广告数据
  if (!(adsCache.isFirstFetch == null || adsCache.isNeedAds == null)) {
    // 首先修改是否是第一次请求的状态
    adsCache.isFirstFetch = false
    // 计算当前页的广告策略
    computeAdStragegyByPageType(novelInstance)
    // 如果当前页不需要重新请求广告，则重新获取广告数据
    if (!adsCache.isNeedAds) {
      if (JSON.stringify(adsCache.currentTypeAdStrategy) !== '{}') {
        // 计算出需要出的广告数据
        adsCache.adStategyCacheData = getRenderAdData(window)
        // 当前页面广告策略已经确认，但是缺失tpl，整体的展现还是依赖于当前common的请求的模板
        adsCache.directRender = adsCache.fetchTpl.length === 0
      } else {
        // 当前页面几不需要重新请求又不需要渲染广告
        adsCache.noAdsRender = false
      }
    }
  }
}

/**
 * 根据页面类型计算当前页的广告策略
 *
 * @param {object} novelInstance 小说shell的实例
 */
export const computeAdStragegyByPageType = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  let {fetchedData = {}} = adsCache
  let {adData = {}} = fetchedData

  // 初始化当前页的全部内容，边界值情况的讨论
  getBoundaryAdStrategy(novelInstance)
  // 如果计算边界值需要翻页后重新请求广告
  if (adsCache.isNeedAds) {
    adsCache.currentTypeAdStrategy = {}
    return
  }

  // 获取当前页属于的页面类型
  getCurrentPageType(adData.schema['page_types'], novelInstance)

  // 通过currentPageType去获取对应页面类型的stragegy
  adsCache.currentTypeAdStrategy = getCurrentTypeAdStrategy(novelInstance)

  // 如果当前的广告策略计算为空，则先查看novelInstance.adsCount是否有errorAbnormal超过3次和residueCount小于0的；
  // 如果超过三次并且本页的currentTypeAdStrategy里空本次策略则前端缓存的广告异常清零，重新发请求
  if (adsCache.isFirstFetch != null &&
    !adsCache.isFirstFetch &&
    JSON.stringify(adsCache.currentTypeAdStrategy) === '{}') {
    for (let i in adsCache.adsCount) {
      if (adsCache.adsCount[i].errorAbnormal >= 3 || adsCache.adsCount[i].residueCount < 0) {
        // 是否清零发请求依赖isNeedAds字段
        adsCache.isNeedAds = true
      }
    }
  }
}

/**
 * 初始化当前页的全部内容，边界值情况的讨论
 *
 * @param {object} novelInstance 小说shell的实例
 */
const getBoundaryAdStrategy = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  let {fetchedData = {}} = adsCache
  let {adData = {}} = fetchedData
  // 当fetchedData是没有数据时，本页不展现广告，翻页后展现广告；
  if (fetchedData == null || JSON.stringify(fetchedData) === '{}') {
    adsCache.isNeedAds = true
    throw new Error('未取到广告数据')
  }

  // 当ads为空：说明当前页无广告或者此次广告请求有误，本页不展现广告，翻页后展现广告；
  if (adData.ads && JSON.stringify(adData.ads) === '{}') {
    adsCache.isNeedAds = true
  }

  // 当广告需要渲染的时间与第一次实例化的请求时间差距 > cache的时候，需要翻页后重新请求一次广告数据
  const thisTime = +new Date()
  const fetchedDataTime = adData.schema.cache ? adData.schema.cache : AD_DATA_CACHE
  if (thisTime - adsCache.novelInstanceTime > fetchedDataTime) {
    adsCache.isNeedAds = true
  }
}

/**
 * 根据schema计算出当前页面需要出的广告策略
 *
 * @param {object} novelInstance 小说shell的实例
 * @return {object} currentTypeAdStrategy 通过schema计算出的当前页面广告策勒
 */
const getCurrentTypeAdStrategy = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  let {fetchedData = {}, adsCount = {}, currentPageType = []} = adsCache
  let {adData = {}} = fetchedData
  let currentTypeAdStrategy = {}
  if (currentPageType.length !== 0) {
    currentPageType.forEach(value => {
      let strategy = adData.schema['page_ads'][value]
      let endCycle = false
      for (let i in strategy) {
        if (strategy[i].strategy && JSON.stringify(strategy[i].strategy) !== '{}') {
          // 当该策略命中广告后，顺序取策略，只要有一个策略命中则不考虑别的策略
          let random = Math.random()
          if (strategy[i].probability == null ||
            (strategy[i].probability && strategy[i].probability / 100 >= 1) ||
            (strategy[i].probability && random >= strategy[i].probability)
          ) {
            let adTypes = {}
            for (let adNum in strategy[i].strategy) {
              if (!endCycle) {
                if (adsCount[adNum] == null) {
                  adsCount[adNum] = {
                    adsInitLength: 0,
                    residueCount: 0,
                    errorAbnormal: 0
                  }
                }
                if (adsCount[adNum].adsInitLength === 0) {
                  adsCount[adNum].errorAbnormal++
                } else {
                  adTypes[adNum] = adData.ads[adNum].splice(0, strategy[i].strategy[adNum])
                  adsCount[adNum].residueCount -= strategy[i].strategy[adNum]
                  endCycle = true
                }
              }
            }
            if (JSON.stringify(adTypes) !== '{}') {
              currentTypeAdStrategy[value] = adTypes
            }
          }
        }
      }
    })
  } else {
    console.warn('广告策略返回于当前页面类型无一匹配')
  }
  console.log('currentTypeAdStrategy: ')
  console.log(currentTypeAdStrategy)
  return currentTypeAdStrategy
}

/**
 * 获取当前广告策略的数据
 *
 * @param {window} currentWindow 当前的window
 * @return {object} currentAds 当前页面广告最终需要渲染的数据
 */
const getRenderAdData = currentWindow => {
  const {novelInstance = {}} = state(currentWindow)
  let {adsCache = {}} = novelInstance
  let {adData = {}} = adsCache.fetchedData
  // ------ 通过currentPageType去获取对应页面类型的stragegy ------
  let currentAdStrategyKeys = Object.keys(adsCache.currentTypeAdStrategy)
  let allAds = {}

  // 当前的页面类型只命中一种广告；
  if (currentAdStrategyKeys.length === 1) {
    allAds = adsCache.currentTypeAdStrategy[currentAdStrategyKeys[0]]
  }
  // 当前页面会涉及到不同页面类型的广告叠加
  let prioritys = (adData.schema['page_priority'] && adData.schema['page_priority'][currentAdStrategyKeys[0]]) || ''
  if (prioritys && prioritys !== '') {
    allAds = getOverlayAds(prioritys, adsCache, currentAdStrategyKeys)
  }
  getShowedAds(allAds, adsCache)
  const currentAds = formatCurrentAds(allAds, novelInstance)
  return currentAds
}

/**
 * 判断当前页面可以属哪几种页面类型
 *
 * @param {object} pageTypes schema的页面类型的优先级
 * @param {object} novelInstance 小说shell的实例
 */
const getCurrentPageType = (pageTypes = [], novelInstance = {}) => {
  // 根据shell的pageType获取当前页面的页面类型，主要有整本书级别的和阅读页级别的
  const pageType = novelInstance.currentPageMeta.pageType || ''
  const {isLastPage} = state(window)
  let currentPageType = []
  let readType = []
  if (pageType === 'page') {
    readType.push('read')
    if (isLastPage) {
      readType.push('chapterEnd')
    }
  } else {
    readType.push(pageType)
  }
  // 判断当是阅读页级别的书，查看次页属于翻了几页；
  const readPageNum = novelInstance.currentPageMeta.readPageNum || 0
  const turnPageType = 'page_' + (readPageNum === 0 ? 0 : readPageNum - 1)
  pageTypes.forEach((value, index) => {
    readType.forEach(type => {
      if (value === type) {
        currentPageType.push(value)
      }
    })
    if (value === turnPageType) {
      currentPageType.push(value)
    }
  })
  novelInstance.adsCache.currentPageType = currentPageType
}

/**
 * 获取当前广告策略的数据
 *
 * @param {object} allAds 当前计算得出需要渲染的广告数据
 * @param {object} adsCache 缓存的广告数据
 */
const getShowedAds = (allAds = {}, adsCache = {}) => {
  let showedAds = {}
  for (let value in allAds) {
    showedAds[value] = allAds[value].length
  }
  adsCache.showedAds = showedAds
}

/**
 * 获取当前广告策略的数据
 *
 * @param {string} prioritys 通过common返回的叠加策略
 * @param {object} adsCache 缓存的广告数据
 * @param {Array} currentAdStrategyKeys 存储需要的tpl的name
 * @return {object} priorityValues 根据优先级算出的叠加的广告
 */
const getOverlayAds = (prioritys, adsCache, currentAdStrategyKeys) => {
  let priorityType = prioritys.split(' ')
  let priorityArr = []
  currentAdStrategyKeys.forEach((value, i) => {
    if (i !== 0 && prioritys.indexOf(value) !== -1) {
      let index = priorityType.indexOf(value)
      let arr = {
        opt: priorityType[index - 1],
        pageType: priorityType[index]
      }
      priorityArr.push(arr)
    }
  })
  let priorityValues = {}
  Object.assign(priorityValues, adsCache.currentTypeAdStrategy[currentAdStrategyKeys[0]])
  priorityArr.map(value => {
    if (value.opt === '|' || value.opt === '&') {
      Object.assign(priorityValues, adsCache.currentTypeAdStrategy[value.pageType])
    }
  })
  return priorityValues
}

/**
 * format后的当前页的广告数据
 *
 * @param {object} allAds 当前计算得出需要渲染的广告数据
 * @param {object} novelInstance 小说shell的实例
 * @return {object} currentAds format后的广告数据
 */
const formatCurrentAds = (allAds, novelInstance) => {
  let {adsCache = {}} = novelInstance
  let {adData = {}} = adsCache.fetchedData
  let currentAds = {}
  let template = []
  let fetchTpl = []
  for (let i in allAds) {
    let templateValue = []
    allAds[i].map(value => {
      // 现在整理书广告数据格式
      let currentAdsTplData = {}
      Object.assign(currentAdsTplData, value)
      Object.assign(currentAdsTplData, {tpl: adData.template[value.tplName]})
      templateValue.push(currentAdsTplData)
      if (adData.template[value.tplName] == null) {
        // 把需要请求的tpl存起来
        fetchTpl.push(value.tplName)
      }
    })
    template.push(templateValue)
  }
  adsCache.fetchTpl = fetchTpl
  const {common = {}, config = {}, responseTime = {}} = adData
  Object.assign(currentAds || {}, {common, config, responseTime})
  Object.assign(currentAds, {template})
  console.log('currentAds: ')
  console.log(currentAds)
  return currentAds
}

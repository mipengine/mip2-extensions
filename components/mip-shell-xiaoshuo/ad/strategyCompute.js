/**
 * 小说的广告策略schema计算模块.
 * @author liujing
 */

import state from '../common/state'
import {getCurrentWindow} from '../common/util'

// 广告数据的缓存时间
const AD_DATA_CACHE = 600000

// 页面的类型集
const PAGE_TYPES = {
  PAGE: 'page',
  CHAPTEREND: 'chapterEnd',
  DETAIL: 'detail',
  PAGE_NUM_PREFIX: 'page_'
}

/**
 * adsCache的相关state
 *
 * fetchedData {Object} 深克隆fetch返回的数据
 * novelInstanceTime {float} 该次广告请求的时间
 * isFirstFetch {boole} 是否是第一次请求
 * isNeedAds {boole} 是否重新发请求，监控该数据
 * adsCount {Object} 每个广告队列的数据
 * adStrategyCacheData {Object} 小说组件计算出的数据为
 * fetchTpl {Array} 需要请求的tpl
 * showedAds {Object} 已经展示了的广告
 * directRender {boole} 当前页面广告策略已经确认，但是缺失tpl
 * noAdsRender {boole} 当前页面既不需要重新请求又不需要渲染广告
 */

/**
 * 每次需要广告请求时，需要初始化广告队列的cache数据
 *
 * @param {Object} data customFetch的数据
 * @param {Object} novelInstance 小说shell的实例
 */
export const initFirstFetchCache = (data, novelInstance = {}) => {
  let adsCache = {}

  // 把当前的广告数据挂载在小说实例下
  adsCache.fetchedData = JSON.parse(JSON.stringify(data))

  // 初始化该次广告请求的时间
  adsCache.novelInstanceTime = +new Date()

  // 初始化默认下一次翻页获取的是cache的请求，后期根据广告请求的计算，实际判断是否获取新的广告请求
  adsCache.isNeedAds = false

  // 初始化ads中广告的队列的adsInitLength、residueCount、errorAbnormal
  initAdsCount(adsCache)

  // 初始化是否是第一次请求
  adsCache.isFirstFetch = true

  // 所有的广告策略的数据全部挂载在adsCache的数据下
  novelInstance.adsCache = adsCache

  // 计算当前页的广告策略
  computeAdStrategy(novelInstance)

  // 计算出需要出的广告数据
  adsCache.adStrategyCacheData = getRenderAdData(getCurrentWindow())
}
/**
 * 这个函数是每次渲染 nocache 广告都要处理数据的操作，不管是第一次还是之后的每次都是同一个函数
 *
 * @param {Object} data mip-custom 传过来的数据
 * @param {Object} nocache 保存 nocache 所有相关数据的地方
 * @param {boolean} updateSchema 是否更新 nocache 的 schema
 * @returns {Object} 返回 nocache 的所有数据
 */
export function computeNoCacheAds (data, nocache = {}, updateSchema = false) {
  // 简单的深度复制 保存数据
  let copyData = JSON.parse(JSON.stringify(data))
  nocache.fetchedData = copyData
  // schema 初始化 或者 强制更新
  if (nocache.schema == null || updateSchema) {
    nocache.schema = copyData.adData.schema
  }
  // 初始化本次 common 请求带回的 nocache 广告数量
  nocache.adsCountNoCache = initAdsCountHelper(copyData.adData.nocacheads)
  // 判断当前页面类型
  nocache.curPageTypeNoCache = initCurPageType(nocache.schema['page_types'])
  // 计算当前页面的策略
  nocache.curPageStrategyNoCache = getCurPageStrategyNoCache(nocache)
  // 根据策略获取广告数据
  nocache.template = getAdDataNoCache(nocache.curPageStrategyNoCache, copyData.adData)
  // nocache 的完整广告格式
  nocache.noCacheData = getFormattedAdData(nocache.fetchedData.adData, nocache.template)
  return nocache
}
/**
 * 当现有的广告需要从前端缓存中获取时，初始化相关的数据
 *
 * @param {Object} novelInstance 小说shell的实例
 */
export const initAdByCache = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  // 从前端缓存广告中计算相关页面的广告数据
  if (!(adsCache.isFirstFetch == null || adsCache.isNeedAds == null)) {
    // 首先修改是否是第一次请求的状态
    adsCache.isFirstFetch = false
    // 计算当前页的广告策略
    computeAdStrategy(novelInstance)
    /**
     * 如果当前页不需要重新请求广告，则重新获取广告数据
     */
    if (!adsCache.isNeedAds) {
      if (JSON.stringify(adsCache.curPageStrategy) !== '{}') {
        // 计算出需要出的广告数据
        adsCache.adStrategyCacheData = getRenderAdData(window)
        // 当前页面广告策略已经确认，但是缺失tpl，整体的展现还是依赖于当前common的请求的模板
        adsCache.directRender = adsCache.fetchTpl.length === 0
      } else {
        // 当前页面既不需要重新请求又不需要渲染广告
        adsCache.noAdsRender = true
      }
    }
  }
}
/**
 * 根据页面类型计算当前页的 nocache 广告
 *
 * @param {Object} nocache 数据
 * @returns {Object} nocache 广告数据
 */
export function getCurPageStrategyNoCache (nocache) {
  let {curPageTypeNoCache, adsCountNoCache, fetchedData} = nocache
  let curPageStrategy = {}
  if (curPageTypeNoCache.length !== 0) {
    curPageTypeNoCache.forEach(type => {
      // 根据 curPageTypeNoCache 的类型获取广告数据
      computeStrategyHelper(curPageStrategy, type, fetchedData.adData, adsCountNoCache, nocache.schema['page_nocache_ads'], 'nocacheads')
    })
  } else {
    console.warn('当前页面类型和规定的页面类型无一匹配')
  }
  return curPageStrategy
}
/**
 * 根据页面类型计算当前页的广告策略
 *
 * @param {Object} novelInstance 小说shell的实例
 */
export const computeAdStrategy = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  let {fetchedData = {}} = adsCache
  let {adData = {}} = fetchedData

  // 初始化当前页的全部内容，边界值情况的讨论
  initBoundary(novelInstance)
  // 如果计算边界值需要翻页后重新请求广告
  if (adsCache.isNeedAds) {
    adsCache.curPageStrategy = {}
    return
  }

  // 获取当前页属于的页面类型
  initCurPageType(adData.schema['page_types'])
  // 通过curPageType去获取对应页面类型的stragegy
  adsCache.curPageStrategy = getCurPageStrategy(novelInstance)

  /**
   * 如果当前的广告策略计算为空，则先查看novelInstance.adsCount是否有errorAbnormal超过3次和residueCount小于0的；
   * 如果超过三次并且本页的curPageStrategy里空本次策略则前端缓存的广告异常清零，重新发请求
   */
  if (adsCache.isFirstFetch != null &&
    !adsCache.isFirstFetch &&
    JSON.stringify(adsCache.curPageStrategy) === '{}') {
    for (let i in adsCache.adsCount) {
      if (adsCache.adsCount[i].errorAbnormal >= 3 || adsCache.adsCount[i].residueCount <= 0) {
        // 是否清零发请求依赖isNeedAds字段
        adsCache.isNeedAds = true
      }
    }
  }
}

/**
 * 初始化广告数据的数量
 *
 * @param {Object} ads commmon 返回的 data.nocacheads 数据
 * @returns {Object} 返回广告数量初始化后的数据
 */
function initAdsCountHelper (ads = {}) {
  let adsCount = {}
  Object.keys(ads).forEach(val => {
    let adsInitLength = ads[val].length
    let residueCount = ads[val].length
    let errorAbnormal = 0
    adsCount[val] = {
      adsInitLength,
      residueCount,
      errorAbnormal
    }
  })
  return adsCount
}
/**
 * 初始化ads中广告的队列的adsInitLength、residueCount、errorAbnormal
 *
 * @param {Object} adsCache 小说挂载root实例下的广告前端缓存
 */
const initAdsCount = (adsCache = {}) => {
  const ads = (adsCache.fetchedData &&
    adsCache.fetchedData.adData &&
    adsCache.fetchedData.adData.ads) || {}

  // 缓存当前页的广告队列的情况
  adsCache.adsCount = initAdsCountHelper(ads)
}

/**
 * 初始化当前页的全部内容，边界值情况的讨论
 *
 * @param {Object} novelInstance 小说shell的实例
 */
const initBoundary = (novelInstance = {}) => {
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
 * 判断当前页面可以属哪几种页面类型
 *
 * @param {Object} pageTypes schema的页面类型的优先级
 * @returns {Array} 返回页面类型的数组
 */
const initCurPageType = (pageTypes = []) => {
  const {novelInstance = {}} = state(window)
  let curPageType = []
  let [readType, turnPageType] = getCurPageType()

  pageTypes.forEach(value => {
    readType.forEach(type => {
      if (value === type) {
        curPageType.push(value)
      }
    })
    if (value === turnPageType) {
      curPageType.push(value)
    }
  })
  novelInstance.adsCache && (novelInstance.adsCache.curPageType = curPageType)
  return curPageType
}
/**
 * 获取当前页面的类型
 *
 * @returns {Array} 数组第一个值是页面类型集合，第二个值是 page_x 的值
 */
export function getCurPageType () {
  let win = getCurrentWindow()
  let {isLastPage, novelInstance = {}} = state(win)
  // 根据shell的pageType获取当前页面的页面类型，主要有整本书级别的和阅读页级别的
  let pageType = novelInstance.currentPageMeta && novelInstance.currentPageMeta.pageType
  let readType = []

  // 添加当前页面的页面类型到readType中
  if (pageType === PAGE_TYPES.PAGE) {
    readType.push(PAGE_TYPES.PAGE)
    if (isLastPage) {
      readType.push(PAGE_TYPES.CHAPTEREND)
    }
  } else {
    readType.push(pageType)
  }
  // TODO page_2只能存在page页中?
  // 判断当是阅读页级别的书，查看当前页是第几页
  let readPageNum = novelInstance.readPageNum || 1
  let turnPageType = PAGE_TYPES.PAGE_NUM_PREFIX + readPageNum
  readType.push(turnPageType)
  return [readType, turnPageType]
}
/**
 * 根据schema计算出当前页面需要出的广告策略
 * 返回结果类似:
 *
 * {
 *   page: {
 *     ad_1395: [{...}, {...}]
 *   }
 * }
 *
 * @param {Object} novelInstance 小说shell的实例
 * @returns {Object} 通过schema计算出的当前页面广告策勒
 */
const getCurPageStrategy = (novelInstance = {}) => {
  let {adsCache = {}} = novelInstance
  let {fetchedData = {}, adsCount = {}, curPageType = []} = adsCache
  let {adData = {}} = fetchedData
  let curPageStrategy = {}

  if (curPageType.length !== 0) {
    curPageType.forEach(type => {
      // 根据curPageType的类型获取广告数据
      computeStrategy(curPageStrategy, type, adData, adsCount)
    })
  } else {
    console.warn('广告策略返回于当前页面类型无一匹配')
  }
  return curPageStrategy
}
/**
 * 根据 schema 计算当前页面可出的广告内容
 *
 * @param {Object} curPageStrategy 当前页面的广告策略
 * @param {string} type 页面类型
 * @param {Object} adData common返回的数据
 * @param {Object} adsCount 广告数量
 * @param {Object} schema schema 内容
 * @param {string} cacheType 是 cache 的广告 还是 nocache 的广告
 */
function computeStrategyHelper (curPageStrategy, type, adData, adsCount, schema = {}, cacheType) {
  let endCycle = false
  let strategy = schema[type] || {}
  for (let i in strategy) {
    let random = Math.random()
    if (strategy[i].strategy &&
      JSON.stringify(strategy[i].strategy) !== '{}' &&
      !endCycle &&
      (strategy[i].probability == null ||
        (strategy[i].probability && (strategy[i].probability / 100) >= random)
      )
    ) {
      // 当该策略命中广告后，顺序取策略，只要有一个策略命中则不考虑别的策略
      let adTypes = getStrategy(adsCount, strategy[i].strategy, adData, cacheType)
      if (JSON.stringify(adTypes) !== '{}') {
        curPageStrategy[type] = adTypes
        endCycle = true
      }
    }
  }
}
/**
 * 根据curPageType的类型获取广告数据
 *
 * @param {boolean} curPageStrategy 当前页面广告策勒
 * @param {Object} type 当前页命中广告类型
 * @param {Object} adData fetch返回的广告数据
 * @param {Object} adsCount 广告队列的计数
 */
const computeStrategy = (curPageStrategy, type, adData, adsCount) => {
  computeStrategyHelper(curPageStrategy, type, adData, adsCount, adData.schema['page_ads'], 'ads')
}

/**
 * 获取广告策略中的广告队列，并且修改广告队列最初的计数
 * 2019-02-14 新增逻辑：只要这个策略中的广告有一条没有数据，则返回失败
 *
 * @param {Object} adsCount 广告队列的计数
 * @param {Object} strategy 每个广告类型中的广告策略
 * @param {Object} adData fetch返回的广告数据
 * @param {Object} cacheType 页面类型
 * @returns {Object} 返回通过广告策略中计算出的广告队列的数据
 */
const getStrategy = (adsCount, strategy, adData, cacheType) => {
  let adTypes = {}
  for (let adNum in strategy) {
    if (adsCount[adNum] == null) {
      adsCount[adNum] = {
        adsInitLength: 0,
        residueCount: 0,
        errorAbnormal: 0
      }
    }
    if (adsCount[adNum].adsInitLength === 0) {
      adsCount[adNum].errorAbnormal++
      return {}
    }
    if (adData[cacheType][adNum].length < strategy[adNum]) {
      return {}
    }
  }
  // 上一个循环已经排除错误情况
  for (let adNum in strategy) {
    if (strategy.hasOwnProperty(adNum)) {
      // 把广告给截取出来 用掉 所以用掉的广告就不在原来的数组里了
      adTypes[adNum] = adData[cacheType][adNum].splice(0, strategy[adNum])
      adsCount[adNum].residueCount -= strategy[adNum]
    }
  }
  return adTypes
}
/**
 * 将当前命中的策略和广告数据合并
 *
 * @param {Object} curPageStrategy 当前命中的策略和广告数据
 * @param {Object} adData fetch 返回的广告数据
 * @returns {Array} 返回 template 数组
 */
function getAdDataNoCache (curPageStrategy, adData) {
  let allAds = {}
  Object.keys(curPageStrategy).forEach(key => {
    Object.keys(curPageStrategy[key]).forEach(val => {
      if (allAds[val]) {
        allAds[val] = allAds[val].concat(curPageStrategy[key][val])
      } else {
        allAds[val] = curPageStrategy[key][val]
      }
    })
  })
  // 由于 nocache 不需要后台记录展现了哪些广告，每次需要的模板文件后台也是一定返回的，所以只需将模板插入页面中即可
  let [template] = getTemplate(allAds, adData)
  return template
}
/**
 * 获取当前广告策略的数据
 *
 * @param {window} currentWindow 当前的window
 * @returns {Object} 当前页面广告最终需要渲染的数据
 */
const getRenderAdData = currentWindow => {
  const {novelInstance = {}} = state(currentWindow)
  let {adsCache = {}} = novelInstance
  let {adData = {}} = adsCache.fetchedData
  // 存储所有的广告策略
  let allAds = {}

  // 通过curPageType去获取对应页面类型的stragegy
  let curAdStrategyKeys = Object.keys(adsCache.curPageStrategy)

  // 当前的页面类型只命中一种广告；
  if (curAdStrategyKeys.length === 1) {
    allAds = adsCache.curPageStrategy[curAdStrategyKeys[0]]
  }
  // 当前页面会涉及到不同页面类型的广告叠加
  let prioritys = (adData.schema['page_priority'] && adData.schema['page_priority'][curAdStrategyKeys[0]]) || ''
  if (prioritys && prioritys !== '') {
    allAds = getOverlayAds(prioritys, adsCache, curAdStrategyKeys)
  }
  const currentAds = formatAdData(allAds, novelInstance)
  return currentAds
}

/**
 * 获取当前广告策略的数据
 * 类似结果如下：
 *
 * {
 *   ad_1395: [{...}, {...}]
 * }
 *
 * @param {string} prioritys 通过common返回的叠加策略
 * @param {Object} adsCache 缓存的广告数据
 * @param {Array} curAdStrategyKeys 存储需要的tpl的name
 * @returns {Object} 根据优先级算出的叠加的广告
 */
const getOverlayAds = (prioritys, adsCache, curAdStrategyKeys = []) => {
  let priorityType = prioritys.split(' ')
  let priorityArr = []

  // 获取该页面命中的最高优的一个页面类型的广告
  curAdStrategyKeys.forEach((value, i) => {
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
  // 首先将 page 类型的策略放进 priorityValues
  Object.assign(priorityValues, adsCache.curPageStrategy[curAdStrategyKeys[0]])

  // 通过当前的命中的策略的类型，获取叠加的广告策勒
  priorityArr.map(value => {
    let overlayPage = adsCache.curPageStrategy[value.pageType]
    if (value.opt === '|' || value.opt === '&') {
      for (let type in priorityValues) {
        if (overlayPage[type]) {
          priorityValues[type] = priorityValues[type].concat(overlayPage[type])
        } else {
          Object.assign(priorityValues, overlayPage)
        }
      }
    }
  })
  return priorityValues
}

/**
 * format后的当前页的广告数据
 *
 * @param {Object} allAds 当前计算得出需要渲染的广告数据
 * @param {Object} novelInstance 小说shell的实例
 * @returns {Object} format后的广告数据
 */
const formatAdData = (allAds, novelInstance) => {
  let {adsCache = {}} = novelInstance
  let {adData = {}} = adsCache.fetchedData

  // 整理出最后的页面
  let [template, fetchTpl, showedAds] = getTemplate(allAds, adData)

  adsCache.fetchTpl = fetchTpl
  adsCache.showedAds = showedAds

  return getFormattedAdData(adData, template)
}
/**
 * 将得到的广告数据处理成 mip-custom 需要的标准形式
 *
 * @param {Object} adData 广告数据
 * @param {Array} template template 模板数据
 * @returns {Object} mip-custom 需要的标准数据，用以渲染
 */
function getFormattedAdData (adData, template) {
  let formatData = {}
  const {common = {}, config = {}, responseTime = {}} = adData
  Object.assign(formatData, {common, config, responseTime})
  Object.assign(formatData, {template})
  return formatData
}
/**
 * 根据广告策略找出模板
 *
 * @param {Object} allAds 本次需要展现的所有广告的集合
 * @param {Object} adData common 发来的数据
 * @returns {Array} 第一个值是模板，第二是缺少的模板，第三个是记录了展现的广告
 */
function getTemplate (allAds, adData) {
  let template = []
  let fetchTpl = []
  let showedAds = {}

  for (let i in allAds) {
    let templateValue = []
    let showedAd = 0
    allAds[i].map(value => {
      // 整理广告的数据格式，形成最终的格式
      let adTplData = {}
      Object.assign(adTplData, value)
      Object.assign(adTplData, {tpl: adData.template[value.tplName]})
      templateValue.push(adTplData)
      if (adData.template[value.tplName] == null) {
        // 把需要请求的tpl存起来
        fetchTpl.push(value.tplName)
      }
      showedAds[i] = ++showedAd
    })
    template.push(templateValue)
  }
  return [template, fetchTpl, showedAds]
}

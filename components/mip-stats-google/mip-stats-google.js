/**
 * @file analytics.js GA统计组件
 * @author brucetansh@gmail.com
 */

/* global MIP */

const { util, CustomElement } = MIP
const { Gesture, fn, jsonParse } = util
const logger = util.log('mip-stats-google')

/**
 * 绑定交互式的 Google Analytics 的属性
 *
 * @type {string}
 */
const DATA_STATS_GA_OBJ_ATTR = 'data-stats-ga-obj'

/**
 * 标识 dom 是不是已经被绑定上事件的属性
 *
 * @type {string}
 */
const DATA_STATS_GA_FALG = 'data-stats-ga-flag'

export default class MipStatsGoogle extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    // 获取参数
    let config = getConfig(this.element)

    if (!config) {
      return
    }
    // 改写GA
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/
    window.ga = function () {
      window.ga.q = (window.ga.q || [])
      window.ga.q.push(arguments)
    }
    window.ga.l = new Date().getTime()

    // 获取自定义事件
    let { evConf } = config

    for (let i = 0; i < evConf.length; i++) {
      /* global */
      window.ga.apply(this, evConf[i])
    }

    // 绑定事件
    bindEle()

    let gascript = document.createElement('script')
    gascript.async = 1
    gascript.src = 'https://www.google-analytics.com/analytics.js'
    this.element.appendChild(gascript)
  }
}

/**
 * 从组件中的 type 为 "application/json" 的 script 标签中获取 JSON 数据
 *
 * @param   {HTMLElement}  element  mip-stats-google 的 DOM 元素
 * @returns {Object}           Google Analytics 的配置信息
 */
function getConfig (element) {
  let config = {}
  config.evConf = []

  try {
    let configContent = element.querySelector('script[type="application/json"]').textContent

    if (configContent) {
      let configData = jsonParse(configContent)
      config.evConf = configData
    }
  } catch (e) {
    logger.warn(element, 'json is illegal')
  }
  return config
}

function bindEle () {
  let now = Date.now()
  let intervalTimer = setInterval(() => {
    // 获取所有需要触发的 DOM
    bindEleHandler(document.querySelectorAll(`*[${DATA_STATS_GA_OBJ_ATTR}]`))
    // 由于存在异步渲染的情况，所以需要进行一段时间的轮询确保点击事件都能绑定上
    if (Date.now() - now >= 8000) {
      clearInterval(intervalTimer)
    }
  }, 100)
}

/**
 * 处理点击统计的 DOM 列表
 *
 * @param {Array<HTMLElement>} tagBoxs 需要记录点击统计的 DOM 元素列表
 */
function bindEleHandler (tagBoxs) {
  for (let i = 0; i < tagBoxs.length; i++) {
    let target = tagBoxs[i]
    let statusData = target.getAttribute(DATA_STATS_GA_OBJ_ATTR)
    let hasBindFlag = target.hasAttribute(DATA_STATS_GA_FALG)

    // 检测statusData是否存在
    if (!statusData || hasBindFlag) {
      continue
    }

    try {
      statusData = jsonParse(decodeURIComponent(statusData))
    } catch (e) {
      logger.warn(target, `事件追踪 ${DATA_STATS_GA_OBJ_ATTR} 数据不是合法的 JSON 数据`)
      continue
    }

    let eventType = statusData.type

    // 检测传递数据是否存在
    if (!statusData.data) {
      continue
    }

    let data = statusData.data

    if (eventType !== 'click' && eventType !== 'mouseup' && eventType !== 'load') {
      // 事件限制到 click, mouseup, load(直接触发)
      continue
    }

    if (eventType === 'load') {
      window._hmt.push(data)
    } else if (eventType === 'click' &&
      target.hasAttribute('on') &&
      target.getAttribute('on').match('tap:') &&
      fn.hasTouch()
    ) {
      /**
       * 解决 on=tap: 和 click 冲突短线方案
       * @TODO 这个为短线方案
       */
      let gesture = new Gesture(target)
      gesture.on('tap', eventHandler)
    } else {
      target.addEventListener(eventType, eventHandler, false)
    }

    target.setAttribute(DATA_STATS_GA_FALG, '1')
  }
}

/**
 * 数据换转 兼容两种格式
 *
 * @param {string} configItem 统计用户配置
 * @example (不需要处理) ["send", "event"]
 * @example (需要处理) "[send, event]"
 *
 * @returns {Object} ["send", "event"]
 */
function getConfigArr (configItem) {
  if (!configItem) {
    return
  }

  // (不需要处理) ["send", "event"]
  if (typeof configItem === 'object') {
    return configItem
  }

  // 字符串转数组
  let configArr = []
  let itemArr = configItem.slice(1, configItem.length - 1).split(',')

  for (let i = 0; i < itemArr.length; i++) {
    let item = itemArr[i]
    let arrItem = item.replace(/(^\s*)|(\s*$)/g, '').replace(/'/g, '')
    arrItem = arrItem === 'false' || arrItem === 'true' ? Boolean(arrItem) : arrItem
    configArr.push(arrItem)
  }

  return configArr
}

/**
 * 触发事件
 */
function eventHandler () {
  let statusData = this.getAttribute(DATA_STATS_GA_OBJ_ATTR)
  let statusJson = jsonParse(decodeURIComponent(statusData))
  let eventData = getConfigArr(statusJson.data)
  /* global */
  window.ga.apply(this, eventData)
}

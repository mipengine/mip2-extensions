/**
 * @file analytics.js GA统计组件
 * @author bruce
 */

/* global MIP, ga */

let { CustomElement, util } = MIP
let { fn, jsonParse } = util

export default class MipStatsGoogle extends CustomElement {
  constructor (...args) {
    // 继承父类属性、方法
    super(...args)

    // 获取参数
    this.config = this.getConfig()
  }

  // 提前渲染
  prerenderAllowed () {
    return true
  }

  connectedCallback () {
    let { element, config } = this

    if (!config) {
      return
    }
    // Google Analytics 官方写法与eslint冲突，为保持兼容性，暂时关闭eslint
    // https://developers.google.com/analytics/devguides/collection/analyticsjs/
    /* eslint-disable */
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;

    // 获取token 自定义事件
    let { evConf } = config

    for(let i = 0; i < evConf.length; i++){
        /* global ga */
        window.ga.apply(this, evConf[i]);
    }

    // 绑定事件
    this.bindEle()

    let gascript = document.createElement('script')
    gascript.async = 1
    gascript.src = 'https://www.google-analytics.com/analytics.js'
    element.appendChild(gascript)
  }

  /**
   * 获取配置信息
   *
   * @returns {Object} config 配置对象
   */
  getConfig () {
    let { element } = this

    let config = {}

    try {
      let configContent = element.querySelector('script[type="application/json"]').textContent

      if (configContent) {
        let configData = jsonParse(configContent)
        config.evConf = configData
        return config
      }
    } catch (e) {
      console.warn('json is illegal')
      console.warn(e)
      return {
        evConf: []
      }
    }
  }

  // 绑定事件追踪
  bindEle () {
    // 获取所有需要触发的dom
    let tagBox = document.querySelectorAll('*[data-stats-ga-obj]')

    for (let node of tagBox.values()) {
      let statusData = node.getAttribute('data-stats-ga-obj')

      // 检测statusData是否存在
      if (!statusData) {
        continue
      }

      try {
        statusData = jsonParse(decodeURIComponent(statusData))
      } catch (e) {
        console.warn('事件追踪data-stats-ga-obj数据不正确')
        continue
      }

      let { type, data } = statusData

      let isLegalType = ['click', 'mouseup', 'load'].indexOf(type) !== '-1'
      let isLoaded = node.classList.contains('mip-stats-ga-eventload')

      // 检测传递数据是否存在
      if (!data || !isLegalType || isLoaded) {
        continue
      }

      // 格式化数据
      let formatData = getConfigArr(data)

      node.classList.add('mip-stats-ga-eventload')

      if (type === 'load') {
        /* global ga */
        window.ga.apply(this, formatData)
      } else if (type === 'click' &&
              node.hasAttribute('on') &&
              node.getAttribute('on').match('tap:') &&
              fn.hasTouch()) {
        let gesture = new util.Gesture(node)
        gesture.on('tap', eventHandler)
      } else {
        node.addEventListener(type, eventHandler, false)
      }
    }
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
  let itemArr = configItem.slice(1, configItem.length - 1).split(',')
  let configArr = []

  for (let item of itemArr) {
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
  let statusData = this.getAttribute('data-stats-ga-obj')
  let statusJson = jsonParse(decodeURIComponent(statusData))
  let eventData = getConfigArr(statusJson.data)
  window.ga.apply(this, eventData)
}


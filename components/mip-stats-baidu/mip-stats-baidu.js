/**
 * @file mip-stats-baidu.js 百度统计组件
 * @author wangqizheng
 */

let { CustomElement, util, viewer } = MIP
let { hash, fn, jsonParse } = util

export default class MipStatsBaidu extends CustomElement {
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

    // 获取token 自定义事件
    let { token, evConf } = config

    if (!token) {
      return console.warn('token is unavailable')
    }

    window._hmt = window._hmt || []
    window._hmt.push([
      '_setAccount',
      token
    ])

    // 解决来自百度搜索，内外域名不一致问题
    if (viewer.isIframed) {
      bdSearchCase()
    }

    // !!! 为什么初始化实例就开始发送事件？除了load，应该都是手动触发啊
    // 这里存疑，暂时不改他的逻辑
    for (let item of evConf) {
      window._hmt.push(item)
    }

    // 绑定事件
    this.bindEle()

    let hm = document.createElement('script')
    hm.src = `https://hm.baidu.com/hm.js?${token}`
    element.appendChild(hm)
  }

  /**
   * 获取配置信息
   *
   * @returns {Object} config 配置对象
   */
  getConfig () {
    let { element } = this

    let config = {}
    let setconfig = element.getAttribute('setconfig')

    try {
      let configContent = element.querySelector('script[type="application/json"]').textContent

      if (configContent) {
        let configData = jsonParse(configContent)
        config.token = configData.token
        config.evConf = objToArray(configData)

        return config
      }
    } catch (e) {
      console.warn('json is illegal')
      console.warn(e)
    }

    return {
      token: element.getAttribute('token'),
      evConf: setconfig ? [...getConfigArr(decodeURIComponent(setconfig))] : []
    }
  }

  // 绑定事件追踪
  bindEle () {
    // 获取所有需要触发的dom
    let tagBox = document.querySelectorAll('*[data-stats-baidu-obj]')

    for (let node of tagBox.values()) {
      let statusData = node.getAttribute('data-stats-baidu-obj')

      // 检测statusData是否存在
      if (!statusData) {
        continue
      }

      try {
        statusData = jsonParse(decodeURIComponent(statusData))
      } catch (e) {
        console.warn('事件追踪data-stats-baidu-obj数据不正确')
        continue
      }

      let { type, data } = statusData

      let isLegalType = ['click', 'mouseup', 'load'].indexOf(type) !== '-1'
      let isLoaded = node.classList.contains('mip-stats-eventload')

      // 检测传递数据是否存在
      if (!data || !isLegalType || isLoaded) {
        continue
      }

      // 格式化数据
      let formatData = getConfigArr(data)

      node.classList.add('mip-stats-eventload')

      if (type === 'load') {
        window._hmt.push(formatData)
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
 * 对象转数组
 *
 * @param {Object} configObj 配置对象
 * @returns {Object} 配置对象数组
 */
function objToArray (configObj) {
  let outConfigArray = []

  if (!configObj) {
    return
  }

  for (let [key, item] of Object.entries(configObj)) {
    if (!Array.isArray(item)) {
      continue
    }
    outConfigArray.push([key, ...item])
  }

  return outConfigArray
}

/**
 * 数据换转 兼容两种格式
 *
 * @param {string} configItem 百度统计用户配置
 * @example (不需要处理) ["_trackPageview", "/mip-stats/sheji"]
 * @example (需要处理) "[_trackPageview, /mip-stats/sheji]"
 *
 * @returns {Object} ["_trackPageview", "/mip-stats/sheji"]
 */
function getConfigArr (configItem) {
  if (!configItem) {
    return
  }

  // (不需要处理) ["_trackPageview", "/mip-stats/sheji"]
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
  let statusData = this.getAttribute('data-stats-baidu-obj')
  let statusJson = jsonParse(decodeURIComponent(statusData))
  let eventData = getConfigArr(statusJson.data)
  window._hmt.push(eventData)
}

/**
 * 解决来自百度搜索，内外域名不一致问题
 */
function bdSearchCase () {
  let originUrl = ''
  let hashObj = {}

  let hashWord = hash.get('word') || ''
  let hashEqid = hash.get('eqid') || ''
  let hashFrom = hash.get('from') || ''

  if (isMatch(hashFrom, 'result') && (hashWord || hashEqid) && document.referrer) {
    hashObj.url = ''
    hashObj.eqid = hashEqid
    hashObj.word = hashWord
    originUrl = document.referrer
  } else {
    hashObj.url = ''
    originUrl = location.origin + location.pathname + location.search
  }
  window._hmt.push(['_setReferrerOverride', makeReferrer(originUrl, hashObj)])
}

/**
 * 验证是否来自结果页
 *
 * @param {string} from mipService 哈希标识
 * @param {string} targetFrom 哈希值
 * @returns {boolean} 是或否
 */
function isMatch (from, targetFrom) {
  if (from && targetFrom && from === targetFrom) {
    return true
  }
  return false
}

/**
 * 生成百度统计_setReferrerOverride对应的referrer
 *
 * @param {string} url 需要被添加参数的 url
 * @param {Object} hashObj 参数对象
 * @returns {string} 拼装后的 url
 */
function makeReferrer (url, hashObj) {
  let referrer = ''
  let conjMark = url.indexOf('?') < 0 ? '?' : '&'
  let urlData = ''
  for (let key in hashObj) {
    urlData += '&' + key + '=' + hashObj[key]
  }
  urlData = urlData.slice(1)
  if (url.indexOf('#') < 0 && urlData) {
    referrer = url + conjMark + urlData
  } else {
    referrer = url.replace('#', conjMark + urlData + '#')
  }
  return referrer
}

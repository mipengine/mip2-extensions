/**
 * @file 百度统计组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

const { viewer, util, CustomElement } = MIP
const { Gesture, fn, jsonParse } = util
const logger = util.log('mip-stats-baidu')

/**
 * 绑定交互式的百度统计的属性
 *
 * @type {string}
 */
const DATA_STATS_BAIDU_OBJ_ATTR = 'data-stats-baidu-obj'

/**
 * 标识 dom 是不是已经被绑定上事件的属性
 *
 * @type {string}
 */
const DATA_STATS_FALG = 'data-stats-flag'

export default class MIPStatsBaidu extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    let elem = this.element
    let config = getStatsBaiduConfig(elem)
    let token = config.token
    let conf = config.conf

    // 检测token是否存在
    if (token) {
      window._hmt = window._hmt || []
      window._hmt.push([
        '_setAccount',
        token
      ])

      // 如果是在iframe内部，则单独处理referrer，因为referrer统计不对
      if (viewer.isIframed) {
        setReferrer()
      }
      if (conf && Array.isArray(conf) && conf.length) {
        for (let i = 0; i < conf.length; i++) {
          window._hmt.push(conf[i])
        }
      }

      bindEle()

      let hm = document.createElement('script')
      hm.src = `//hm.baidu.com/hm.js?${token}`
      elem.appendChild(hm)
    } else {
      logger.warn(elem, '请在配置中提供 token 字段'); // eslint-disable-line
    }
  }
}

/**
 * 从组件中的 type 为 "application/json" 的 script 标签中获取 JSON 数据
 *
 * @param   {HTMLElement}  el  mip-stats-baidu 的 DOM 元素
 * @returns {Object}           百度统计的配置信息
 */
function getStatsBaiduConfig (el) {
  let config = {}
  let setconfig = el.getAttribute('setconfig')

  try {
    let script = el.querySelector('script[type="application/json"]')
    if (script) {
      let textContent = jsonParse(script.textContent)
      if (JSON.stringify(textContent) !== '{}') {
        config.token = textContent.token
        util.fn.del(textContent, 'token')
        config.conf = objectToArray(textContent)
      }
      return config
    }
  } catch (e) {
    logger.warn(el, '配置数据不是合法的 JSON', e)
  }
  return {
    token: el.getAttribute('token'),
    conf: setconfig ? new Array(buildArray(decodeURIComponent(setconfig))) : null
  }
}

/**
 * 将 JSON Object 转换成数组
 * example: {a: [1, 3, 5], b: [2, 4]}  => [['a', 1, 2, 3], ['b', 2, 4]]
 *
 * @param   {Object} jsonObj  JSON Object 的数据
 * @returns {Array<Object>}   转换成的数组
 */
function objectToArray (jsonObj) {
  let outConfigArray = []

  if (!jsonObj) {
    return
  }

  Object.keys(jsonObj).forEach(key => {
    if (Array.isArray(jsonObj[key])) {
      jsonObj[key].unshift(key)
      outConfigArray.push(jsonObj[key])
    }
  })

  return outConfigArray
}

/**
 * 事件触发
 */
function eventHandler () {
  let tempData = this.getAttribute(DATA_STATS_BAIDU_OBJ_ATTR)
  let statusJson

  if (!tempData) {
    return
  }
  try {
    statusJson = jsonParse(decodeURIComponent(tempData))
  } catch (e) {
    return logger.warn(this, `事件追踪 ${DATA_STATS_BAIDU_OBJ_ATTR} 数据不是合法的 JSON 数据`)
  }
  if (!statusJson.data) {
    return
  }

  let attrData = buildArray(statusJson.data)
  window._hmt.push(attrData)
}

/**
 * 数据换转 兼容两种格式
 *
 * @param   {string} arrayStr 百度统计用户配置数据
 * @example (不需要处理) ["_trackPageview", "/mip-stats/sheji"]
 * @example (需要处理) "[_trackPageview, /mip-stats/sheji]"
 *
 * @returns {?Array} ["_trackPageview", "/mip-stats/sheji"]
 */
function buildArray (arrayStr) {
  if (!arrayStr) {
    return
  }

  // (不需要处理) ["_trackPageview", "/mip-stats/sheji"]
  if (typeof arrayStr === 'object') {
    return arrayStr
  }

  let strArr = arrayStr.slice(1, arrayStr.length - 1).split(',')
  let newArray = []

  for (let index = 0; index < strArr.length; index++) {
    let item = strArr[index].replace(/(^\s*)|(\s*$)/g, '').replace(/'/g, '')
    if (item === 'false' || item === 'true') {
      item = Boolean(item)
    }

    newArray.push(item)
  }

  return newArray
}

/**
 * 绑定事件追踪
 */
function bindEle () {
  let now = Date.now()
  let intervalTimer = setInterval(() => {
    // 获取所有需要触发的 DOM
    bindEleHandler(document.querySelectorAll(`*[${DATA_STATS_BAIDU_OBJ_ATTR}]`))
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
  for (let index = 0; index < tagBoxs.length; index++) {
    let target = tagBoxs[index]
    let statusData = target.getAttribute(DATA_STATS_BAIDU_OBJ_ATTR)
    let hasBindFlag = target.hasAttribute(DATA_STATS_FALG)

    // 检测 statusData 是否存在
    if (!statusData || hasBindFlag) {
      continue
    }

    try {
      statusData = jsonParse(decodeURIComponent(statusData))
    } catch (e) {
      logger.warn(target, `事件追踪 ${DATA_STATS_BAIDU_OBJ_ATTR} 数据不是合法的 JSON 数据`)
      continue
    }

    let eventType = statusData.type

    // 检测传递数据是否存在
    if (!statusData.data) {
      continue
    }

    // 格式化数据
    let data = buildArray(statusData.data)

    if (eventType !== 'click' && eventType !== 'mouseup' && eventType !== 'load') {
      // 事件限制到 click, mouseup, load(直接触发)
      continue
    }

    if (target.classList.contains('mip-stats-eventload')) {
      continue
    }

    target.classList.add('mip-stats-eventload')

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

    target.setAttribute(DATA_STATS_FALG, '1')
  }
}

/**
 * 通过百度统计 API 设置新的 referrer
 * 因为在 iframe 中，统计到的 referrer 不对，所以需要转换 referrer
 */
function setReferrer () {
  let originUrl = ''
  let params = {}
  let hashWord = MIP.hash.get('word') || ''
  let hashEqid = MIP.hash.get('eqid') || ''
  let hashQuery = MIP.hash.get('q') || ''
  let from = MIP.hash.get('from') || ''

  if (from === 'result') {
    // 百度搜索查询参数
    if (hashWord || hashEqid) {
      params.eqid = hashEqid
      params.word = hashWord
    }
    // 神马搜索查询参数
    if (hashQuery) {
      params.q = hashQuery
    }
    if (document.referrer) {
      params.url = ''
      originUrl = document.referrer
    }
  } else {
    let location = window.location
    params.url = ''
    originUrl = location.origin + location.pathname + location.search
  }
  window._hmt.push(['_setReferrerOverride', buildReferrer(originUrl, params)])
}

/**
 * 生成百度统计 _setReferrerOverride 对应的 referrer
 *
 * @param   {string} url       需要被添加参数的 url
 * @param   {Object} params    参数对象
 * @returns {string}           拼装后的 url
 */
function buildReferrer (url, params) {
  let conjMark = url.indexOf('?') < 0 ? '?' : '&'
  let urlData = ''

  Object.keys(params).forEach(key => (urlData += '&' + key + '=' + params[key]))
  urlData = urlData.slice(1)
  return url.indexOf('#') < 0 && urlData
    ? (url + conjMark + urlData)
    : url.replace('#', conjMark + urlData + '#')
}

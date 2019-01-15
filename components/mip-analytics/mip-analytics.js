/**
 * @file mip-analytics 统计框架
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, Image */

let {util, performance} = MIP

/**
 * mip performance 上报的性能数据
 *
 * @type {Object}
 */
let mipSpeedInfo = {}

/**
 * 定时器管理器
 *
 * @type {Array<Function>}
 */
let timers = []

/**
 * 判断展现日志是否已经发出，默认为 false，未发出
 *
 * @type {boolean}
 */
let isSendDisp = false

/**
 * 默认关键事件打点项
 *
 * @type {Array<string>}
 */
const eventPoint = [
  'MIPStart',
  'MIPPageShow',
  'MIPDomContentLoaded',
  'MIPFirstScreen'
]

/**
 * 关键信息都有时，判定为 domready
 *
 * @param   {Object} data 判断的信息数据
 * @returns {boolean}     判断的结果
 */
function isDomReady (data) {
  return data ? eventPoint.every(el => data[el]) : false
}

/**
 * 点击事件handle
 *
 * @param {Array<Object>} triggers 触发点击事件的配置信息
 * @param {string} eventName 事件名称
 */
function clickHandle (triggers, eventName) {
  triggers.forEach(el => {
    let ancestors = el.tag ? document.querySelectorAll(el.selector) : [document]
    let eventTag = el.tag || el.selector

    ancestors.forEach(dom => util.event.delegate(
      dom,
      eventTag,
      eventName,
      () => log.send(el, dom.getAttribute('data-click') || ''),
      false
    ))
  })
}

/**
 * 清除所有的 setInterval
 */
function clearAllTimer () {
  timers.forEach(el => clearInterval(el))
}

/**
 * 判断是否为对象
 *
 * @param   {any} obj 待判断的内容
 * @returns {boolean} 判断的结果
 */
function isObject (obj) {
  return typeof obj === 'object'
}

/**
 * 事件绑定相关操作
 *
 * @type {Object}
 */
let triggers = {

  click (triggers) {
    clickHandle(triggers, 'click')
  },

  touchend (triggers) {
    clickHandle(triggers, 'touchend')
  },

  disp (triggers) {
    performance.on('update', data => {
      if (!isSendDisp && isDomReady(data)) {
        mipSpeedInfo = data
        isSendDisp = true
        triggers.forEach(el => log.send(el))
      }
    })
  },

  scroll () {},

  timer (triggers) {
    triggers.forEach(el => timers.push(
      setInterval(() => log.send(el), el.option.interval || 4000)
    ))
  }
}

/**
 * 日志相关的封装
 *
 * @type {Object}
 */
let log = {

  /**
   * 数据序列化处理
   *
   * @param   {Object} obj 必须是对象
   * @param   {string} vars 配置变量,用于替换1级参数的插值
   * @returns {string}      拼接后的字符串
   */
  serialize (obj, vars) {
    if (!obj) {
      return ''
    }

    let str = ''
    let item = ''
    if (isObject(obj)) {
      for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
          item = obj[k]
          if (typeof item === 'undefined') {
            continue
          }

          if (isObject(item)) {
            item = JSON.stringify(item)
          }

          str += k + '=' + encodeURIComponent(this.valReplace(item, vars)) + '&'
        }
      }
      str = str.substring(0, str.length - 1) // 去掉末尾的&
    } else if (typeof obj === 'string') {
      str = obj
    }

    return str
  },

  /**
   * 使用img的方式发送日志
   *
   * @param {string} url src链接
   */
  imgSendLog (url) {
    let key = 'MIP_ANALYTICS_IMAGE_' + Date.now()
    let img = window[key] = new Image()

    img.onload = () => {
      // 防止多次触发onload;
      img.onload = img.onerror = img.onabort = null
      // 清空引用,避免内存泄漏
      window[key] = null
      img = null
    }
    img.src = url
  },

  /**
   * 替换插值 ${var}
   *
   * @param   {string} str  被替换的字符串
   * @param   {string} vars 替换变量
   * @returns {string}      替换后的字符串
   */
  valReplace (str, vars) {
    vars = vars || {}
    util.fn.extend(vars, mipSpeedInfo)

    return str.replace(/(\${.*})/g, $1 => {
      let key = $1.substring(2, $1.length - 1).trim()
      if (typeof vars[key] === 'object') {
        return ''
      }

      return vars[key] || $1
    })
  },

  /**
   * 发送日志
   *
   * @param {Object} cfg 日志的配置信息，需要符合一定规范
   * @param {Object|string} params json 数据或者 object 数据，会自动放到 ext 字段中
   */
  send (cfg, params) {
    if (params) {
      cfg.queryString.ext = params
    } else {
      try {
        delete cfg.queryString.ext
      } catch (e) {
        cfg.queryString.ext = undefined
      }
    }
    let queryString = this.serialize(cfg.queryString, cfg.vars) + '&t=' + Date.now()
    let url = this.valReplace(cfg.host, cfg.vars) + queryString
    this.imgSendLog(url)
  }
}

export default class MIPAnalytics extends MIP.CustomElement {
  /**
   * 构造元素，只会运行一次
   */
  build () {
    // 获取config
    let script = this.element.querySelector('script[type="application/json"]')
    let cfg = this.cfg = util.jsonParse(script.textContent.toString())

    if (!cfg.setting || !cfg.hosts) {
      return
    }

    // 全局代理事件
    for (let prop in cfg.setting) {
      if (cfg.setting.hasOwnProperty(prop)) {
        // 替换host变量
        let events = cfg.setting[prop]
        events.forEach(el => (el.host = cfg.hosts[el.host]))
        triggers[prop] && triggers[prop].call(this, events)
      }
    }
  }

  /**
   * 销毁组件的时候清除所有的回调
   */
  disconnectedCallback () {
    clearAllTimer()
  }

  /**
   * 兼容 customElement v0 标准的组件销毁回调
   */
  detachedCallback () {
    clearAllTimer()
  }
}

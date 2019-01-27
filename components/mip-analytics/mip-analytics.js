/**
 * @file mip-analytics 统计框架
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, Image */

const { util, performance } = MIP

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
 * 判断是否为对象
 *
 * @param   {any} obj 待判断的内容
 * @returns {boolean} 判断的结果
 */
function isObject (obj) {
  return typeof obj === 'object'
}

export default class MIPAnalytics extends MIP.CustomElement {
  constructor (element) {
    super(element)

    /**
     * 定时器管理器
     *
     * @type {Array<Function>}
     */
    this.timers = []

    /**
     * mip performance 上报的性能数据
     *
     * @type {Object}
     */
    this.mipSpeedInfo = {}

    /**
     * 判断展现日志是否已经发出，默认为 false，未发出
     *
     * @type {boolean}
     */
    this.isSendDisp = false

    /**
     * 事件绑定相关操作
     *
     * @type {Object}
     */
    this.triggers = {

      click (triggers) {
        this.clickHandle(triggers, 'click')
      },

      touchend (triggers) {
        this.clickHandle(triggers, 'touchend')
      },

      disp (triggers) {
        performance.on('update', data => {
          if (!this.isSendDisp && isDomReady(data)) {
            this.mipSpeedInfo = data
            this.isSendDisp = true
            triggers.forEach(el => this.log.send(el))
          }
        })
      },

      scroll () {},

      timer (triggers) {
        triggers.forEach(el => this.timers.push(
          setInterval(() => this.log.send(el), el.option.interval || 4000)
        ))
      }
    }

    /**
     * 日志相关的封装
     *
     * @type {Object}
     */
    this.log = {

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
        util.fn.extend(vars, this.mipSpeedInfo)

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
  }

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
        this.triggers[prop] && this.triggers[prop].call(this, events)
      }
    }
  }

  /**
   * 点击事件handle
   *
   * @param {Array<Object>} triggers 触发点击事件的配置信息
   * @param {string} eventName 事件名称
   */
  clickHandle (triggers, eventName) {
    triggers.forEach(el => {
      let ancestors = el.tag ? [...document.querySelectorAll(el.selector)] : [document]
      let eventTag = el.tag || el.selector

      ancestors.forEach(dom => {
        util.event.delegate(
          dom,
          eventTag,
          eventName,
          () => this.log.send(el, dom.getAttribute && (dom.getAttribute('data-click') || '')),
          false
        )
      })
    })
  }

  /**
   * 清除所有的 setInterval
   */
  clearAllTimer () {
    this.timers.forEach(timerId => clearInterval(timerId))
  }

  /**
   * 销毁组件的时候清除所有的回调
   */
  disconnectedCallback () {
    this.clearAllTimer()
  }
}

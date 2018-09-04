/**
 * @file mip-analytics 统计框架
 * @author {306880673@qq.com, tfciw}
 * @transfer-date 2018/08
 */
const { CustomElement, util, performance } = MIP

export default class MipAnalytics extends CustomElement {
  constructor (...args) {
    super(...args)
    this.mipSpeedInfo = {}
    this.timer = []
    this.eventPoint = [
      'MIPStart',
      'MIPPageShow',
      'MIPDomContentLoaded',
      'MIPFirstScreen'
    ]
    this.defaultDispKey = 'domready'
    this.isSendDisp = {}
    this.isSendDisp[this.defaultDispKey] = 0
<<<<<<< HEAD
    this.triggers = {

=======

    this.triggers = {

      /**
       * 处理组件使用时定义的click
       *
       * @param {Object} triggers
       */
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      click (triggers) {
        this.clickHandle(triggers, 'click')
      },

<<<<<<< HEAD
=======
      /**
       * 处理组件使用时定义的touchend
       *
       * @param {Object} triggers
       */
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      touchend (triggers) {
        this.clickHandle(triggers, 'touchend')
      },

<<<<<<< HEAD
=======
      /**
       * 处理组件使用时定义的disp事件
       *
       * @param {Object} triggers
       */
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      disp (triggers) {
        performance.on('update', data => {
          if (!this.isSendDisp[this.defaultDispKey] && this.isDomReady(data)) {
            this.mipSpeedInfo = data
            triggers.forEach(el => {
              this.send(el)
            })
          }
        })
      },

<<<<<<< HEAD
=======
      /**
       * 按着mip1组件来，scroll备用
       */
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      scroll () {

      },

<<<<<<< HEAD
=======
      /**
       * 处理组件使用时定义的timer
       *
       * @param {Object} triggers
       */
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      timer (triggers) {
        triggers.forEach(el => {
          this.timer.push(setInterval(() => {
            this.send(el)
          }, el.option.interval || 4000))
        })
      }

    }
  }

  build () {
<<<<<<< HEAD
    // 获取config
=======
    // 获取页面script配置的host以及事件及其对应trigger事件属性
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
    let cfg = {}
    try {
      let script = this.element.querySelector('script[type="application/json"]')
      cfg = JSON.parse(script.textContent.toString())
    } catch (e) {
      console.warn('json is illegal'); // eslint-disable-line
      console.warn(e); // eslint-disable-line
      return
    }
    if (!cfg.setting || !cfg.hosts) {
      return
    }

    // 全局代理事件
    for (let prop in cfg.setting) {
      if (cfg.setting.hasOwnProperty(prop)) {
        // 替换host变量
        let events = cfg.setting[prop]
        events.forEach(el => {
          el.host = cfg.hosts[el.host]
        })
        this.triggers[prop] && this.triggers[prop].call(this, events)
      }
    }
  }

  /**
<<<<<<< HEAD
   * 点击事件handle
   *
   * @param {Object} triggers
   * @param {string} 事件名
=======
   * 点击事件处理
   *
   * @param {Object} triggers
   * @param {string} eventName 事件名
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
   */
  clickHandle (triggers, eventName) {
    triggers.forEach(el => {
      let ancestors = el.tag ? document.querySelectorAll(el.selector) : [document]
      let eventTag = el.tag || el.selector

      ancestors.forEach(dom => {
        util.event.delegate(dom, eventTag, eventName, () => {
<<<<<<< HEAD
          let params = this.element.getAttribute('data-click') || ''
          let paramsObj = (function () {
            return params
          }())
=======
          let paramsObj = this.element.getAttribute('data-click') || ''
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
          this.send(el, paramsObj)
        }, false)
      })
    })
  }

  /**
<<<<<<< HEAD
   * 判断dom是否处于ready
   *
   * @param {Object}} performance 触发update事件的返回对象
   * @return {String || false} data返回的对象含有定义的eventPoint，data不存在即返回false
=======
   * 根据performance定义的事件和this.eventPoint 判断当前文档dom是否构建完毕
   *
   * @param {Object} data 为performance模块定义的事件
   * @return {number || boolean}
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
   */
  isDomReady (data) {
    return data ? this.eventPoint.every(el => {
      return data[el]
    })
      : false
  }

  /**
<<<<<<< HEAD
   * 判断是否为对象
   *
   * @param {Object}
   * @return {boolean}
   */
  isObject (obj) {
    return typeof obj === 'object'
  }

  /**
=======
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
   * 使用img的方式发送日志
   *
   * @param {string} url src链接
   */
  imgSendLog (url) {
    let key = 'IMAGE' + (new Date()).getTime()
    let img = window[key] = new Image()
    img.addEventListener('load', () => {
      // 防止多次触发onload;
      img.onload = img.onerror = img.onabort = null
      // 清空引用,避免内存泄漏
      window[key] = null
      img = null
    })
    img.src = url
  }

  /**
   * 替换插值 ${var}
   *
<<<<<<< HEAD
   * @param {string}  str 被替换的字符串
   * @param {string}  vars 替换变量
   * @return {string}
=======
   * @param {string} str 被替换的字符串
   * @param {string} vars 替换变量
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
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
  }

  /**
   * 数据序列化处理
   *
   * @param {Object} obj 必须是对象
   * @param {string} vars 配置变量,用于替换1级参数的插值
<<<<<<< HEAD
   * @return {string}
   */
  serialize (obj, lets) {
=======
   */
  serialize (obj, vars) {
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
    if (!obj) {
      return ''
    }
    let str = ''
<<<<<<< HEAD
    let item = ''
    if (this.isObject(obj)) {
      for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
          item = obj[k]
          if (typeof item === 'undefined') {
            continue
          }
          if (this.isObject(item)) {
            item = JSON.stringify(item)
          }
          str += k + '=' + encodeURIComponent(this.valReplace(item, lets)) + '&'
        }
      }
      str = str.substring(0, str.length - 1) // 去掉末尾的&
    } else if (this.isString(obj)) {
=======
    if (typeof obj === 'object') {
      // 这一块不是做筛选，obj[key] 一般情况是string，所以如果是object转为字符串，不是就直接走字符串拼接，而不是筛选出为object的项
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'undefined') {
          return
        }
        if (typeof obj[key] === 'object') {
          obj[key] = JSON.stringify(obj[key])
        }
        str += key + '=' + encodeURIComponent(this.valReplace(obj[key], vars)) + '&'
      })
      str = str.substring(0, str.length - 1) // 去掉末尾的&
    } else if (typeof str === 'string') {
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
      str = obj
    }
    return str
  }

  /**
<<<<<<< HEAD
   * 发送统计
   *
   * @param {Object}} script配置
   * @param {Object}} query参数
=======
   * 发送请求
   *
   * @param {Object} cfg triggers对象包含的事件
   * @param {string} params 组件使用时配置的参数对象
>>>>>>> c87ff93698ca4aa43ec91d885e895645fe8c9456
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
    let queryString = this.serialize(cfg.queryString, cfg.vars) + '&t=' + new Date().getTime()
    let url = this.valReplace(cfg.host, cfg.vars) + queryString
    this.imgSendLog(url)
  }
}

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
    this.triggers = {

      click (triggers) {
        this.clickHandle(triggers, 'click')
      },

      touchend (triggers) {
        this.clickHandle(triggers, 'touchend')
      },

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

      scroll () {

      },

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
    // 获取config
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
   * 点击事件handle
   *
   * @param {Object} triggers
   * @param {string} 事件名
   */
  clickHandle (triggers, eventName) {
    triggers.forEach(el => {
      let ancestors = el.tag ? document.querySelectorAll(el.selector) : [document]
      let eventTag = el.tag || el.selector

      ancestors.forEach(dom => {
        util.event.delegate(dom, eventTag, eventName, () => {
          let params = this.element.getAttribute('data-click') || ''
          let paramsObj = (function () {
            return params
          }())
          this.send(el, paramsObj)
        }, false)
      })
    })
  }

  /**
   * 判断dom是否处于ready
   *
   * @param {Object}} performance 触发update事件的返回对象
   * @return {String || false} data返回的对象含有定义的eventPoint，data不存在即返回false
   */
  isDomReady (data) {
    return data ? this.eventPoint.every(el => {
      return data[el]
    })
      : false
  }

  /**
   * 判断是否为对象
   *
   * @param {Object}
   * @return {boolean}
   */
  isObject (obj) {
    return typeof obj === 'object'
  }

  /**
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
   * @param {string}  str 被替换的字符串
   * @param {string}  vars 替换变量
   * @return {string}
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
   * @return {string}
   */
  serialize (obj, lets) {
    if (!obj) {
      return ''
    }
    let str = ''
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
      str = obj
    }
    return str
  }

  /**
   * 发送统计
   *
   * @param {Object}} script配置
   * @param {Object}} query参数
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

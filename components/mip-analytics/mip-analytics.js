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

      /**
       * 处理组件使用时定义的click
       *
       * @param {Object} triggers html模板中定义的配置
       */
      click (triggers) {
        this.clickHandle(triggers, 'click')
      },

      /**
       * 处理组件使用时定义的touchend
       *
       * @param {Object} triggers html模板中定义的配置
       */
      touchend (triggers) {
        this.clickHandle(triggers, 'touchend')
      },

      /**
       * 处理组件使用时定义的disp事件
       *
       * @param {Object} triggers html模板中定义的配置
       */
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

      /**
       * 按着mip1组件来，scroll备用
       */
      scroll () {

      },

      /**
       * 处理组件使用时定义的timer
       *
       * @param {Object} triggers html模板中定义的配置
       */
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
    // 获取页面script配置的host以及事件及其对应trigger事件属性
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
   * 点击事件处理
   *
   * @param {Object} triggers html模板中定义的配置
   * @param {string} eventName 事件名
   */
  clickHandle (triggers, eventName) {
    triggers.forEach(el => {
      let ancestors = el.tag ? document.querySelectorAll(el.selector) : [document]
      let eventTag = el.tag || el.selector
      let This = this

      ancestors.forEach(dom => {
        // 需要在delegate获取调用方法的HTMLElement，所以未使用箭头函数，并定义了This变量
        util.event.delegate(dom, eventTag, eventName, function () {
          let paramsObj = this.getAttribute('data-click') || ''
          This.send(el, paramsObj)
        }, false)
      })
    })
  }

  /**
   * 根据performance定义的事件和this.eventPoint 判断当前文档dom是否构建完毕
   *
   * @param {Object} data 为performance模块定义的事件
   * @returns {number|boolean} 期望number，data[el]，匹配失败返回false
   */
  isDomReady (data) {
    return data ? this.eventPoint.every(el => {
      return data[el]
    })
      : false
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
   * @param {string} str 被替换的字符串
   * @param {string} vars 替换变量
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
   */
  serialize (obj, vars) {
    if (!obj) {
      return ''
    }
    let str = ''
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
      str = obj
    }
    return str
  }

  /**
   * 发送请求
   *
   * @param {Object} cfg triggers对象包含的事件
   * @param {string} params 组件使用时配置的参数对象
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

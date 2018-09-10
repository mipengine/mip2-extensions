/**
 * @file mip-form-fn.js 表单组件原型类
 * @author duxiaonan@baidu.com (duxiaonan)
 */

let { util, viewer } = MIP
let evt
const REGS = {
  EMAIL: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
  PHONE: /^1\d{10}$/,
  IDCAR: /^\d{15}|\d{18}$/
}

export default class Form {
  /**
   * createDom 创建 form 节点
   *
   * @param {HTMLElement} element 组件节点
   */
  createDom (element) {
    let url = element.getAttribute('url')
    let target = element.getAttribute('target')
    let form = document.createElement('form')
    let method = (element.getAttribute('method') || 'GET').toUpperCase()
    form.action = url
    form.method = method
    target = target || '_blank'
    form.target = viewer.isIframed && target !== '_blank' ? '_top' : target
    element.appendChild(form)
    util.dom.insert(form, element.children)

    // 按钮提交
    let curEles = element.querySelectorAll('form')
    for (let item of curEles) {
      item.addEventListener('submit', event => {
        event.preventDefault()
        evt = event
        this.onSubmit(element)
      })
    }

    // 部分浏览器回车不触发submit,
    element.addEventListener('keydown', event => {
      if (event.keyCode === 13) {
        // 为了使余下浏览器不多次触发submit, 使用prevent
        evt = event
        event.preventDefault()
        this.onSubmit(this)
      }
    })
  }

  /**
   * 事件通信
   *
   * @description 在 input focus 或 blur 时向iframe外层文档发送数据，iframe外层文档返回设置预览头部为 absolute
   * @param {Object} event 事件对象
   */
  sendFormMessage (event) {
    if (viewer.isIframed) {
      // mip_video_jump 为写在外层的承接方法
      viewer.sendMessage('input-' + event, {})
    }
  }

  /**
   * 事件发送处理
   *
   * @description 给 input 绑定事件，向 SF 发送数据，为了解决 ios 的 UC 浏览器在iframe外层文档悬浮头部 fixed 位置混乱问题
   * @param {HTMLElement} element mip 组件标签
   */
  initMessageEvents (element) {
    let inputAll = element.querySelectorAll('input')
    for (let item of inputAll) {
      item.addEventListener('focus', () => {
        this.sendFormMessage('focus')
      })

      item.addEventListener('blur', () => {
        this.sendFormMessage('blur')
      })
    }
  }

  /**
   * 文案格式验证
   *
   * @param {string} type 验证类型
   * @param {string} value 需要验证的文案
   * @returns {boolean} 是否符合自定义校验
   */
  verification (type, value) {
    return (type === 'must') ? !(value === '') : REGS[type.toUpperCase()].test(value)
  }

  /**
   * 点击提交按钮事件处理函数
   *
   * @param {HTMLElement} element form节点
   */
  onSubmit (element) {
    let preventSubmit = false
    let inputs = element.querySelectorAll('input, textarea, select')
    let url = element.getAttribute('url') || ''
    let getUrl = url.toLowerCase()
    let isHttp = getUrl.match('http://')
    let valueJson = ''
    let hasFetch = element.getAttribute('fetch-url') || ''
    this.method = (element.getAttribute('method') || 'GET').toUpperCase()
    let isGet = this.method === 'GET'

    this.ele = element
    this.successEle = element.querySelector('[submit-success]')
    this.errorEle = element.querySelector('[submit-error]')
    // 执行提交句柄
    this.submitHandle()
    for (let item of inputs) {
      let type = item.getAttribute('validatetype')
      let target = item.getAttribute('validatetarget')
      let regval = item.getAttribute('validatereg')
      let value = item.value
      let reg

      if (item.type === 'submit') {
        break
      } else if (item.type === 'checkbox' || item.type === 'radio') {
        value = item.checked ? item.value : ''
      }

      valueJson += '&' + item.name + '=' + value
      if (type) {
        if (regval) {
          reg = value === '' ? false : (new RegExp(regval)).test(value)
        } else {
          reg = this.verification(type, value)
        }
        util.css(element.querySelectorAll('div[target="' + target + '"]'), {display: (!reg ? 'block' : 'none')})
        preventSubmit = !reg ? true : preventSubmit
      }
    }

    if (preventSubmit) {
      return
    }

    // 在SF环境下使用mibm-jumplink，跳转显示原链接。 http-GET请求交给外层跳转
    if (!MIP.standalone && isHttp && isGet) {
      let messageUrl = ''
      if (getUrl.match('\\?')) {
        // eg. getUrl == 'http://www.mipengine.org?we=123'
        messageUrl = getUrl + valueJson
      } else {
        // eg. getUrl == 'http://www.mipengine.org'
        valueJson = valueJson.substring(1)
        messageUrl = getUrl + '?' + valueJson
      }
      let message = {
        url: messageUrl
      }
      MIP.viewer.sendMessage('mibm-jumplink', message)
    } else if (hasFetch.trim()) {
      this.fetchUrl(hasFetch)
    } else {
      // https请求 或 post请求 或 非SF环境下不做处理
      element.getElementsByTagName('form')[0].submit()
    }
  }

  /**
   * 提交时的事件
   */
  submitHandle () {
    viewer.eventAction.execute('submit', evt.target, evt)
  }

  /**
   * 提交成功调用的在html on里使用的事件
   */
  submitSuccessHandle () {
    if (!evt) { return }
    viewer.eventAction.execute('submitSuccess', evt.target, evt)
  }

  /**
   * 提交失败调用的在html on里使用的事件
   */
  submitErrorHandle () {
    if (!evt) { return }
    viewer.eventAction.execute('submitError', evt.target, evt)
  }
}

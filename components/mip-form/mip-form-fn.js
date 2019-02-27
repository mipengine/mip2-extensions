/**
 * @file mip-form-fn.js 表单组件原型类
 * @author duxiaonan@baidu.com (duxiaonan)
 */

const {
  util,
  viewer,
  templates
} = MIP
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
    this.element = element
    this.url = element.getAttribute('url') || ''
    this.method = (element.getAttribute('method') || 'GET').toUpperCase()
    this.successEle = element.querySelector('[submit-success]')
    this.errorEle = element.querySelector('[submit-error]')
    this.requestUrl = (element.getAttribute('fetch-url') || '').trim() || ''

    let form = document.createElement('form')
    let target = element.getAttribute('target') || '_blank'
    form.action = this.url
    form.method = this.method
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

    // 部分浏览器回车不触发submit
    element.addEventListener('keydown', event => {
      if (event.keyCode === 13) {
        // 为了使余下浏览器不多次触发submit, 使用prevent
        evt = event
        event.preventDefault()
        this.onSubmit(element)
      }
    })
  }

  /**
   * 点击提交按钮事件处理函数
   *
   * @param {HTMLElement} element form节点
   */
  onSubmit (element) {
    const isHttp = this.url.toLowerCase().match('http://')
    const isGetMethod = this.method === 'GET'
    let preventSubmit = false

    // 执行提交句柄
    this.submitHandle()

    // 简单的输入校验
    let jumpUrlParams = ''
    let inputs = this.element.querySelectorAll('input, textarea, select')
    for (let input of inputs) {
      if (input.type === 'submit') {
        break
      }
      let inputValue = input.value
      if (input.type === 'checkbox' || input.type === 'radio') {
        inputValue = input.checked ? inputValue : ''
      }
      jumpUrlParams += '&' + input.name + '=' + inputValue
      const validateSuccess = this.validateInput(input, inputValue)
      preventSubmit = !validateSuccess ? true : preventSubmit
    }

    if (preventSubmit) {
      return
    }

    // 在SF环境下使用mibm-jumplink，跳转显示原链接。 http-GET请求交给外层跳转
    if (!MIP.standalone && isHttp && isGetMethod) {
      const jumpUrl = this.getJumpUrl(jumpUrlParams)
      viewer.sendMessage('mibm-jumplink', {
        url: jumpUrl
      })
    } else if (this.requestUrl) {
      this.fetchUrl(this.requestUrl)
    } else {
      // https请求 或 post请求 或 非SF环境下直接提交
      this.element.getElementsByTagName('form')[0].submit()
    }
  }

  /**
   * 校验输入符合规则
   *
   * @param {HTMLElement} inputElement input Dom
   * @param {string} value 需要校验的值
   * @returns {boolean} validate success
   */
  validateInput (inputElement, value) {
    const validateType = inputElement.getAttribute('validatetype')
    const validateTarget = inputElement.getAttribute('validatetarget')
    const validateReg = inputElement.getAttribute('validatereg')
    const emptyValue = (value === '')
    let validateSuccess = true

    if (!validateType) {
      return validateSuccess
    }

    if (validateReg) {
      validateSuccess = !emptyValue && (new RegExp(validateReg)).test(value)
    } else {
      validateSuccess = (validateType === 'must') ? !emptyValue : REGS[validateType.toUpperCase()].test(value)
    }
    util.css(this.element.querySelectorAll('div[target="' + validateTarget + '"]'), {
      display: (!validateSuccess ? 'block' : 'none')
    })
    return validateSuccess
  }

  /**
   * 获取 SF 环境 http 跳转 URL
   *
   * @param {string} urlParams URL 参数
   * @returns {string} jumpUrl
   */
  getJumpUrl (urlParams) {
    let jumpUrl = ''
    if (this.url.match('\\?')) {
      // eg. getUrl == 'http://www.mipengine.org?we=123'
      jumpUrl = this.url + urlParams
    } else {
      // eg. getUrl == 'http://www.mipengine.org'
      urlParams = urlParams.substring(1)
      jumpUrl = this.url + '?' + urlParams
    }
    return jumpUrl
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

  /**
   * 处理fetch请求逻辑
   *
   * @param {string} url 请求url
   */
  fetchUrl (url) {
    util.css([this.successEle, this.errorEle], {display: 'none'})
    let fetchData = {
      method: this.method,
      credentials: 'include'
    }
    if (this.method === 'POST') {
      const formD = this.element.querySelector('form')
      if (formD) {
        fetchData = util.fn.extend({}, fetchData, {
          body: new FormData(formD)
        })
      }
    }

    fetch(url, fetchData).then((res) => {
      if (res.ok) {
        this.submitSuccessHandle()
        res.json().then((data) => {
          util.css(this.successEle, {display: 'block'})
          this.renderTpl(this.successEle, data)
        }).catch((err) => {
          this.fetchReject(err)
        })
      } else {
        this.submitErrorHandle()
        this.fetchReject({})
      }
    }).catch((err) => {
      this.submitErrorHandle()
      this.fetchReject(err)
    })
  }

  /**
   * fetch 出错逻辑处理
   *
   * @param {Object} err 错误对象
   */
  fetchReject (err) {
    util.css(this.errorEle, {display: 'block'})
    this.renderTpl(this.errorEle, err)
  }

  /**
   * 处理模板渲染
   *
   * @param {HTMLElement} element 模板父节点
   * @param {Object} data 模板渲染数据
   */
  renderTpl (element, data) {
    templates.render(element, data).then((html) => {
      const tempTarget = this.tempHTML(element)
      tempTarget.innerHTML = html
    })
  }

  /**
   * 处理模板渲染
   *
   * @param {HTMLElement} element 渲染后模板父节点
   * @returns {HTMLElement} target 新建DOM节点
   */
  tempHTML (element = document) {
    let target = element.querySelector('[mip-mustache-rendered]')
    if (!target) {
      target = util.dom.create('<div mip-mustache-rendered></div>')
      element.appendChild(target)
    }
    return target
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
    const inputAll = element.querySelectorAll('input')
    for (let item of inputAll) {
      item.addEventListener('focus', () => {
        this.sendFormMessage('focus')
      })

      item.addEventListener('blur', () => {
        this.sendFormMessage('blur')
      })
    }
  }
}

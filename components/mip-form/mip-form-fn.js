/**
 * @file mip-form-fn.js 表单组件原型类
 * @author duxiaonan@baidu.com (duxiaonan)
 */
import { getValidatorFromForm } from './mip-form-validator'
const {
  util,
  viewer,
  templates
} = MIP
const FORM_EVENT = {
  SUBMIT: 'submit',
  SUBMIT_SUCCESS: 'submitSuccess',
  SUBMIT_ERROR: 'submitError',
  VALID: 'valid',
  INVALID: 'invalid'
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
    this.submittingEle = element.querySelector('[submitting]')
    this.requestUrl = (element.getAttribute('fetch-url') || '').trim()
    this.validator = getValidatorFromForm(element)

    let form = document.createElement('form')
    let target = element.getAttribute('target') || '_blank'
    form.action = this.url
    form.method = this.method
    form.target = viewer.isIframed && target !== '_blank' ? '_top' : target
    // 不展现 <form> 默认 validate, 由组件接管 validate 过程
    form.setAttribute('novalidate', '')
    element.appendChild(form)
    util.dom.insert(form, element.children)
    // 添加 <input> 清除按钮
    const addClearBtn = this.element.hasAttribute('clear')
    if (addClearBtn) {
      this.addClearButton()
    }
  }

  setEventHandler () {
    // 表单提交
    let curEles = this.element.querySelectorAll('form')
    for (let item of curEles) {
      item.addEventListener('submit', event => this.onSubmit(event))
    }
    this.element.customElement.addEventAction('submit', () => this.onSubmit())
    // 部分浏览器回车不触发submit
    this.element.addEventListener('keydown', event => {
      if (event.keyCode === 13) {
        this.onSubmit(event)
      }
    })

    // 给 input 绑定事件，向 SF 发送数据
    const inputAll = this.element.querySelectorAll('input')
    for (let item of inputAll) {
      item.addEventListener('focus', () => {
        this.sendFormMessage('focus')
      })

      item.addEventListener('blur', () => {
        this.sendFormMessage('blur')
      })
    }
    // blur
    this.element.addEventListener('blur', (event) => {
      this.validator.onBlur(event)
    }, true)
    // input
    this.element.addEventListener('input', (event) => {
      this.validator.onInput(event)
    }, true)
  }

  /**
   * 点击提交按钮事件处理函数
   *
   * @param {Event} event 对象
   */
  onSubmit (event) {
    event && event.preventDefault()

    const isHttp = this.url.toLowerCase().match('http://')
    const isGetMethod = this.method === 'GET'
    this.triggerCustomEvent(FORM_EVENT.SUBMIT, {})

    // 校验输入
    const valid = this.validator.checkInputValid()
    if (!valid) {
      this.triggerCustomEvent(FORM_EVENT.INVALID, {})
      return
    }
    this.triggerCustomEvent(FORM_EVENT.VALID, {})

    // 在SF环境下使用 mibm-jumplink，跳转显示原链接。 http-GET请求交给外层跳转
    if (!MIP.standalone && isHttp && isGetMethod) {
      const jumpUrlParams = this.getFormAsParamsString(this.element)
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
   * 获取 Form 取值作为跳转 URL 参数
   *
   * @param {*} form 表单
   */
  getFormAsParamsString (form) {
    const data = []
    const inputs = form.querySelectorAll('input, textarea, select')
    for (let input of inputs) {
      let inputValue = input.value
      if (input.type === 'submit') {
        continue
      }

      if (input.type === 'checkbox' || input.type === 'radio') {
        inputValue = input.checked ? inputValue : ''
      }
      data.push(input.name + '=' + inputValue)
    }
    const result = data.join('&')
    return result
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
   * 触发自定义事件
   *
   * @param {string} event 事件名称
   * @param {Object} detail 数据
   */
  triggerCustomEvent (event, detail) {
    viewer.eventAction.execute(event, this.element, detail)
  }

  /**
   * 处理fetch请求逻辑
   *
   * @param {string} url 请求url
   */
  fetchUrl (url) {
    util.css(this.submittingEle, {display: 'block'})
    this.renderTpl(this.submittingEle, {})
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
        res.json().then((data) => {
          this.triggerCustomEvent(FORM_EVENT.SUBMIT_SUCCESS, {
            response: data
          })
          util.css(this.submittingEle, {display: 'none'})
          util.css(this.successEle, {display: 'block'})
          this.renderTpl(this.successEle, data)
        }).catch((err) => {
          this.fetchReject(err)
        })
      } else {
        this.triggerCustomEvent(FORM_EVENT.SUBMIT_ERROR, {})
        this.fetchReject({})
      }
    }).catch((err) => {
      this.triggerCustomEvent(FORM_EVENT.SUBMIT_ERROR, {
        response: err
      })
      this.fetchReject(err)
    })
  }

  /**
   * fetch 出错逻辑处理
   *
   * @param {Object} err 错误对象
   */
  fetchReject (err) {
    util.css(this.submittingEle, {display: 'none'})
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
    if (!element) {
      return
    }
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
   * @description 在 input focus 或 blur 时向iframe外层文档发送数据，iframe 外层文档返回设置预览头部为 absolute。解决 ios 的 UC 浏览器在iframe外层文档悬浮头部 fixed 位置混乱问题
   * @param {Object} event 事件对象
   */
  sendFormMessage (event) {
    if (viewer.isIframed) {
      // mip_video_jump 为写在外层的承接方法
      viewer.sendMessage('input-' + event, {})
    }
  }

  /**
   * 添加清除按钮
   */
  addClearButton () {
    const clearArr = ['text', 'input', 'datetime', 'email', 'number', 'search', 'tel', 'url']
    const clearList = clearArr.map(clear => `input[type=${clear}]`).join(',')
    const clearItems = this.element.querySelectorAll(clearList)

    if (!clearItems.length) {
      return
    }

    let cross = document.createElement('div')
    cross.id = 'mip-form-cross'

    for (let clearItem of clearItems) {
      const itemHeight = clearItem.offsetHeight
      clearItem.addEventListener('focus', function () {
        cross.setAttribute('name', this.getAttribute('name'))
        util.css(cross, {
          top: this.offsetTop + (itemHeight - 16) / 2 - 8 + 'px',
          left: this.offsetWidth - 32 + 'px'
        })
        this.parentNode.appendChild(cross)
        if (this.value !== '') {
          util.css(cross, {display: 'block'})
        } else {
          util.css(cross, {display: 'none'})
          this.addEventListener('input', function () {
            // andriod type=search自带清空按钮, 不显示清空
            if (util && util.platform && util.platform.isAndroid() && this.type === 'search') {
              return
            }
            util.css(cross, {display: (this.value !== '' ? 'block' : 'none')})
          })
        }
      }, false)
      // 点击提交时，如果报错信息展示，则隐藏清空按钮
      clearItem.addEventListener('blur', () => {
        util.css(cross, {display: 'none'})
      }, false)
    }
    cross.addEventListener('mousedown', this.clear, false)
    cross.addEventListener('click', this.clear, false)
    cross.addEventListener('touchstart', this.clear, false)

    // on iOS UIWebview，twice touch cannot enter text
    // see: https://stackoverflow.com/questions/13124340/cant-type-into-html-input-fields-on-ios-after-clicking-twice
    cross.addEventListener('touchend', (event) => {
      const name = event.target.getAttribute('name')
      let input = this.element.querySelector('input[name="' + name + '"]')
      if (document.activeElement === input) {
        window.focus()
        setTimeout(() => {
          input.focus()
        }, 0)
      }
    })
  }

  clear (e) {
    e.stopPropagation()
    e.preventDefault()
    let name = e.target.getAttribute('name')
    let inputSelect = this.parentNode.querySelector('input[name="' + name + '"]')
    inputSelect.value = ''
    util.css(this, {display: 'none'})
  }
}

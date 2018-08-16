/**
 * @file: mip-lightbox.js
 *
 * @author: wangpei07@baidu.com
 * @date: 2016-11-02
 * @author: caoru@baidu.com
 * @date: 2018-08-10
 */

import './mip-lightbox.less'
let {
  CustomElement,
  util,
  viewer
} = MIP
let fixedElement = viewer.fixedElement
let Gesture = util.Gesture
let scrollTop = {
  body: 0,
  documentElement: 0,
  offset: 0
}
export default class MipLightbox extends CustomElement {
  // 自动关闭弹层
  autoClose () {
    let count = this.element.getAttribute('autoclosetime')
    let seconds = this.element.querySelector('.mip-lightbox-seconds')
    // 判断是否有 autoclose 和 seconds
    if (Number(count) && seconds) {
      // 取出用户自定义的 time 值
      let time = Math.abs(Math.ceil(count))
      // 倒计时
      seconds.innerHTML = time
      this.interval = setInterval(() => {
        time -= 1
        seconds.innerHTML = time
        if (time <= 0) {
          this.close()
        }
      }, 1000)
    }
  }
  changeParentNode () {
    let nodes = []
    let childrens = this.element.childNodes
    for (let elem of childrens) {
      if (elem.nodeType === 1) {
        nodes.push(elem)
      }
    }
    this.container = document.createElement('div')
    this.applyFillContent(this.container)
    this.element.appendChild(this.container)
    for (let elem of nodes) {
      this.container.appendChild(elem)
    }
  }

  /**
   * toggle description
   *
   * @param  {Object} event 事件对象]
   *
   */
  toggle (event) {
    this.isOpen() ? this.close(event) : this.openBox(event)
  }

  /**
   * open 打开 sidebar
   *
   * @param  {Object} event 事件对象
   */

  openBox (event) {
    if (this.open) {
      return
    }
    fixedElement.hideFixedLayer(fixedElement._fixedLayer)
    event.preventDefault()
    if (!this.scroll) {
      /* eslint-disable no-new */
      new Gesture(this.element, {
        preventY: true
      })
      /* eslint-enable no-new */
    }
    this.open = true
    util.css(this.element, {
      display: 'block'
    })
    // 保存页面当前滚动状态，因为设置overflow:hidden后页面会滚动到顶部
    scrollTop.body = document.body.scrollTop
    scrollTop.documentElement = document.documentElement.scrollTop
    scrollTop.offset = window.pageYOffset
    document.documentElement.classList.add('mip-no-scroll')

    this.openMask()
    this.autoClose()
  }

  /**
   * close 关闭 sidebar
   *
   * @param  {Object} event 事件对象
   */
  close (event) {
    if (!this.open) {
      return
    }
    fixedElement.showFixedLayer(fixedElement._fixedLayer)
    if (event) {
      event.preventDefault()
    }
    this.open = false
    this.closeMask()
    util.css(this.element, {
      display: 'none'
    })
    document.documentElement.classList.remove('mip-no-scroll')

    // 恢复页面滚动状态到lightbox打开之前
    if (typeof (document.body.scrollTo) === 'function') {
      // 先判断存在，因为safari浏览器没有document.body.scrollTo方法
      document.body.scrollTo(0, scrollTop.body)
    }
    if (typeof (document.documentElement.scrollTo) === 'function') {
      // 先判断存在，因为safari浏览器没有document.documentElement.scrollTo方法
      document.documentElement.scrollTo(0, scrollTop.documentElement)
    }
    window.scrollTo(0, scrollTop.offset)
  }

  /**
   * isOpen description
   *
   * @return {boolean} 是否打开标志
   */
  isOpen () {
    return this.open
  }

  /**
   * openMask 打开浮层
   */
  openMask () {
    // 不存在遮盖层时先创建
    if (!this.maskElement) {
      let mask = document.createElement('div')
      mask.id = 'mip-lightbox-mask'
      mask.setAttribute('on', 'tap:' + this.id + '.close')
      mask.style.display = 'block'

      // 与mip-lightbox 同级dom
      this.element.parentNode.appendChild(mask)
      if (!this.scroll) {
        mask.addEventListener('touchmove', evt => {
          evt.preventDefault()
        }, false)
      }
      this.maskElement = mask
    }

    // 样式设置
    util.css(this.maskElement, {
      display: 'block'
    })
  }

  /**
   * closeMask 关闭遮盖层
   *
   */
  closeMask () {
    if (this.maskElement) {
      util.css(this.maskElement, {
        display: 'none'
      })
      clearInterval(this.interval)
    }
  }

  // 提前渲染
  prerenderAllowed () {
    return true
  }
  // 插入文档时执行
  build () {
    this.open = false
    this.id = this.element.id
    this.scroll = this.element.hasAttribute('content-scroll')
    // bottom 不能为0，不然会覆盖遮盖曾，导致无法关闭lightbox
    util.css(this.element, {
      'position': 'fixed',
      'z-index': 10001,
      'top': 0,
      'right': 0,
      'left': 0,
      'transition': 'opacity 0.1s ease-in'
    })
    this.changeParentNode(this)

    // 事件注册
    this.addEventAction('close', this.close.bind(this))
    this.addEventAction('openBox', this.openBox.bind(this))
    this.addEventAction('toggle', this.toggle.bind(this))
  }
  // 元素从 DOM 上移除之后清除定时器
  disconnectedCallback () {
    clearInterval(this.interval)
  }
}

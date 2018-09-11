import './mip-semi-fixed.less'

let { CustomElement, util, viewport, viewer } = MIP
let { fixedElement } = viewer
/**
 * [YOFFSET 默认fixed top 的距离]
 * @type {integer}
 */
let YOFFSET = 0
/**
 * [STATUS 状态标记对象
 * @type {Object}
 */
const STATUS = {
  STATUS_FIXED: 'mip-semi-fixed-fixedStatus',
  STATUS_SCROLL: 'mip-semi-fixed-scrollStatus'
}

export default class MipSemiFixed extends CustomElement {
  // 提前渲染
  prerenderAllowed () {
    return true
  }

  // 插入文档时执行
  build () {
    let element = this.element
    let offsetTop = util.rect.getElementOffset(element).top
    if (fixedElement && fixedElement._fixedLayer && element.parentNode === fixedElement._fixedLayer) {
      return
    }

    this.container = element.querySelector('div[mip-semi-fixed-container]')
    if (!this.container) {
      console.error('必须有 <div mip-semi-fixed-container> 子节点')
      return
    }
    this.threshold = element.getAttribute('threshold') || YOFFSET
    this.fixedClassNames = ' ' + element.getAttribute('fixedClassNames')
    this.container.setAttribute(STATUS.STATUS_SCROLL, '')

    // SF环境中
    if (!MIP.standalone && util.platform.isIos()) {
      try {
        let wrapp = fixedElement._fixedLayer.querySelector('#' + element.id)
        this.fixedContainer = wrapp.querySelector('div[mip-semi-fixed-container]')
        this.fixedContainer.className += this.fixedClassNames
        this.fixedContainer.setAttribute(STATUS.STATUS_FIXED, '')
        this.fixedContainer.removeAttribute(STATUS.STATUS_SCROLL)
        util.css(this.fixedContainer, {
          top: this.threshold + 'px',
          opacity: 0
        })
      } catch (e) {
        console.error(e)
      }

      viewport.on('scroll', () => {
        this.onIframeScroll(viewport)
      })
      document.body.addEventListener('touchmove', event => {
        this.onIframeScroll(viewport)
      })
      this.onIframeScrolll(viewport)
    } else {
      // 监听滚动事件和 touchmove 事件
      viewport.on('scroll', () => {
        this.onScroll(viewport)
      })
      document.body.addEventListener('touchmove', event => {
        this.onScroll(viewport)
      })
      this.onScroll(viewport)
    }

    // 初始状态为 fixed 时
    if (!util.platform.isIos() && offsetTop <= this.threshold) {
      if (this.container.className.indexOf(this.fixedClassNames) < 0) {
        this.container.className += this.fixedClassNames
      }
      this.container.setAttribute(STATUS.STATUS_FIXED, '')
      util.css(this.container, 'top', this.threshold + 'px')
    } else if (util.platform.isIos() && !MIP.standalone && offsetTop <= this.threshold) {
      util.css(this.fixedContainer.parentNode, {display: 'block'})
      util.css(this.fixedContainer, {opacity: 1})
      util.css(this.container, {opacity: 0})
    }

    /**
     * [关闭点击事件]
     */
    this.addEventAction('close', event => {
      event.preventDefault()
      util.css(element, {
        display: 'none'
      })
      if (!MIP.standalone) {
        util.css(this.fixedContainer, {
          display: 'none'
        })
      }
    })
  }

  /**
   * [onScroll mip 页面滑动事件]
   *
   * @param  {Object} viewport 视图
   */
  onScroll (viewport) {
    let element = this.element
    let container = this.container
    let threshold = this.threshold
    let fixedClassNames = this.fixedClassNames
    let offsetTop = util.rect.getElementOffset(element).top

    if (offsetTop <= threshold) {
      if (container.className.indexOf(fixedClassNames) < 0) {
        container.className += fixedClassNames
      }
      container.setAttribute(STATUS.STATUS_FIXED, '')
      util.css(container, 'top', threshold + 'px')
    } else {
      container.className = container.className.replace(fixedClassNames, '')
      container.removeAttribute(STATUS.STATUS_FIXED)
      util.css(container, 'top', '')
    }
  }

  /**
   * [onIframeScroll iframe 下 mip 页面滑动事件]
   *
   * @param  {Object} viewport 视图
   */
  onIframeScroll (viewport) {
    let element = this.element
    let offsetTop = util.rect.getElementOffset(element).top

    if (offsetTop <= this.threshold) {
      util.css(this.fixedContainer.parentNode, {display: 'block'})
      util.css(this.fixedContainer, {opacity: 1})
      util.css(this.container, {opacity: 0})
    } else {
      util.css(this.fixedContainer.parentNode, {display: 'none'})
      util.css(this.fixedContainer, {opacity: 0})
      util.css(this.container, {opacity: 1})
    }
  }
}

import './mip-semi-fixed.less'

const {CustomElement, util, viewport, viewer} = MIP
const {fixedElement} = viewer
const {warn, error} = util.log('mip-semi-fixed')

/**
 * 默认 fixed top 的距离
 * @type {number}
 */
const Y_OFFSET = 0
const STATUS_FIXED = 'mip-semi-fixed-fixedStatus'
const STATUS_SCROLL = 'mip-semi-fixed-scrollStatus'

/**
 * 获取 fixed class name
 * FIXME: 这里应该返回数组，直接使用字符串不严谨
 *
 * @param {HTMLElement} element 自定义元素 dom 节点
 * @returns {string} class 字符串
 */
function getFixedClassNames (element) {
  let fixedClassNames = element.getAttribute('fixed-class-names')

  if (!fixedClassNames) {
    fixedClassNames = element.getAttribute('fixedClassNames')
    fixedClassNames && warn('[Deprecated] fixedClassNames 写法即将废弃，请使用 fixed-class-names')
  }

  return fixedClassNames
}

export default class MipSemiFixed extends CustomElement {
  // 插入文档时执行
  build () {
    let element = this.element
    let offsetTop = util.rect.getElementOffset(element).top
    if (fixedElement && fixedElement._fixedLayer && element.parentNode === fixedElement._fixedLayer) {
      return
    }

    this.container = element.querySelector('div[mip-semi-fixed-container]')
    if (!this.container) {
      error('必须有 <div mip-semi-fixed-container> 子节点')
      return
    }

    this.threshold = element.getAttribute('threshold') || Y_OFFSET
    this.fixedClassNames = getFixedClassNames(element)
    this.container.setAttribute(STATUS_SCROLL, '')

    // SF环境中
    if (!MIP.standalone && util.platform.isIos()) {
      try {
        let wrapp = fixedElement._fixedLayer.querySelector('#' + element.id)
        this.fixedContainer = wrapp.querySelector('div[mip-semi-fixed-container]')
        this.fixedContainer.className += ' ' + this.fixedClassNames
        this.fixedContainer.setAttribute(STATUS_FIXED, '')
        this.fixedContainer.removeAttribute(STATUS_SCROLL)
        util.css(this.fixedContainer, {
          top: this.threshold + 'px',
          opacity: 0
        })
      } catch (e) {
        error(e)
      }

      viewport.on('scroll', () => this.onIframeScroll(viewport))

      document.body.addEventListener('touchmove', () => this.onIframeScroll(viewport))

      this.onIframeScroll(viewport)
    } else {
      // 监听滚动事件和 touchmove 事件
      viewport.on('scroll', () => this.onScroll(viewport))

      document.body.addEventListener('touchmove', () => this.onScroll(viewport))

      this.onScroll(viewport)
    }

    // 初始状态为 fixed 时
    if (!util.platform.isIos() && offsetTop <= this.threshold) {
      if (this.container.className.indexOf(this.fixedClassNames) < 0) {
        this.container.className += ' ' + this.fixedClassNames
      }
      this.container.setAttribute(STATUS_FIXED, '')
      util.css(this.container, 'top', this.threshold + 'px')
    } else if (util.platform.isIos() && !MIP.standalone && offsetTop <= this.threshold) {
      util.css(this.fixedContainer.parentNode, {display: 'block'})
      util.css(this.fixedContainer, {opacity: 1})
      util.css(this.container, {opacity: 0})
    }

    /**
     * 关闭点击事件
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
   * onScroll mip 页面滑动事件
   */
  onScroll () {
    let {element, container, threshold, fixedClassNames} = this
    let offsetTop = util.rect.getElementOffset(element).top

    if (offsetTop <= threshold) {
      if (container.className.indexOf(fixedClassNames) < 0) {
        container.className += ' ' + fixedClassNames
      }
      container.setAttribute(STATUS_FIXED, '')
      util.css(container, 'top', threshold + 'px')
    } else {
      container.className = container.className.replace(' ' + fixedClassNames, '')
      container.removeAttribute(STATUS_FIXED)
      util.css(container, 'top', '')
    }
  }

  /**
   * onIframeScroll iframe 下 mip 页面滑动事件
   */
  onIframeScroll () {
    let {element, container, fixedContainer, threshold, fixedClassNames} = this
    let offsetTop = util.rect.getElementOffset(element).top

    if (offsetTop <= threshold) {
      if (container.className.indexOf(fixedClassNames) < 0) {
        container.className += ' ' + fixedClassNames
      }
      container.setAttribute(STATUS_FIXED, '')
      util.css(container, 'top', threshold + 'px')

      util.css(fixedContainer.parentNode, {display: 'block'})
      util.css(fixedContainer, {opacity: 1})
      util.css(container, {opacity: 0})
    } else {
      container.className = container.className.replace(' ' + fixedClassNames, '')
      container.removeAttribute(STATUS_FIXED)
      util.css(container, 'top', '')

      util.css(fixedContainer.parentNode, {display: 'none'})
      util.css(fixedContainer, {opacity: 0})
      util.css(container, {opacity: 1})
    }
  }
}

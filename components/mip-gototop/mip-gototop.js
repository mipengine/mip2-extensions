import './mip-gototop.less'

const { CustomElement, viewport } = MIP
const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
const MIP_GOTOTOP_SHOW_CLS = 'mip-gototop-show'

export default class MIPGoToTop extends CustomElement {
  constructor (...args) {
    super(...args)
    this.threshold = this.element.getAttribute('threshold') || 200
    this.delay = parseInt(this.element.getAttribute('delay'), 10) || 0
    this.scrollTop = 0
  }

  /**
   * 滚动至顶部
   */
  scrollToTop () {
    // 直接降级 不做polyfill
    if (!requestAnimationFrame) {
      return viewport.setScrollTop(0)
    }

    // 每次滚动步长
    let step = Math.max(this.scrollTop / 10, 20)
    let goToTop = () => {
      viewport.setScrollTop(this.scrollTop - step)
      if (this.scrollTop > 0) {
        requestAnimationFrame(goToTop)
      }
    }
    requestAnimationFrame(goToTop)
  }

  build () {
    let el = this.element
    let timer

    el.addEventListener('click', this.scrollToTop)

    // 实时获取滚动高度
    viewport.on('scroll', () => {
      this.scrollTop = viewport.getScrollTop()
      if (this.scrollTop >= this.threshold) {
        el.classList.add(MIP_GOTOTOP_SHOW_CLS)
        if (this.delay) {
          clearTimeout(timer)
          timer = setTimeout(() => el.classList.remove(MIP_GOTOTOP_SHOW_CLS), this.delay)
        }
      } else {
        el.classList.remove(MIP_GOTOTOP_SHOW_CLS)
      }
    })
  }
}

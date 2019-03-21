import './mip-gototop.less'

const { CustomElement, util, viewport } = MIP
const { raf } = util.fn
const MIP_GOTOTOP_SHOW_CLS = 'mip-gototop-show'

export default class MIPGoToTop extends CustomElement {
  constructor (...args) {
    super(...args)
    this.scrollTop = 0
  }

  /** @override */
  connectedCallback () {
    const out = parseUnit(this.element.getAttribute('threshold') || '200px')

    this.unit = out[1]
    this.originalThreshold = out[0]
    this.threshold = convertToPixel(out[0], out[1])
  }

  /**
   * 滚动至顶部
   */
  scrollToTop () {
    // 每次滚动步长
    const step = Math.max(this.scrollTop / 10, 20)
    const goToTop = () => {
      viewport.setScrollTop(this.scrollTop - step)
      if (this.scrollTop > 0) {
        raf(goToTop)
      }
    }
    raf(goToTop)
  }

  /** @override */
  build () {
    this.element.addEventListener('click', this.scrollToTop.bind(this))

    const eventHandler = this.eventHandler.bind(this)
    // 在滚动和窗口大小变化的时候获取页面高度决定是否展现 gototop
    viewport.on('scroll', eventHandler)
    viewport.on('resize', () => {
      // update `threshold`
      this.threshold = convertToPixel(this.originalThreshold, this.unit)
      eventHandler()
    })
  }

  /**
   * 处理滚动和窗口大小变化的回调
   * 在回调中获取页面高度，判断是否展现 gototop
   */
  eventHandler () {
    const el = this.element
    this.scrollTop = viewport.getScrollTop()
    if (this.scrollTop >= this.threshold) {
      el.classList.add(MIP_GOTOTOP_SHOW_CLS)
    } else {
      el.classList.remove(MIP_GOTOTOP_SHOW_CLS)
    }
  }
}

/**
 * 转换为 px 的单位，目前只支持 vh 和 px
 *
 * @param {number|string} num 长度
 * @param {string} unit 单位
 * @returns {number} 返回单位为 px 的数字
 */
function convertToPixel (num, unit) {
  if (unit === 'vh') {
    return document.documentElement.clientHeight * num / 100
  }
  return num
}

/**
 * 获取数字和单位 {@link https://github.com/mattdesl/parse-unit/blob/master/index.js}
 *
 * @param {string} str source string
 * @returns {Array.<number, string>} 返回处理好的字符串
 */
function parseUnit (str) {
  const res = [0, '']
  str = String(str)
  const num = parseFloat(str, 10)
  res[0] = num
  res[1] = str.match(/[\d.\-+]*\s*(.*)/)[1] || ''
  return res
}

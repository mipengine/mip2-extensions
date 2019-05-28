import './mip-sticky-ad.less'

const {viewport, util} = MIP
const {css} = util
const {listen} = util.event
const log = util.log('mip-sticky-ad')

/**
 * 更改 body bottom 空位，防止 ad 阻挡内容
 *
 * @param {number} pixel 边框宽度
 */
function updatePaddingBottom (pixel) {
  css(document.body, 'border-bottom', `${pixel}px solid transparent`)
}

/**
 * 移除 rgb 中的 alpha 值
 *
 * @param {string} rgb rgb color
 */
function removeAlphaFromColor (rgb) {
  return rgb.replace(/\(([^,]+),([^,]+),([^,)]+),[^)]+\)/g, '($1,$2,$3, 1)')
}

export default class MIPStickyAd extends MIP.CustomElement {
  build () {
    const ele = this.element
    if (ele.getAttribute('layout') !== 'nodisplay') {
      log.error('必须设置 layout 属性为 nodisplay')
      return
    }

    ele.classList.add('i-miphtml-sticky-ad-layout')
    const children = ele.children
    if (children.length !== 1 || children[0].tagName !== 'MIP-AD') {
      log.error('只接受一个 <mip-ad> 子元素')
      return
    }
    this.ad = children[0]

    // 构造 padding bar
    const paddingBar = document.createElement('div')
    paddingBar.classList.add('mip-sticky-ad-top-padding')
    ele.insertBefore(paddingBar, this.ad)

    // 构造 close button
    const closeButton = document.createElement('button')
    closeButton.classList.add('mip-sticky-ad-close-button')
    closeButton.setAttribute('aria-label',
      this.element.getAttribute('data-close-button-aria-label') || 'Close this ad')
    closeButton.addEventListener('click', this.close.bind(this))
    ele.appendChild(closeButton)

    this.show = this.show.bind(this)
    setTimeout(() => {
      viewport.on('scroll', this.show)
    })
  }

  close () {
    this.element.remove()
    updatePaddingBottom(0)
  }

  show () {
    const ele = this.element
    const scrollTop = viewport.getScrollTop()

    let display = () => {
      ele.setAttribute('visible', '')
      css(ele, 'display', '')
      updatePaddingBottom(ele.offsetHeight)
      this.forceOpacity(window.getComputedStyle(ele)['backgroundColor'])
      setTimeout(() => {
        viewport.off('scroll', this.show)
      })
    }

    // 取 1 兼容 iOS
    if (scrollTop > 1) {
      if (this.ad.isBuilt()) {
        display()
      } else {
        let unlisten = listen(this.ad, 'build', () => {
          display()
          unlisten()
        })
      }
    }
  }

  /**
   * 设置 background-color 的 alpha 为 1，不允许透明
   *
   * @param {string} color background-color
   */
  forceOpacity (color) {
    const newColor = removeAlphaFromColor(color)
    if (newColor === color) {
      return
    }
    log.warn('不允许设置背景透明度')
    css(this.element, 'background-color', newColor)
  }

  disconnectedCallback () {
    viewport.off('scroll', this.show)
    updatePaddingBottom(0)
  }
}

const { CustomElement, util } = MIP
const log = util.log('mip-ainm')

const BUILD_ATTRIBUTES = ['alt', 'aria-label', 'aria-describedby',
  'aria-labelledby']
const LAYOUT_ATTRIBUTES = ['src', 'srcset']
const SRC_PLACEHOLDER = 'data:image/gif;base64,' +
'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * 如果 img 没有 src 属性并且浏览器不支持 srcset，
 * 将 srcset 的第一个 url 作为 img 的 src
 *
 * @param {!Element} img 图像元素
 */
function guaranteeSrcForSrcsetUnsupportedBrowsers (img) {
  if (!img.hasAttribute('src') && 'srcset' in img === false) {
    const srcset = img.getAttribute('srcset')
    const matches = /\S+/.exec(srcset)
    if (matches == null) {
      return
    }
    const srcseturl = matches[0]
    img.setAttribute('src', srcseturl)
  }
}

/**
 * 传播属性
 *
 * @param {HTMLElement} src 源节点
 * @param {HTMLElement} dest 目标节点
 * @param {Array.<string>|string} attrs 属性列表
 */
function propagateAttributes (src, dest, attrs) {
  attrs = Array.isArray(attrs) ? attrs : [attrs]
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (src.hasAttribute(attr)) {
      dest.setAttribute(attr, src.getAttribute(attr))
    }
  }
}

/**
 * promise 在元素加载完成时 resolve
 *
 * @param {!Element} element 待加载元素
 * @returns {!Promise} promise
 */
function loadPromise (element) {
  return new Promise(resolve => {
    element.onload = () => {
      resolve(element)
    }
  })
}

/**
 * Shows or hides the specified element.
 *
 * @param {!Element} element
 * @param {boolean} opt
 */
function toggle (element, opt) {
  if (opt === undefined) {
    opt = element.classList.contains('mip-hide')
  }
  if (opt) {
    element.classList.remove('mip-hide')
  } else {
    element.classList.add('mip-hide')
  }
}

export default class MIPAnim extends CustomElement {
  build () {
    let el = this.element
    this.hasLoaded = false
    this.placeholder = this.getPlaceholder()
    this.img = new Image()
    this.img.setAttribute('decoding', 'async')
    propagateAttributes(el, this.img, BUILD_ATTRIBUTES)
    this.applyFillContent(this.img, true)

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (el.getAttribute('role') === 'img') {
      el.removeAttribute('role')
      log.error('设置 role=img 会导致屏幕阅读器不可用，请使用 alt 或者 ARIA 属性')
    }

    // 如果有 placeholder，img 先隐藏，显示 placeholder
    if (this.placeholder) {
      toggle(this.img, false)
    }

    el.appendChild(this.img)
  }

  viewportCallback (inViewport) {
    if (!this.hasLoaded) {
      return
    }
    this.updateInViewport(inViewport)
  }

  layoutCallback () {
    propagateAttributes(this.element, this.img, LAYOUT_ATTRIBUTES)
    guaranteeSrcForSrcsetUnsupportedBrowsers(this.img)
    return loadPromise(this.img)
  }

  firstLayoutCompleted () {
    this.hasLoaded = true
    this.updateInViewport(true)
  }

  unlayoutCallback () {
    // 释放内存
    this.img.src = SRC_PLACEHOLDER
    this.img.srcset = SRC_PLACEHOLDER
    this.hasLoaded = false
  }

  updateInViewport (inViewport) {
    this.placeholder && toggle(this.placeholder, !inViewport)
    toggle(this.img, inViewport)
  }

  // 兼容 v1 默认将 mip-img 作为 placeholder 的情况
  getPlaceholder () {
    let el = this.element
    let placeholder = el.getPlaceholder()
    if (!placeholder) {
      placeholder = el.querySelector('mip-img')
      placeholder && log.warn("请使用 'placeholder' 属性指定占位符！")
    }
    return placeholder
  }
}

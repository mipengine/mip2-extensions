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
 * Finds the last child element that satisfies the callback.
 *
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */
function lastChildElement (parent, callback) {
  for (let child = parent.lastElementChild; child; child = child.previousElementSibling) {
    if (callback(child)) {
      return child
    }
  }
  return null
}

/**
 * check elements that has a native placeholder property
 * like input and textarea
 *
 *  @param {!Element} element
 */
function isInputPlaceholder (element) {
  return 'placeholder' in element
}

/**
 * promise 在元素 load 事件触发时 resolve
 *
 * @param {!Element} element 待加载元素
 * @returns {!Promise<Element>} promise
 */
function loadPromise (element) {
  return new Promise(resolve => {
    element.onload = () => {
      resolve(element)
    }
  })
}

export default class MipAnim extends CustomElement {
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

    // 如果有 placeholder，mip-anim 先隐藏
    if (this.placeholder) {
      el.classList.add('mip-hidden')
    }

    el.appendChild(this.img)
  }

  layoutCallback () {
    propagateAttributes(this.element, this.img, LAYOUT_ATTRIBUTES)
    guaranteeSrcForSrcsetUnsupportedBrowsers(this.img)
    return loadPromise(this.img)
  }

  unlayoutCallback () {
    // 释放内存
    this.img.src = SRC_PLACEHOLDER
    this.img.srcset = SRC_PLACEHOLDER
    this.hasLoaded = false
  }

  viewportCallback (inViewport) {
    if (!this.hasLoaded) {
      return
    }
    this.updateInViewport(inViewport)
  }

  firstInviewCallback () {
    this.hasLoaded = true
    this.updateInViewport(true)
  }

  updateInViewport (inViewport) {
    this.placeholder && this.placeholder.classList.toggle('mip-hidden', inViewport)
    this.element.classList.toggle('mip-hidden', !inViewport)
  }

  getPlaceholder () {
    return lastChildElement(this, el => {
      return el.hasAttribute('placeholder') && !isInputPlaceholder(el)
    }) || this.element.querySelector('mip-img')
  }
}

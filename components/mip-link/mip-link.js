let {
  CustomElement,
  util
} = MIP

const STYLE = [
  'display',
  'font-size',
  'color'
]

export default class MIPLink extends CustomElement {
  // 判断是否禁止缓存
  isNoCache () {
    let cacheMeta = document.querySelector('meta[property="mip:use_cache"]')
    if (cacheMeta && cacheMeta.getAttribute('content') === 'no') {
      return true
    }
    return false
  }

  getCssStyle (style) {
    let res = document && document.defaultView &&
    document.defaultView.getComputedStyle(this.element, null) &&
    document.defaultView.getComputedStyle(this.element, null)[style]
    return res || null
  }

  build () {
    let el = this.element
    el.setAttribute('pageType', this.isNoCache() ? 2 : 1)

    let tagA = document.createElement('a')
    let href = el.getAttribute('href') || ''
    tagA.setAttribute('href', href)
    tagA.setAttribute('mip-link', '')

    for (let child of [...el.childNodes]) {
      tagA.appendChild(child)
    }
    el.appendChild(tagA)

    util.css(tagA, {
      margin: '0',
      padding: '0',
      width: '100%'
    })

    for (let i = 0; i < STYLE.length; i++) {
      let key = STYLE[i]
      let val = this.getCssStyle(key)
      if (val && val !== '0px') {
        util.css(tagA, key, val)
        util.css(el, key, val)
      }
    }
  }
}

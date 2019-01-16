let {
  CustomElement
} = MIP

export default class MIPHtmlOS extends CustomElement {
  build () {
    let el = this.element
    let os = el.getAttribute('os') || ''
    let isOS = false
    let osUA = navigator.userAgent.toLowerCase()
    if (os === 'android') {
      isOS = osUA.indexOf('android') > -1
    } else if (os === 'ios') {
      isOS = !!osUA.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/i)
    }
    if (isOS) {
      el.style.display = 'block'
    } else {
      el.parentNode.removeChild(el)
    }
  }
}

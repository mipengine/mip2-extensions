const { CustomElement, util } = MIP
const { platform } = util

export default class MIPHtmlOS extends CustomElement {
  build () {
    let el = this.element
    let os = el.getAttribute('os') || ''
    let canShow = false
    if (os === 'android') {
      canShow = platform.isAndroid()
    }
    if (os === 'ios') {
      canShow = platform.isIOS()
    }
    if (canShow) {
      el.style.display = 'block'
    } else {
      el.parentNode.removeChild(el)
    }
  }
}

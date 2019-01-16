import './mip-appdl.less'

let {
  CustomElement,
  util
} = MIP

const log = util.log('mip-appdl')

export default class MIPAppdl extends CustomElement {
  constructor (...args) {
    super(...args)
    let el = this.element
    this.src = el.getAttribute('src') || ''
    this.downBtnText = el.getAttribute('downbtntext') || ''
    this.downloadUrl = el.getAttribute(this.getUserAgent() + '-downsrc') || ''
    this.textTip = el.getAttribute('texttip') || ''
  }

  initialize () {
    let showText = this.getShowText()
    let imageStr = this.src
      ? `
          <div class="mip-appdl-imgbox">
            <img src=${this.src} class="mip-appdl-downimg">
          </div>
        `
      : ''
    let html =
      `
        <div class="mip-appdl-box ${this.src ? '' : 'mip-appdl-pm10'}">
          <div class="mip-appdl-content">
            ${imageStr}
            <div class="mip-appdl-textbox">
              ${showText}
            </div>
            <div class="mip-appdl-downbtn">
              <a href=${this.downloadUrl} target="_blank">${this.downBtnText}</a>
            </div>
            <div class="mip-appdl-closebutton"></div>
          </div>
        </div>
      `

    if (this.downloadUrl) {
      this.element.append(util.dom.create(html))
      this.element.querySelector('.mip-appdl-closebutton').addEventListener('click', () => {
        this.element.parentNode.removeChild(this.element)
      })
    }
  }

  getShowText () {
    let lines = []
    let showText = []
    if (this.textTip) {
      try {
        // 字符串转数组
        /* eslint-disable no-new-func */
        lines = new Function('return ' + this.textTip)()
      } catch (e) {
        log.warn('texttip 属性格式不正确!')
      }
    }
    // 限定最大行数两行
    for (let i = 0; i < Math.min(2, lines.length); i++) {
      showText.push('<p>' + lines[i] + '</p>')
    }
    return showText.join('')
  }

  getUserAgent () {
    if (util.platform.isIOS()) {
      return 'ios'
    }
    if (util.platform.isAndroid()) {
      return 'android'
    }
    return 'other'
  }

  build () {
    this.initialize()
  }
}

import './mip-appdl.less'

const { CustomElement, util } = MIP

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

  /**
   * 根据 texttip 生成 html
   *
   * @returns {string} texttip html
   */
  getShowText () {
    let lines = []
    let showText = []
    if (this.textTip) {
      try {
        // 字符串转数组
        lines = util.jsonParse(this.textTip)
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
    let showText = this.getShowText()
    let imageStr = ''
    if (this.src) {
      imageStr =
        `
          <div class="mip-appdl-imgbox">
            <img src=${this.src} class="mip-appdl-downimg">
          </div>
        `
    }
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
      let el = this.element
      el.appendChild(util.dom.create(html))
      el.querySelector('.mip-appdl-closebutton').addEventListener('click', () => {
        el.parentNode.removeChild(el)
      })
    }
  }
}

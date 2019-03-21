
/**
 * @file mip-font-loader 字体下载检测
 * @description 字体加载，一个是通过document.fonts的方式，一个是通过创建两个div比对的方式
 */

export default class FontLoader {
  constructor () {
    this.container = null

    this.fontConfig = null

    this.fontLoadResolved = false

    this.fontLoadRejected = false
  }

  /**
   * 下载指定字体的load方法
   *
   * @param  {Object} fontConfig 字体相关设置参数
   * @param  {number} timeout    超时时间，默认3000ms
   * @returns {Promise}  promise
   */
  load (fontConfig, timeout) {
    this.fontConfig = fontConfig
    return MIP.Services.timer()
      .timeout(timeout, this.loadMain())
      .then(() => {
        this.fontLoadResolved = true
        this.dispose()
      }, err => {
        this.fontLoadRejected = true
        this.dispose()
        throw err
      })
  }

  /**
   * 下载font控制
   *
   * @returns {Promise} [description]
   */
  loadMain () {
    const fontString = (
      this.fontConfig.fontStyle + ' ' +
      this.fontConfig.variant + ' ' +
      this.fontConfig.weight + ' ' +
      this.fontConfig.size + ' \'' +
      this.fontConfig.family + '\'')

    return new Promise((resolve, reject) => {
      if ('fonts' in document) {
        if (document.fonts.check(fontString)) {
          resolve()
        } else {
          document.fonts.load(fontString).then(() => {
            // chrome bug
            // https://bugs.chromium.org/p/chromium/issues/detail?id=347460
            // 暂时保留，等后续确认 bug 修复再改
            return document.fonts.load(fontString)
            // document.fonts.check(fontString) ? resolve() : reject(new Error('Font load failed'))
          }).then(() => {
            document.fonts.check(fontString) ? resolve() : reject(new Error('Font load failed'))
          }).catch(err => reject(err))
        }
      } else {
        this.loadAnotherWay().then(resolve, reject)
      }
    })
  }

  /**
   * 通过创建两个元素容器填充相同的内容，分别设置自定义字体和默认字体，
   * 检测两个容器的宽度和高度，有差异则自定义字体下载成功，没差异则下载不成功
   */
  loadAnotherWay () {
    let me = this
    return new Promise((resolve, reject) => {
      const comparators = this.createComparators()
      function check () {
        if (me.fontLoadResolved) {
          resolve()
        } else if (me.fontLoadRejected) {
          reject(new Error('Font loading timed out.'))
        } else if (comparators.some(comparator => comparator.compare())) {
          resolve()
        } else {
          setTimeout(check, 100)
        }
      }
      check()
    })
  }

  /**
   * 返回对比器的列表
   *
   * @returns {Array} [description]
   */
  createComparators () {
    const containerElement = this.container =
        document.createElement('div')
    MIP.util.css(containerElement, {
      fontSize: '40px',
      fontVariant: this.fontConfig.variant,
      fontWeight: this.fontConfig.weight,
      fontStyle: this.fontConfig.fontStyle,
      left: '-999px',
      lineHeight: 'normal',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: '-999px',
      visibility: 'hidden'
    })

    const comparators = ['sans-serif', 'serif'].map(defaultFont => new FontComparator(
      containerElement, this.fontConfig.family, defaultFont))
    document.getElementsByTagName('body')[0].appendChild(containerElement)
    return comparators
  }

  dispose () {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
    this.container = null
  }

  /**
   * 定时器
   *
   * @param  {number} time 设置的超时时间
   * @returns {Promise}      [description]
   */
  // timer (time) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(reject, time)
  //   })
  // }
}

class FontComparator {
  /**
   * constructor
   *
   * @param {!Element} container 容器
   * @param {string} customFont 自定义字体
   * @param {string} defaultFont 默认字体
   */
  constructor (container, customFont, defaultFont) {
    this.defaultDiv = this.creatFontDiv(container.ownerDocument, defaultFont)
    this.customDiv = this.creatFontDiv(container.ownerDocument, `${customFont},${defaultFont}`)
    container.appendChild(this.defaultDiv)
    container.appendChild(this.customDiv)
  }

  /**
   * 创建元素容器
   *
   * @param  {Element} doc        [description]
   * @param  {string} fontFamily [description]
   * @returns {string}            [description]
   */
  creatFontDiv (doc, fontFamily) {
    const element = doc.createElement('div')
    element.textContent = 'MIPFontLoaderTestContent123'
    MIP.util.css(element, {
      float: 'left',
      fontFamily: fontFamily,
      margin: 0,
      padding: 0,
      whiteSpace: 'nowrap'
    })
    return element
  }

  /**
   * 比较两个元素容器的高度和宽度，如果宽度或高度有变化则下载成功
   *
   * @returns {boolean} true 下载完成，false 下载失败
   */
  compare () {
    const widthChanged = (
      Math.abs(this.defaultDiv.offsetWidth - this.customDiv.offsetWidth) > 2)
    const heightChanged = (
      Math.abs(this.defaultDiv.offsetHeight - this.customDiv.offsetHeight) > 2)
    return widthChanged || heightChanged
  }
}

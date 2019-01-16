/**
 * @file mip-iqiyi-video.js 视频组件
 * @author chenyongle
 */

const {CustomElement} = MIP

/**
 * 获取 element 中所有 data-param-* 的键值对
 *
 * @param {HTMLElement} element element
 * @param {RegExp} optParamPattern 正则匹配
 * @returns {Object} 返回参数对象
 */
function getDataParams (element, optParamPattern = /^param(.+)/) {
  let {dataset} = element
  let params = {}
  for (let key of Object.keys(dataset)) {
    let matches = key.match(optParamPattern)
    if (matches) {
      let param = matches[1][0].toLowerCase() + matches[1].substr(1)
      params[param] = dataset[key]
    }
  }
  return params
}

function addParamsToUrl (src, params) {
  return src + `&${serializeQS(params)}`
}

function serializeQS (params) {
  let serialize = []
  for (let [key, value] of Object.entries(params)) {
    if (value == null) {
      continue
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        serialize.push(`${encodeURIComponent(key)}=${encodeURIComponent(value[i])}`)
      }
    } else {
      serialize.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }
  return serialize.join('&')
}
let iqiyiVideoAttrs = [
  'data-vid',
  'data-tvid',
  'src'
]
export default class MIPIqiyiVideo extends CustomElement {
  static get observedAttributes () {
    return iqiyiVideoAttrs
  }
  constructor (element) {
    super(element)
    this.iframe = null
    this.iframeSrc = null
    // 下面两个是爱奇艺播放链接必须的参数
    this.videoVid = null
    this.videoTvid = null
  }
  build () {
    let iframe = document.createElement('iframe')
    this.iframe = iframe
    this.iframe.setAttribute('frameborder', 0)
    this.iframe.setAttribute('allowfullscreen', true)
    this.iframe.setAttribute('width', '100%')
    this.iframe.setAttribute('height', '100%')
    this.iframe.src = this.getIframeSrc()
    this.element.appendChild(this.iframe)
    this.applyFillContent(this.iframe, true)
  }
  attributeChangedCallback (attributeName, oldValue, newValue, namespace) {
    if (attributeName === 'src' && oldValue !== newValue) {
      this.iframe && (this.iframe.src = newValue)
    }
    if (attributeName === 'data-vid' && oldValue !== newValue) {
      this.iframe && (this.iframe.src = this.getIframeSrc())
    }
    if (attributeName === 'data-tvid' && oldValue !== newValue) {
      this.iframe && (this.iframe.src = this.getIframeSrc())
    }
  }
  getIframeSrc () {
    let iframeSrc = this.element.getAttribute('src')
    if (iframeSrc) {
      return iframeSrc
    }
    this.videoVid = this.getVideoVid()
    this.videoTvid = this.getVideoTvId()
    if (!this.videoVid || !this.videoTvid) {
      throw new Error('参数 Vid 和 tvid 不能为空')
    }
    let src = 'https://open.iqiyi.com/developer/player_js/coopPlayerIndex.html' +
      '?vid=' + this.videoVid + '&tvId=' + this.videoTvid
    this.iframeSrc = src = addParamsToUrl(src, getDataParams(this.element))
    return src
  }
  getVideoVid () {
    return this.element.getAttribute('data-vid')
  }
  getVideoTvId () {
    return this.element.getAttribute('data-tvid')
  }
}

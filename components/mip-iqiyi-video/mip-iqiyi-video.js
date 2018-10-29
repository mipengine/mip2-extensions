/**
 * @file mip-iqiyi-video.js 视频组件
 * @author chenyongle
 */
const { CustomElement } = MIP
/**
 * 获取 element 中所有 data-param-* 的键值对
 *
 * @param {HTMLElement} element element
 * @param {Function} optComputeParamNameFunc optComputeParamNameFunc
 * @param {RegExp} optParamPattern optParamPattern
 */
function getDataParams (element, optComputeParamNameFunc = key => key,
  optParamPattern = /^param(.+)/) {
  let {dataset} = element
  let params = {}
  for (let key of Object.keys(dataset)) {
    let matches = key.match(optParamPattern)
    if (matches) {
      let param = matches[1][0].toLowerCase() + matches[1].substr(1)
      params[optComputeParamNameFunc(param)] = dataset[key]
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
export default class MIPIqiyiVideo extends CustomElement {
  constructor (element) {
    super(element)
    this.iframe = null
    this.iframeSrc = null
    // 下面两个是爱奇艺播放链接必须的参数
    this.videoVid = null
    this.videoTvid = null
  }
  build () {
    const iframe = document.createElement('iframe')
    this.iframe = iframe
    this.iframe.setAttribute('frameborder', 0)
    this.iframe.setAttribute('allowfullscreen', true)
    this.iframe.setAttribute('width', '100%')
    this.iframe.setAttribute('height', '100%')
    this.iframe.src = this.getIframeSrc()
    this.element.appendChild(this.iframe)
    this.applyFillContent(this.iframe, true)
  }
  getIframeSrc () {
    if (this.element.hasAttribute('src')) {
      return this.element.getAttribute('src')
    }
    this.videoVid = this.getVideoVid()
    this.videoTvid = this.getVideoTvId()
    if (!this.videoVid || !this.videoTvid) {
      throw new Error('参数 Vid 和 tvId 不能为空')
    }
    let src = 'https://open.iqiyi.com/developer/player_js/coopPlayerIndex.html' +
      '?vid=' + this.videoVid + '&tvId=' + this.videoTvid
    const params = getDataParams(this.element)
    this.iframeSrc = src = addParamsToUrl(src, params)
    return src
  }
  getVideoVid () {
    return this.element.getAttribute('data-vid')
  }
  getVideoTvId () {
    return this.element.getAttribute('data-tvId')
  }
}

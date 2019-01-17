/**
 * @file mip-vd-baidu.js
 * @author chenqiushi(qiushidev@gmail.com)
 */

const {CustomElement, util} = MIP
const SERVER = 'https://mipvideo.baidu.com/getvideo'

export default class MIPVdBaidu extends CustomElement {
  build () {
    this.layout = this.element.getAttribute('layout') || ''
    this.width = this.element.getAttribute('width') || ''
    this.height = this.element.getAttribute('height') || ''
    this.src = this.element.getAttribute('src') || ''
    this.title = this.element.getAttribute('title') || ''
    this.poster = this.element.getAttribute('poster') || ''
  }

  firstInviewCallback () {
    let videoData = {
      'src_url': util.parseCacheUrl(location.href),
      'video_url': this.src,
      'poster': util.parseCacheUrl(this.poster),
      'title': this.title
    }

    let vSrc = videoData.video_url

    // 视频的 url 按当前页面的 protocol 补全 http 协议头
    if (vSrc.indexOf('//') === 0) {
      vSrc = location.protocol + vSrc
    }

    videoData['video_url'] = vSrc

    let notHttps = vSrc.indexOf('http://') === 0
    if (notHttps) {
      fetch(this.makeUrl(SERVER, videoData), {
        credentials: 'include'
      }).then(res => {
        return res.json()
      }).then(data => {
        if (data && data.status === 0) {
          // 如果成功，替换成新的视频 url
          let key = 'video_url'
          videoData[key] = data.url
        }
        this.useMipVideo(videoData)
      }).catch(function (e) {
        // 请求失败后的容灾
        this.useMipVideo(videoData)
      })
    } else {
      // 是 https，直接在当前页播放
      this.useMipVideo(videoData)
    }
  }

  /**
   * 根据组件参数，生成视频请求的 url
   *
   * @param {string} server 百度 MIP 视频服务地址
   * @param {Object} urlParams  url 参数
   */
  makeUrl (server, urlParams) {
    if (!urlParams) {
      return server
    }
    let firstKey = true

    for (let key of Object.keys(urlParams)) {
      server += (!firstKey ? '&' : '?') + key + '=' + encodeURIComponent(urlParams[key])
      firstKey = false
    }

    return server
  }

  /**
   * 使用 mip-video 进行播放， notice：目前没有强引组件 js，如果从内置组件移出，得考虑这块
   *
   * @param {Object} urlParams url 参数
   */
  useMipVideo (urlParams) {
    if (!urlParams || !urlParams.src_url) {
      return
    }

    let vd = document.createElement('mip-video')
    // 继承 mip-vd-baidu 的 attributes
    vd.setAttribute('layout', this.layout)
    vd.setAttribute('width', this.width)
    vd.setAttribute('height', this.height)

    // 设置组件需要的参数
    vd.setAttribute('src', urlParams.video_url)
    vd.setAttribute('poster', urlParams.poster)
    vd.setAttribute('controls', '')

    // 将 mip-video 直接替换 mip-vd-baidu
    this.element.parentNode.replaceChild(vd, this.element)
  }
}

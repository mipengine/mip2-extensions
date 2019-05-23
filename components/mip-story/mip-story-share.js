import { decodeStatsInfo } from './utils'
const {
  util,
  viewer
} = MIP
const MIP_STORY_SHARE_SHOW = 'mip-story-share-show'

export default class MIPStoryShare {
  constructor (shareConfig, root) {
    this.shareConfig = shareConfig || {}
    this.root = root
  }

  build () {
    this.shareData = {
      title: this.shareConfig.title,
      titleDefault: document.title,
      content: this.shareConfig.desc || this.shareConfig.content || document.title,
      contentDefault: '我发现了一个精彩的小故事，一起来看吧',
      iconUrl: this.shareConfig.thumbnail,
      iconUrlDefault: ''
    }
    // 微信小故事分享配置
    viewer.sendMessage('wxshare_config', this.shareData)
    this.shareUrl = util.parseCacheUrl(location.href)
    const shareCancelStats = decodeStatsInfo('click', [
      '_trackEvent', '小故事分享取消', '点击', window.location.href
    ])

    const html = `
      <aside class="mip-story-share">
        <div class="mip-share-container">
          <mip-share url="${this.shareUrl}" title="${this.shareData.title}" content="${this.shareData.content}" iconUrl="${this.shareData.iconUrl}">
          </mip-share>
        </div>
        <span class="mip-story-share-cancel" data-stats-baidu-obj="${shareCancelStats}">取消</span>
      </aside>`
    return html
  }

  /**
   * 展示分享元素
   */
  showShareLayer () {
    const scSupport = this.supportCraft()
    // 适配简单搜索，简单没有给出单独调用微信等渠道的api, 所以在这里拦截一下；
    if (scSupport.support) {
      this.callSearchCraftShare(scSupport.os)
      return
    }
    const ele = this.root.querySelector('.mip-story-share')
    ele.classList.add(MIP_STORY_SHARE_SHOW)
  }

  /**
   * 隐藏分享元素
   */
  hideShareLayer () {
    const ele = this.root.querySelector('.mip-story-share')
    ele.classList.remove(MIP_STORY_SHARE_SHOW)
  }

  /**
   * 支持简单搜索分享
   *
   * @param {boolean} osAndroid 是否为 Android 系统
   */
  callSearchCraftShare (osAndroid) {
    let message = {
      func: 'callNativeShare',
      options: {
        'type': 'url',
        'imgurl': this.shareData.iconUrl,
        'title': this.shareData.title,
        'describe': this.shareData.content,
        'url': this.shareUrl || window.location.href
      }
    }

    if (osAndroid) {
      message = JSON.stringify(message)
    }

    try {
      window.Viaduct.postMessage(message)
    } catch (e) {
      // 错误处理
    }
  }

  /**
   * 检测简单搜索是否支持分享
   */
  supportCraft () {
    // 简单搜索ua判断 detect无法判断简单搜索故手动检测
    const shareUa = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const craft = /SearchCraft/i.test(shareUa)
    const shareosAndroid = /Android/i.test(shareUa)
    const shareV = craft && shareUa.match(/SearchCraft\/([\d.]*)/)
    const hostName = util.parseCacheUrl(location.hostname)
    // 在安卓机型内，如果简搜支持且为百度域的可吊起简搜，由于简搜会对非百度域的分享做特殊处理；
    const supportAnd = ((shareosAndroid && parseFloat(shareV[1]) > 1.5) && hostName.indexOf('baidu.com') !== -1)
    const supportIos = (!shareosAndroid && (parseFloat(shareV[1])) > 1.11)
    const support = craft && (supportAnd || supportIos)
    return {
      os: shareosAndroid,
      support: support
    }
  }
}

/**
 * @file 小故事结尾封底页
 * @author wangqizheng
 */
import {
  PAGE_ROLE,
  MIN_RECOMMEND_NUMS,
  BOOKEND_DEFAULT_RECOMMEND
} from './constants'
import {
  fillArr,
  decodeStatsInfo
} from './utils'
const {
  util,
  viewer
} = MIP
const platform = util.platform

export default class MIPStoryBackEnd {
  constructor (storyConfig) {
    this.storyConfig = storyConfig || {}
  }

  build () {
    let data = this.storyConfig
    const href = window.location.href
    const replayStats = decodeStatsInfo('click', ['_trackEvent', '小故事重播', '点击', href])
    const originInfoStats = decodeStatsInfo('click', ['_trackEvent', '来源外链', '点击', href])

    const share = data.share
    const recommend = data.recommend
    const recListHTML = this.renderRecommond(recommend)
    const shareBtnHTML = this.renderShareBtn()
    const closeBtnHTML = this.renderCloseBtn()
    const html = `
      <aside class="mip-backend" page-role="${PAGE_ROLE.sharePage}">
        <div class="mip-backend-control">${closeBtnHTML}${shareBtnHTML}</div>
        <div class="mip-backend-outer">
          <div class="mip-backend-background" style="background-image: url(${share.background})"></div>
          <div class="recommend-item recommend-now">
            <div class="mip-backend-preview"
              style="background-position:center;background-size:cover;background-image:url(${share.thumbnail})" data-stats-baidu-obj="${replayStats}">
              <div class="mip-backend-preview-mask"></div>
              <div class="mip-backend-preview-thumbnail">
                <span class="mip-backend-preview-replay-btn"></span>
              </div>
            </div>
            <div class="recommend-detail">
              <p class="mip-backend-description">${share.title}</p>
              <span class="mip-backend-info" data-stats-baidu-obj="${originInfoStats}">
                <a href="${share.fromUrl}">${share.from}</a>
              </span>
            </div>
          </div>
          ${recListHTML}
        </div>
      </aside>`
    return html
  }

  /**
   * 渲染推荐列表
   *
   * @param {Object} recommend 自定义推荐数据
   */
  renderRecommond (recommend) {
    function recommendStats (url) {
      return decodeStatsInfo('click', ['_trackEvent', '更多推荐', '点击', url])
    }
    // 没有或少于最小推荐数，则补充默认推荐; 如果等于超过最小推荐数，则完全展示自定义推荐
    let items = recommend && recommend.items ? recommend.items : []
    items = fillArr(items, BOOKEND_DEFAULT_RECOMMEND, MIN_RECOMMEND_NUMS)
    if (!items || items.length === 0) {
      return ''
    }

    let innerTpl = ''
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      innerTpl += `
        <a ondragstart="return false;" ondrop="return false;" href="${item.url}"
        class="recommend-item" data-stats-baidu-obj="${recommendStats(item.url)}">
        <div class="mip-backend-preview">
          <mip-story-img src="${item.cover || ''}"></mip-story-img></div>
          <div class="recommend-detail">
            <p>${item.title || ''}</p>
            <span class="item-from" data-src="${item.fromUrl}">${item.from || ''}</span>
          </div>
        </a>`
    }
    return `<div class="recommend-wrap">
      <p class="readmore">更多阅读</p>
      <div class="recommend-container">
        ${innerTpl}
      </div>
    </div>`
  }

  /**
   * 渲染分享按钮
   */
  renderShareBtn () {
    if (!this.isShowShareBtn()) {
      return ''
    }
    const shareStats = decodeStatsInfo('click', [
      '_trackEvent',
      '小故事分享',
      '点击',
      window.location.href
    ])
    return `<span class="mip-backend-share" data-stats-baidu-obj="${shareStats}">
      <span class="mip-backend-preview-share-btn"></span>
    </span>`
  }

  /**
   * 渲染关闭按钮
   */
  renderCloseBtn () {
    if (window.history.length <= 1) {
      return ''
    }
    const closeStatsInBackEnd = decodeStatsInfo('click', [
      '_trackEvent',
      '小故事关闭按钮_分享页',
      '点击',
      window.location.href
    ])
    return `<span class="mip-story-close mip-backend-close" data-stats-baidu-obj="${closeStatsInBackEnd}"></span>`
  }

  /**
   * 在某些情况下不展示分享按钮
   */
  isShowShareBtn () {
    const hostName = util.parseCacheUrl(location.hostname)
    if (platform.isBaiduApp() && !viewer.isIframed && hostName.indexOf('baidu.com') === -1) {
      return false
    }
    return true
  }

  /**
   * 展示小故事封底页
   */
  show () {
    const eleAnimation = document.querySelector('.mip-backend').animate([
      { transform: 'translate3D(0, 100%, 0)', opacity: 0 },
      { transform: 'translate3D(0, 0, 0)', opacity: 1 }
    ], {
      fill: 'forwards',
      easing: 'ease-in',
      duration: 280
    })
    eleAnimation.play()
  }

  /**
   * 隐藏小故事封底页
   */
  hide () {
    const eleAnimation = document.querySelector('.mip-backend').animate([
      { transform: 'translate3D(0, 0, 0)', opacity: 1 },
      { transform: 'translate3D(0, 100%, 0)', opacity: 0 }
    ], {
      fill: 'forwards',
      easing: 'ease-out',
      duration: 280
    })
    eleAnimation.play()
  }
}

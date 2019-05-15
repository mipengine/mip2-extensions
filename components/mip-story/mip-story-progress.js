/**
 * @file 小故事进度条
 */
import { timeStrFormat } from './animation/animation-util'
import { decodeStatsInfo } from './utils'
const css = MIP.util.css
const VISITED = 'mip-story-page-progress-bar-visited'

export default class MIPStoryProgress {
  constructor (root, elements, audioHide, storyConfig) {
    this.root = root
    this.elements = elements
    this.audioHide = audioHide
    this.storyConfig = storyConfig
    this.win = window
    this.items = {}
  }

  build () {
    const closeBtnHTML = this.renderCloseBtn()
    const audioBtnHTML = this.renderAudioBtn()
    let progressBarHTML = ''
    for (let i = 0; i < this.elements.length; i++) {
      progressBarHTML += `
        <li class="mip-story-page-progress-bar">
          <div class="mip-story-page-progress-value"></div>
        </li>`
    }
    const progressHTML = `
      <aside class="mip-story-system-layer">
        <ol class="mip-story-progress-bar">
          ${progressBarHTML}
        </ol>
        <div class="control">
          ${closeBtnHTML}
          ${audioBtnHTML}
        </div>
      </aside>`

    return progressHTML
  }

  /**
   * 渲染关闭按钮
   */
  renderCloseBtn () {
    if (window.history.length <= 1) {
      return ''
    }
    const closeStats = decodeStatsInfo('click', [
      '_trackEvent', '小故事关闭按钮', '点击', window.location.href
    ])
    return `<span class="mip-story-close" data-stats-baidu-obj="${closeStats}"></span>`
  }

  /**
   * 渲染音频按钮
   */
  renderAudioBtn () {
    if (!this.isShowAudio()) {
      return ''
    }
    const muteStats = decodeStatsInfo('click', [
      '_trackEvent', '音频静音按钮', '点击', window.location.href
    ])
    return `<span class="mip-story-audio" data-stats-baidu-obj="${muteStats}"></span>`
  }

  /**
   * 展示音频按钮
   */
  isShowAudio () {
    const ele = this.root.querySelectorAll('audio, video')
    return !!ele.length && !this.audioHide
  }

  /**
   * 更新进度条
   *
   * @param {number} index 页面索引
   * @param {number} status 状态
   */
  updateProgress (index, status) {
    this.progressBar = this.root.querySelectorAll('.mip-story-progress-bar .mip-story-page-progress-value')
    this.ele = this.progressBar[index]
    // 设置当前元素的状态
    this.setCurrentEleStatus(index, status)
    // 处理其他views的状态
    this.setOtherEleStatus(index, status)
    this.oldEle = this.ele
  }

  /**
   * 设置当前元素状态
   *
   * @param {*} index 页面索引
   * @param {*} status 状态
   * @private
   */
  setCurrentEleStatus (index, status) {
    const autoAdvanceDuration = timeStrFormat(this.elements[index].getAttribute('auto-advancement-after'))
    // 后续会有场景视频播放时，如果遇到缓冲，则需要暂停动画
    // 所以采用 WebAnimation API来进行头部切换动画的控制
    // 处理其他 views 的状态
    if (!this.ele.animatePlayer) {
      this.setCurrentEleAnimatePlayer(autoAdvanceDuration)
    } else {
      // 这里对自动播放和非自动播放做了不同处理
      // 如果设置了自动播放或者当前不是被访问过的状态，就重新播放动画；
      if (autoAdvanceDuration || status) {
        // WAAPI的polyfill 在 cancelAPI 上的实现和标准有点不一致，这里手动处理下；
        css(this.ele, {transform: 'scale3d(0, 1, 0)'})
        this.ele.classList.remove(VISITED)
        this.ele.animatePlayer.play()
      }
    }
  }

  setOtherEleStatus (index, status) {
    // 处理前一个元素的状态
    if (this.oldEle && this.oldEle !== this.ele) {
      this.resetOldEleStatus(status, index)
    }
    // 往前翻页时需要init后面页面的动画
    if (status) {
      for (let i = index + 1; i < this.progressBar.length; i++) {
        this.cancelEleVistedStatus(this.progressBar[i])
      }
    }
  }

  resetOldEleStatus (status, index) {
    // 向后翻
    if (status) {
      this.oldEle.classList.add(VISITED)
      this.oldEle.animatePlayer && this.oldEle.animatePlayer.finish()
    } else {
      // 往前翻时需要清除元素已经播放过的状态
      this.cancelEleVistedStatus(this.oldEle)
    }
  }

  cancelEleVistedStatus (ele) {
    if (ele) {
      css(ele, {transform: 'scale3d(0, 1, 0)'})
      ele.classList.remove(VISITED)
      ele.animatePlayer && ele.animatePlayer.cancel()
    }
  }

  setCurrentEleAnimatePlayer (autoAdvanceDuration) {
    this.ele.animatePlayer = this.ele.animate([
      {
        transform: 'scale3d(0, 1, 1)'
      }, {
        transform: 'scale3d(1, 1, 1)'
      }
    ], {
      easing: 'linear',
      duration: autoAdvanceDuration || 200,
      fill: 'forwards'
    })
  }
}

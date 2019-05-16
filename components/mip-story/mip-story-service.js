/**
 * @file 小故事控制逻辑
 * @author wangqizheng
 */
import ClickSwitch from './mip-story-click-switch'
import SlideSwitch from './mip-story-slide-switch'
import {
  hasClass,
  findParent
} from './utils'
import { SWITCHTYPES } from './constants'
const { util } = MIP
const {
  dom,
  EventEmitter
} = util

const EVENTS = {
  OPENAUTOPLAY: 'openAutoplay',
  UNMUTE: 'unmute',
  MUTE: 'mute',
  TAPNAVIGATION: 'tapnavigation',
  REPLAY: 'replay',
  VISIBILITYCHANGE: 'visibilitychange',
  SLIDESWITCH: 'slideSwitch',
  CLICKSWITCH: 'clickSwitch',
  SWITCHPAGE: 'switchPage'
}

export default class MIPStoryService {
  constructor (storyInstance) {
    // story的实例
    this.storyInstance = storyInstance
    this.audio = storyInstance.audio
    this.share = storyInstance.share
    this.viewMuted = storyInstance.viewMuted
    this.bookEnd = storyInstance.bookEnd
    this.progress = storyInstance.progress
    this.hint = storyInstance.hint
    // story 中每个页面(包括分享页)
    this.storyContain = storyInstance.storyContain
    this.storyViews = storyInstance.storyViews
    // 初始化上一页/当前页/下一页
    this.preIndex = this.currentIndex = this.nextIndex = 0
    this.preEle = this.storyViews[this.preIndex].customElement
    this.currentEle = this.storyViews[this.currentIndex].customElement
    this.nextEle = this.storyViews[this.nextIndex].customElement
    // 初始化页面切换方式，默认为横滑翻页
    const switchPageType = this.storyInstance.element.getAttribute('switch-type')
    this.switchPageType = switchPageType || SWITCHTYPES.slideX
  }

  build () {
    const switchPageType = this.switchPageType
    this.reload = this.storyInstance.element.hasAttribute('audio-reload')
    // 进行事件的监听
    this.bindEvent()
    // 滑动翻页 (左右或者上下)
    if (switchPageType === SWITCHTYPES.slideX || switchPageType === SWITCHTYPES.slideY) {
      this.emitter.trigger(EVENTS.SLIDESWITCH)
    } else if (switchPageType === SWITCHTYPES.click) {
      // 点击翻页
      this.emitter.trigger(EVENTS.CLICKSWITCH)
    }

    // 页面切换到后台
    document.addEventListener(EVENTS.VISIBILITYCHANGE, event => {
      this.emitter.trigger(EVENTS.VISIBILITYCHANGE, event)
    })
    this.storyInstance.element.addEventListener('click', event => {
      this.emitter.trigger(EVENTS.TAPNAVIGATION, event)
    })
  }

  /**
   * 事件监听
   */
  bindEvent () {
    this.emitter = new EventEmitter()
    this.emitter.on(EVENTS.OPENAUTOPLAY, this.openAutoplay.bind(this))
    this.emitter.on(EVENTS.MUTE, this.mute.bind(this))
    this.emitter.on(EVENTS.UNMUTE, this.unmute.bind(this))
    this.emitter.on(EVENTS.TAPNAVIGATION, this.tapnavigation.bind(this))
    this.emitter.on(EVENTS.REPLAY, this.replay.bind(this))
    this.emitter.on(EVENTS.VISIBILITYCHANGE, this.visibilitychange.bind(this))
    this.emitter.on(EVENTS.SLIDESWITCH, this.createSlideSwitch.bind(this))
    this.emitter.on(EVENTS.CLICKSWITCH, this.createClickSwitch.bind(this))
    this.emitter.on(EVENTS.SWITCHPAGE, this.switchPage.bind(this))
  }

  /**
   * 点击切换页面
   */
  createClickSwitch () {
    this.clickSwitch = new ClickSwitch({
      storyInstance: this.storyInstance,
      showDamping: this.showDamping.bind(this),
      resetClickEndStatus: this.resetClickEndStatus.bind(this),
      showSwitchLayer: this.showSwitchLayer.bind(this)
    })
    this.clickSwitch.build()
  }

  /**
   * 点击结束
   *
   * @param {Object} data 配置项
   */
  resetClickEndStatus (data) {
    this.preIndex = data.preIndex
    this.currentIndex = data.currentIndex
    this.resetViewEle()
    if (this.currentIndex !== this.preIndex) {
      this.setViewMedia(this.preEle, false)
    }
    this.setViewMedia(this.currentEle, true)
    this.progress.updateProgress(this.currentIndex, data.status)
  }

  /**
   * 展示/隐藏点击页面切换提示
   *
   * @param {Object} data 配置项
   * @param {number} data.status status=1 展示提示，status=0 隐藏提示
   */
  showSwitchLayer (data) {
    if (data.status === 1) {
      this.hint.showPageSwitchLayer()
    } else {
      this.hint.hidePageSwitchLayer()
    }
  }

  /**
   * 展示蒙层
   */
  showDamping () {
    this.hint.showDamping()
  }

  /**
   * 滑动切换页面
   */
  createSlideSwitch () {
    this.slideSwitch = new SlideSwitch({
      storyInstance: this.storyInstance,
      switchPageType: this.switchPageType,
      SWITCHTYPES: SWITCHTYPES,
      initfirstViewStatus: this.initfirstViewStatus.bind(this),
      openAutoplay: this.openAutoplay.bind(this),
      resetSlideEndView: this.resetSlideEndView.bind(this),
      showDamping: this.showDamping.bind(this)
    })
    this.slideSwitch.build()
  }

  /**
   * 滑动结束
   *
   * @param {Object} index 页面索引
   */
  resetSlideEndView (index) {
    this.preIndex = index.preIndex
    this.currentIndex = index.currentIndex
    this.nextIndex = index.nextIndex
    // 重新更新当前活跃的页面
    this.resetViewEle()
    // 在重设view状态时，如果前一页与当前页的不是同一页，需要进行状态修改
    if (this.preIndex !== this.currentIndex) {
      this.preEle.setPreActive(this.emitter)
      this.setViewMedia(this.preEle, false)
    }

    // 在重设view状态时，如果下一页与当前页的不是同一页并且下一页不是封底页，需要进行状态修改
    if (this.nextIndex !== this.currentIndex && this.nextIndex <= this.storyViews.length - 1) {
      this.nextEle.setPreActive(this.emitter)
      this.setViewMedia(this.nextEle, false)
    }

    if (this.currentIndex + 1 < this.storyContain.length) {
      this.setViewMedia(this.currentEle, true)
      this.currentEle.setCssMedia(true, this.viewMuted, this.emitter)
      this.progress.updateProgress(this.currentIndex, index.direction)
    }

    this.clearCssMedia()
  }

  /**
   * 更新当前活跃的页面
   */
  resetViewEle () {
    const storyViews = this.storyViews
    this.preEle = (storyViews && storyViews[this.preIndex] && storyViews[this.preIndex].customElement) || null
    this.currentEle = (storyViews && storyViews[this.currentIndex] && storyViews[this.currentIndex].customElement) || null
    this.nextEle = (storyViews && storyViews[this.nextIndex] && storyViews[this.nextIndex].customElement) || null
  }

  /**
   * 初始化第一个 View 状态
   *
   * @param {Object} index 页面索引
   */
  initfirstViewStatus (index) {
    this.preIndex = index.preIndex
    this.currentIndex = index.currentIndex
    this.nextIndex = index.nextIndex
    // 重新更新当前活跃的页面
    this.resetViewEle()

    // 激活当前页的的多媒体
    this.setViewMedia(this.currentEle, true)
    this.currentEle.setCssMedia(true, this.viewMuted, this.emitter)

    // 在重设view状态时，如果下一页与当前页的不是同一页并且下一页不是封底页，需要进行状态修改
    if (this.nextIndex !== this.currentIndex && this.nextIndex <= this.storyViews.length - 1) {
      // 初始化下一页的动画效果
      this.nextEle.setPreActive(this.emitter)
    }
    if (this.preIndex !== this.currentIndex) {
      this.preEle.setPreActive(this.emitter)
    }
    // 清除其余所有页面的动画
    this.clearCssMedia()
  }

  /**
   * 非静音时，如果视频/音频不能 autoplay，则主动触发
   *
   * @param {HTMLElement} e 事件对象
   */
  openAutoplay (e) {
    if (this.muted) {
      return
    }
    // 打开全局音频
    this.unMuteGlobalAudio()
    this.playGlobalAudio()
    e.target.removeAttribute('muted')
    // 初始化下一页的音频或者视频
    // 暂停下一页的视频
    this.resetViewEle()
    if (this.nextIndex <= this.storyViews.length - 1) {
      this.nextEle.muteAllMedia()
    }

    if (this.preIndex !== this.currentIndex) {
      this.preEle.muteAllMedia()
    }
  }

  /**
   * 页面切换时状态处理
   *
   * @param {Event} e 事件对象
   */
  visibilitychange (e) {
    if (this.currentIndex > this.storyViews.length - 1) {
      return
    }
    const hiddenProperty = 'hidden' in document ? 'hidden'
      : 'webkitHidden' in document ? 'webkitHidden'
        : 'mozHidden' in document ? 'mozHidden' : null
    this.resetViewEle()
    this.currentEle.toggleAllMedia(e, this.viewMuted)
    if (document[hiddenProperty]) {
      this.pauseGlobalAudio()
      this.currentEle.pauseAllMedia()
    } else {
      this.playGlobalAudio()
      this.currentEle.resumeAllMedia()
    }
  }

  /**
   * 重播小故事
   */
  replay () {
    if (this.switchPageType === SWITCHTYPES.click) {
      this.clickSwitch = null
      this.createClickSwitch()
      this.clickSwitch.closeBookEnd()
      this.share.hideShareLayer()
      return
    }
    this.slideSwitch.initViewForSlider('reset')
    this.replayBookEnd()
  }

  replayBookEnd () {
    this.share.hideShareLayer()
  }

  /**
   * 清除其余所有页面的动画
   */
  clearCssMedia () {
    for (let i = 0; i < this.storyViews.length; i++) {
      if (i !== this.preIndex && i !== this.currentIndex && i !== this.nextIndex) {
        // 由于CSS3中动画效果在翻页过程中会丢掉第一帧，此处的动画控制放到view的组件中控制
        this.storyViews[i].customElement.clearCssMedia()
      }
    }
  }

  /**
   * 设置页面的媒体
   *
   * @param {HTMLElement} element 元素
   * @param {boolean} isPlay 是否播放媒体
   */
  setViewMedia (element, isPlay) {
    element.setAllMedia(isPlay, this.viewMuted, this.reload, this.emitter)
  }

  /**
   * 切换页面
   *
   * @param {Object} param 配置
   */
  switchPage (param) {
    if (this.switchPageType === SWITCHTYPES.click && this.clickSwitch) {
      this.clickSwitch.switchTo(param)
    }

    if (this.switchPageType !== SWITCHTYPES.click && this.slideSwitch) {
      this.slideSwitch.switchEnd()
    }
  }

  /**
   * 点击页面处理
   *
   * @param {Event} e 事件对象
   */
  tapnavigation (e) {
    e.stopPropagation()
    const storyEle = this.storyInstance.element
    const backend = storyEle.querySelector('.mip-backend')
    const replay = storyEle.querySelector('.mip-backend-preview')
    const shareBtn = storyEle.querySelector('.mip-backend-share')
    const shareArea = storyEle.querySelector('.mip-story-share')
    const cancelBtn = storyEle.querySelector('.mip-story-share-cancel')
    const back = 'mip-story-close'
    const audio = storyEle.querySelector('.mip-story-audio')
    const recommend = storyEle.querySelector('.recommend-wrap')
    const shareAreaShow = storyEle.querySelector('.mip-story-share-show')
    if (!dom.contains(shareArea, e.target) && shareAreaShow) {
      this.share.hideShareLayer()
      return
    }

    // 推荐
    if (dom.contains(recommend, e.target)) {
      const target = e.target
      const eleParent = findParent(target, 'a')
      e.preventDefault()
      // 推荐链接
      if (target.nodeName.toLocaleLowerCase() !== 'span') {
        const href = eleParent.getAttribute('href')
        window.top.location.href = href
        return
      }
      // 来源链接
      const src = target.getAttribute('data-src')
      if (!src) {
        return
      }
      window.top.location.href = src
    }

    // 返回上一页
    if (hasClass(e, back)) {
      history.back()
      return
    }

    // 静音控制
    if (e.target === audio) {
      let enabled = audio.hasAttribute('muted')
      enabled ? this.emitter.trigger(EVENTS.UNMUTE, e)
        : this.emitter.trigger(EVENTS.MUTE, e)
      return
    }
    // 重头开始播放
    if (dom.contains(replay, e.target)) {
      this.emitter.trigger(EVENTS.REPLAY)
      this.progress.updateProgress(0, 1)
      return
    } else if (dom.contains(backend, e.target)) {
      // 结尾页点击逻辑
      // 弹出分享
      if (dom.contains(shareBtn, e.target)) {
        this.share.showShareLayer()
      } else if (this.switchPageType === SWITCHTYPES.click) {
        // 关闭结尾页-只有点击交互的时候触发
        this.clickSwitch.goBack()
      }
      return
    } else if (dom.contains(shareArea, e.target)) {
      // 分享点击
      // 关闭分享界面
      if (e.target === cancelBtn) {
        this.share.hideShareLayer()
      }
      return
    }

    // 如果视频/音频不能 autoplay，则主动触发
    if (!this.hasPlay && !this.muted) {
      this.emitter.trigger(EVENTS.UNMUTE, e)
      this.hasPlay = true
    }

    // 点击翻页的逻辑处理
    if (this.switchPageType === SWITCHTYPES.click && this.clickSwitch) {
      this.clickSwitch.switchPage(e)
    }
  }

  /**
   * 取消音频静音
   *
   * @param {Event} e 事件对象
   */
  unmute (e) {
    this.muted = false
    this.viewMuted = false
    this.unMuteGlobalAudio()
    this.playGlobalAudio()
    if (this.currentIndex <= this.storyViews.length - 1) {
      this.resetViewEle()
      this.currentEle.toggleAllMedia(e, this.viewMuted)
    }

    e.target.removeAttribute('muted')
  }
  /**
   * 静音音频
   *
   * @param {Event} e 事件对象
   */
  mute (e) {
    this.muted = true
    this.viewMuted = true
    this.muteGlobalAudio()
    if (this.currentIndex <= this.storyViews.length - 1) {
      this.resetViewEle()
      this.currentEle.toggleAllMedia(e, this.viewMuted)
    }

    e.target.setAttribute('muted', '')
  }

  /**
   * 静音所有音频
   */
  muteGlobalAudio () {
    if (this.audio) {
      this.audio.pause()
      this.audio.muted = true
    }
  }
  /**
   * 取消所有音频静音
   */
  unMuteGlobalAudio () {
    if (this.audio) {
      // this.audio.play()
      this.audio.muted = false
    }
  }
  /**
   * 播放所有音频
   */
  playGlobalAudio () {
    if (this.audio && !this.muted) {
      this.audio.play()
    }
  }
  /**
   * 暂停所有音频
   */
  pauseGlobalAudio () {
    if (this.audio) {
      this.audio.pause()
    }
  }
}

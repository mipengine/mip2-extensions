import Audio from './audio'
import { timeStrFormat } from './animation/animation-util'
import {
  isCssColor,
  hasCssAnimation
} from './utils'
import {
  AnimationManager,
  hasAnimations
} from './animation/animation'

import {
  PAGE_ROLE,
  BACKGROUND_AUDIO
} from './constants'

const {
  util,
  CustomElement
} = MIP
const css = util.css

export default class MIPStoryView extends CustomElement {
  static get observedAttributes () {
    return ['preload']
  }

  /** @override */
  firstInviewCallback () {
    this.canvasVideo = this.element.querySelectorAll('mip-story-video')
    this.hasStoryVideo = !!this.canvasVideo.length
    this.isPreload = false
    this.setPageRole()
  }

  /** @override */
  attributeChangedCallback () {
    if (this.isPreload) {
      return
    }
    if (this.element.hasAttribute('preload')) {
      this.isPreload = true
      this.initStoryStatic()
      this.initMedia()
      this.pauseAllMedia()
    }
  }

  /**
   * 设置页面角色为内容页
   */
  setPageRole () {
    this.element.setAttribute('page-role', PAGE_ROLE.contentPage)
  }

  /**
   * 初始化静态资源
   */
  initStoryStatic () {
    const storyStatic = this.element.querySelectorAll('mip-story-img, mip-story-video')
    for (let i = 0; i < storyStatic.length; i++) {
      storyStatic[i].setAttribute('preload', '')
    }
  }

  /**
   * 初始化音频资源
   */
  initMedia () {
    this.audio = new Audio()
    const node = this.element.parentNode

    this.animationElements = []
    // 设置 view的主题色
    this.setSubjectColor()
    if (!node.hasAttribute(BACKGROUND_AUDIO)) {
      const audioSrc = this.element.getAttribute(BACKGROUND_AUDIO)
      this.audio.build(this.element, audioSrc)
    }
  }

  /**
   * 设置 view 的主题色
   */
  setSubjectColor () {
    const subjectColor = this.element.getAttribute('background') || ''
    const storyLayer = this.element.getElementsByTagName('mip-story-layer') || ''
    if (storyLayer && storyLayer[0] && subjectColor && isCssColor(subjectColor)) {
      const newLayer = document.createElement('mip-story-layer')
      this.element.insertBefore(newLayer, storyLayer[0])
      css(this.element.firstElementChild, {backgroundColor: subjectColor})
    }
  }

  /**
   * 恢复所有的媒体
   */
  resumeAllMedia () {
    this.whenAllMediaElements((ele) => {
      !this.muted ? ele.load() : ele.load() && ele.pause()
    })
  }

  /**
   * 暂停所有的媒体
   */
  pauseAllMedia () {
    this.whenAllMediaElements(function (ele) {
      ele.load()
      ele.pause()
    })
  }

  /**
   * 静音所有的媒体
   */
  muteAllMedia () {
    this.whenAllMediaElements(function (ele) {
      ele.muted = true
      ele.pause()
    })
  }

  /**
   * 取消所有媒体静音
   */
  unMuteAllMedia () {
    this.whenAllMediaElements(function (ele) {
      ele.muted = false
      ele.play()
    })
  }

  /**
   * 静音/取消静音
   *
   * @param {Event} e 事件对象
   * @param {boolean} muted 是否静音
   */
  toggleAllMedia (e, muted) {
    this.muted = muted
    const ele = e.target || null
    if (ele && ele.hasAttribute && ele.hasAttribute('muted')) {
      !this.muted && this.resumeAllMedia()
      !this.muted && this.unMuteAllMedia()
    } else {
      this.muteAllMedia()
    }
  }

  /**
   * 获取所有的媒体元素
   */
  getAllMediaElement () {
    return this.element.querySelectorAll('audio, video')
  }

  /**
   * 处理所有的媒体元素
   *
   * @param {Function} cb
   */
  whenAllMediaElements (cb) {
    const mediaSet = this.getAllMediaElement()
    Array.prototype.map.call(mediaSet, function (mediaEl) {
      return cb(mediaEl)
    })
  }

  /**
   * 初始化动画效果
   *
   * @param {Object} eventEmiter
   */
  setPreActive (eventEmiter) {
    this.parentEmiter = eventEmiter
    this.animationElements = []
    this.initAnimationFirstFrame()
    // css-获取有动画的节点，并且放到数组中便于修改display
    this.findAnimationNodes(this.element)
    // css-修改每个有动画节点的display
    this.initFirstFrameStyle(false)
  }

  /**
   * 查找动画节点
   *
   * @param {HTMLElement} parent
   */
  findAnimationNodes (parent) {
    if (parent == null) return
    const subNodes = parent.children
    for (let index = 0; index < subNodes.length; index++) {
      if (hasCssAnimation(subNodes[index])) {
        this.animationElements.push(subNodes[index])
      }
      if (subNodes[index].children.length > 0) {
        this.findAnimationNodes(subNodes[index])
      }
    }
  }

  /**
   * 初始化第一帧动画展现
   *
   * @param {boolean} disp 是否展现
   */
  initFirstFrameStyle (disp) {
    if (this.animationElements != null) {
      for (let index = 0; index < this.animationElements.length; index++) {
        this.toggleDisplay(this.animationElements[index], disp)
      }
    }
  }

  toggleDisplay (obj, disp) {
    if (disp) {
      css(obj, {
        'display': obj.getAttribute('originDisplay')
      })
    } else {
      const originDisplay = document.defaultView.getComputedStyle(obj)['display']
      obj.setAttribute('originDisplay', originDisplay)
      css(obj, {
        'display': 'none'
      })
    }
  }
  /**
   * 设置当前页面媒体
   *
   * @param {boolean} status 是否播放
   * @param {boolean} muted 是否静音
   * @param {*} load
   * @param {Object} eventEmiter 事件广播
   */
  setAllMedia (status, muted, load, eventEmiter) {
    this.muted = muted
    this.parentEmiter = eventEmiter
    if (status) {
      this.initAnimationFirstFrame()
      this.maybeStartAnimation()
      this.resumeAllMedia(load)
      this.muted ? this.muteAllMedia() : this.unMuteAllMedia()
      this.startStoryVideo()
      this.maybeSetAutoAdvance()
    } else {
      this.maybeClearAutoAdvance()
      this.pauseAllMedia()
      this.maybeClearAnimation()
      this.stopStoryVideo()
    }
  }

  /**
   * 开始播放所有视频
   */
  startStoryVideo () {
    if (this.hasStoryVideo) {
      Array.prototype.slice.apply(this.canvasVideo).forEach(function (val) {
        val.customElement.play()
      })
    }
  }

  /**
   * 停止播放所有视频
   */
  stopStoryVideo () {
    if (this.hasStoryVideo) {
      Array.prototype.slice.apply(this.canvasVideo).forEach(function (val) {
        val.customElement.stop()
      })
    }
  }

  setCssMedia (status, muted, eventEmiter) {
    this.muted = muted
    this.parentEmiter = eventEmiter
    if (status) {
      this.initFirstFrameStyle(true)
    } else {
      this.initFirstFrameStyle(false)
    }
  }

  clearCssMedia (status, muted, eventEmiter) {
    if (this.animationElements != null) {
      for (let index = 0; index < this.animationElements.length; index++) {
        this.toggleDisplay(this.animationElements[index], true)
        this.animationElements[index].removeAttribute('originDisplay')
      }
    }
  }

  /**
   * 初始化动画第一帧
   */
  initAnimationFirstFrame () {
    if (hasAnimations(this.element)) {
      css(this.element, {visibility: 'hidden'})
      if (!this.animationManager) {
        this.animationManager = new AnimationManager(this.element)
      }
      this.animationManager.paintFirstFrame()
      css(this.element, {visibility: ''})
    }
  }

  /**
   * 开始动画
   */
  maybeStartAnimation () {
    if (hasAnimations(this.element)) {
      css(this.element, {visibility: 'hidden'})
      if (!this.animationManager) {
        this.animationManager = new AnimationManager(this.element)
      }
      this.animationManager.paintFirstFrame()
      css(this.element, {visibility: ''})
      this.animationManager.runAllAnimate()
    }
  }

  /**
   * 取消所有的动画
   */
  maybeClearAnimation () {
    if (this.animationManager) {
      this.animationManager.cancelAllAnimate()
    }
  }

  /**
   * 取消自动提前切换页面
   */
  maybeClearAutoAdvance () {
    this.timer && clearTimeout(this.timer)
  }

  /**
   * 自动提前切换页面
   */
  maybeSetAutoAdvance () {
    const el = this.element
    const advancment = el.getAttribute('auto-advancement-after')
    const duration = timeStrFormat(advancment)
    if (duration) {
      this.timer = setTimeout(() => {
        this.parentEmiter.trigger('switchPage', {status: 1})
      }, duration)
    }
  }
}

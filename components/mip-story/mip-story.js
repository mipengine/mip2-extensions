import 'web-animations-js/web-animations.min.js'
import './mip-story.less'
import './mip-story-view'
import './mip-story-layer'
import './mip-story-video'
import './mip-story-img'
import Audio from './audio'
import ShareLayer from './mip-story-share'
import HintLayer from './mip-story-hint'
import BookEnd from './mip-story-bookend'
import storyState from './state'
import Progress from './mip-story-progress'
import Service from './mip-story-service'
import { MIP_I_STORY_STANDALONE } from './constants'
import {
  isCssColor,
  loadScript
} from './utils'
const {
  CustomElement,
  util
} = MIP
const {
  platform,
  dom
} = util

export default class MIPStory extends CustomElement {
  constructor (element) {
    super(element)
    this.element = element
    this.storyViews = []
    this.storyContain = []
  }

  getConfigData () {
    const configData = this.element.querySelector('mip-story > script[type="application/json"]')
    try {
      return JSON.parse(configData.innerText)
    } catch (e) {
      console.error(e)
    }
    return {}
  }

  initAudio () {
    const au = this.element.getAttribute('background-audio')
    if (au) {
      this.audio = new Audio().build(this.element, au)
    }
    this.muted = false
    this.viewMuted = !!(this.muted || this.audio)
  }

  initBookend (storyConfig) {
    this.bookEnd = new BookEnd(storyConfig)
    const html = dom.create(this.bookEnd.build())
    this.element.appendChild(html)
  }

  initStoryViews () {
    this.storyViews = this.element.querySelectorAll('mip-story-view')
  }

  initStoryContain () {
    this.bookEndContainer = document.querySelector('.mip-backend')
    for (let index = 0; index < this.storyViews.length; index++) {
      this.storyContain.push(this.storyViews[index].customElement.element)
    }
    this.storyContain.push(this.bookEndContainer)
  }

  initHintLayer (element) {
    this.hint = new HintLayer(element)
    const html = dom.create(this.hint.build())
    this.element.appendChild(html)
    this.hint.generateQRCode()
  }

  initShare (storyConfig, element) {
    const shareConfig = storyConfig.share || {}
    this.share = new ShareLayer(shareConfig, element)
    const html = dom.create(this.share.build())
    this.element.appendChild(html)
  }

  initService () {
    const service = new Service(this)
    service.build()
  }

  initProgress (storyConfig) {
    if (this.progress) {
      return
    }

    const audioHide = this.element.hasAttribute('audio-hide')
    this.progress = new Progress(this.element, this.storyViews, audioHide, storyConfig)
    const html = dom.create(this.progress.build())
    this.element.appendChild(html)

    // 状态保持
    const currentPageIndex = storyState.currentPageIndex
    this.pageStateIndex = storyState.getPageStateIndex(this.storyViews.length)
    this.preloadPages = storyState.getPreloadIndex(this.storyViews.length)
    // 初始化预加载
    this.initPreload()
    for (let p = 0; p <= currentPageIndex; p++) {
      this.progress.updateProgress(p, 1)
    }
  }

  setSubjectColor () {
    const subjectColor = this.element.getAttribute('background') || ''
    if (subjectColor && isCssColor(subjectColor)) {
      this.element.style.backgroundColor = subjectColor
    }
  }

  insertScript () {
    loadScript('https://c.mipcdn.com/static/v1/mip-fixed/mip-fixed.js')
  }

  resolveSwipe () {
    // 禁止橡皮筋效果
    for (let i = 0; i < this.storyViews.length; i++) {
      this.storyViews[i].addEventListener('touchmove', function (e) {
        e.preventDefault()
      }, {
        passive: false
      })
    }
    const isSimpleSearch = navigator.userAgent.toLowerCase().indexOf('searchcraft')
    // 手百下外层容器不能设置阻挡默认事件
    if (!platform.isBaiduApp() && !platform.isQQApp() && !isSimpleSearch) {
      const backOuter = this.element.querySelector('.mip-backend')
      backOuter.addEventListener('touchmove', function (e) {
        e.preventDefault()
      }, {
        passive: false
      })
    }
    const recommendWrap = this.element.querySelector('.recommend-wrap')
    recommendWrap.addEventListener('touchmove', function (e) {
      e.stopPropagation()
    }, {
      passive: true
    })
  }

  initPreload () {
    let storyViewData = this.storyViews
    const pages = this.preloadPages
    for (let i = 0; i < pages.length; i++) {
      const loadIndex = pages[i]
      storyViewData[loadIndex].setAttribute('preload', '')
    }
  }

  initStory () {
    const element = this.element
    const html = document.documentElement
    const mipStoryConfigData = this.getConfigData()
    // 引入js
    this.insertScript()
    // 设置小故事的主题色
    this.setSubjectColor()
    html.setAttribute('id', MIP_I_STORY_STANDALONE)
    // 初始化音频
    this.initAudio()
    // 初始化结尾页
    this.initBookend(mipStoryConfigData)
    // 保存 story-views到storyViews中便于后期操作
    this.initStoryViews()
    // 保存包括封底页面在内的所有结果页
    this.initStoryContain()
    // 初始化引导页
    this.initHintLayer(element)
    // 初始化分享页面
    this.initShare(mipStoryConfigData, element)
    // 初始化导航
    this.initProgress(mipStoryConfigData)
    // 初始化story的Slider
    this.initService()
    // 处理滑动问题
    this.resolveSwipe()
  }

  firstInviewCallback () {
    this.initStory()
  }
}

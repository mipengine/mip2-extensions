/**
 * @file mip-story-click-switch 组件
 * @description 点击翻页
 */
import { PAGE_STATE } from './constants'
import storyState from './state'
const { util } = MIP
const {
  Gesture,
  dom
} = util
const CURRENT = PAGE_STATE.current

export default class MIPStoryClickSwitch {
  constructor (param) {
    // story的实例
    this.storyInstance = param.storyInstance
    const storyInstance = this.storyInstance
    // story中每个页面包括分享页
    this.hint = storyInstance.hint
    this.storyContain = storyInstance.storyContain
    this.storyViews = storyInstance.storyViews
    this.bookEndElement = this.storyContain[this.storyContain.length - 1]
    this.showDampingCB = param.showDamping
    this.resetClickEndStatusCB = param.resetClickEndStatus
    this.isShowSwitchLayerCB = param.showSwitchLayer
    // 页面 state
    const pageState = storyState.getPageStateIndex(this.storyViews.length)
    this.preIndex = pageState[0]
    this.currentIndex = pageState[1]
    this.nextIndex = pageState[2]
  }

  build () {
    this.initViewForSwitch()
    this.swipe()
  }

  /**
   * 初始化页面切换
   *
   * @param {string} type 初始化类型
   */
  initViewForSwitch (type) {
    if (type === 'reset') {
      this.preIndex = this.currentIndex = 0
      this.nextIndex = 1
      storyState.setState(0)
    }
    // 设置当前页面为 current
    this.setViewState(true, CURRENT, this.storyContain[this.currentIndex])
    this.setViewState(true, 'preload', this.storyContain[this.nextIndex])
    // 对封底页图片预加载
    const storyImgs = this.bookEndElement.querySelectorAll('mip-story-img')
    for (let index = 0; index < storyImgs.length; index++) {
      storyImgs[index].setAttribute('preload', '')
    }
  }

  /**
   * 绑定手势事件
   */
  swipe () {
    const gesture = new Gesture(this.storyInstance.element, {
      preventX: false
    })
    // 绑定横滑事件，展现点击切换页面提示
    gesture.on('swipe', (e, data) => {
      if (data.swipeDirection === 'left' || data.swipeDirection === 'right') {
        const backend = document.querySelector('.mip-backend')
        if (dom.contains(backend, e.target)) {
          return
        }
        this.hint.toggleSystemLater()
      }
    })
  }

  /**
   * 控制页面切换
   *
   * @param {Object} data 配置选项
   * @param {number} data.status 1 向右切换，0 向左切换
   */
  switchTo (data) {
    const switchLeft = data.status === 0
    const switchRight = data.status === 1
    this.hint.hideDamping()
    this.hint.hideSystemLater()
    // 向左切换至第一页
    if (switchLeft && this.currentIndex <= 0) {
      this.showDampingCB()
      return
    }
    // 向右切换至封底页
    if (switchRight && this.currentIndex + 1 >= this.storyViews.length) {
      this.setViewState(false, CURRENT, this.storyViews[this.currentIndex])
      this.showBookEnd()
      return
    }
    // 更新页面索引
    if (switchRight) {
      this.preIndex = this.currentIndex
      this.currentIndex = this.currentIndex + 1
      this.nextIndex = this.currentIndex + 1 >= this.storyContain.length ? this.currentIndex : this.currentIndex + 1
      this.storyContain[this.nextIndex].setAttribute('preload', '')
    } else {
      this.nextIndex = this.currentIndex
      this.currentIndex = this.currentIndex - 1
      this.preIndex = this.preIndex - 1 < 0 ? this.preIndex : this.preIndex - 1
      this.storyContain[this.preIndex].setAttribute('preload', '')
    }
    storyState.setState(this.currentIndex)
    this.resetViewForSwitch(data)
  }

  /**
   * 页面切换
   *
   * @param {Event} e 事件
   */
  switchPage (e) {
    // 翻页逻辑
    const storyInstance = this.storyInstance
    const centerX = (storyInstance.element.offsetLeft + storyInstance.element.offsetWidth) / 2
    // 向右切换
    if (e.pageX > centerX) {
      this.switchTo({e: e, status: 1})
    } else {
      // 向左切换
      this.switchTo({e: e, status: 0})
    }
  }

  /**
   * 重新设置页面状态
   *
   * @param {string} data 配置选项
   */
  resetViewForSwitch (data) {
    const currentEle = this.storyViews[this.currentIndex]
    const preEle = this.storyViews[this.preIndex]
    const nextEle = this.storyViews[this.nextIndex]

    // 清除上一页 current 的状态
    if (this.preIndex !== this.currentIndex) {
      this.setViewState(false, CURRENT, preEle)
    }
    // 清除下一页 current 的状态
    if (this.nextIndex !== this.currentIndex) {
      this.setViewState(false, CURRENT, nextEle)
    }
    // 设置当前页面为current状态
    this.setViewState(true, CURRENT, currentEle)
    this.resetClickEndStatusCB({
      preIndex: this.preIndex,
      currentIndex: this.currentIndex,
      status: data.status
    })
    this.isShowSwitchLayerCB(data.status)
  }

  /**
   * 关闭封底页
   */
  goBack () {
    this.setViewState(true, CURRENT, this.storyViews[this.currentIndex])
    this.closeBookEnd()
  }

  /**
   * 展示封底页
   */
  showBookEnd () {
    this.setViewState(true, CURRENT, this.bookEndElement)
    const eleAnimation = this.bookEndElement.animate([
      {transform: 'translate3D(0, 100%, 0)', opacity: 0},
      {transform: 'translate3D(0, 0, 0)', opacity: 1}
    ], {
      fill: 'forwards',
      easing: 'ease-in',
      duration: 280
    })
    eleAnimation.play()
  }

  /**
   * 关闭封底页
   */
  closeBookEnd () {
    this.setViewState(false, CURRENT, this.bookEndElement)
    const eleAnimation = this.bookEndElement.animate([
      {transform: 'translate3D(0, 0, 0)', opacity: 1},
      {transform: 'translate3D(0, 100%, 0)', opacity: 0}
    ], {
      fill: 'forwards',
      easing: 'ease-out',
      duration: 280
    })
    eleAnimation.play()
  }

  /**
   * 设置页面状态
   *
   * @param {boolean} isSetStatus 是否设置状态
   * @param {string} viewState 页面状态
   * @param {HTMLElement} viewEle 页面元素
   */
  setViewState (isSetStatus, viewState, viewEle) {
    if (viewEle && viewState) {
      if (isSetStatus) {
        viewEle.setAttribute(viewState, '')
      } else {
        viewEle.removeAttribute(viewState)
      }
    }
  }
}

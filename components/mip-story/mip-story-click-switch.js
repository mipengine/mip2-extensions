/**
 * @file mip-story-click-switch 组件
 * @description 点击翻页
 */
const { util } = MIP
const {
  Gesture,
  dom
} = util
const CURRENT = 'current'

export default class MIPStoryClickSwitch {
  constructor (param) {
    // story的实例
    this.storyInstance = param.storyInstance
    const storyInstance = this.storyInstance
    // story中每个页面包括分享页
    this.hint = storyInstance.hint
    this.storyContain = storyInstance.storyContain
    this.storyViews = storyInstance.storyViews
    this.showDampingCB = param.showDamping
    this.resetClickEndStatusCB = param.resetClickEndStatus
    this.isShowSwitchLayerCB = param.showSwitchLayer
    this.preIndex = this.currentIndex = this.nextIndex = 0
  }

  build () {
    this.initViewForSwitch()
    this.swipe()
  }

  /**
   * 初始化页面切换
   */
  initViewForSwitch () {
    this.switchTo({status: 1, notIncrease: 1})
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
   * @param {number} data.notIncrease
   */
  switchTo (data) {
    this.hint.hideDamping()
    this.hint.hideSystemLater()
    if (data.status === 0 && this.currentIndex <= 0) {
      // 向左切换至第一页
      this.showDampingCB()
      return
    } else if (!data.notIncrease && data.status === 1 &&
      this.currentIndex + 1 >= this.storyViews.length) {
      // 向右切换至封底页
      this.setViewState(false, CURRENT, this.storyViews[this.currentIndex])
      this.showBookEnd()
      return
    }

    if (!data.notIncrease) {
      data.status === 1 ? this.currentIndex++ : this.currentIndex--
    }
    // 重新设置页面状态
    const currentEle = this.storyViews[this.currentIndex]
    const preEle = this.storyViews[this.preIndex]
    if (this.currentIndex !== this.preIndex) {
      this.setViewState(false, CURRENT, preEle)
    }
    this.setViewState(true, CURRENT, currentEle)

    const index = {
      preIndex: this.preIndex,
      currentIndex: this.currentIndex,
      status: data.status
    }
    this.resetClickEndStatusCB(index)
    this.preIndex = this.currentIndex
    // 右翻
    if (!data.notIncrease) {
      this.isShowSwitchLayerCB(data.status)
    }
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
    const ele = this.storyContain[this.storyContain.length - 1]
    this.setViewState(true, CURRENT, ele)
    const eleAnimation = ele.animate([
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
    const ele = this.storyContain[this.storyContain.length - 1]
    this.setViewState(true, CURRENT, ele)
    const eleAnimation = ele.animate([
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

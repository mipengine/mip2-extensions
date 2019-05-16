/**
 * @file mip-story-slide-switch 组件
 * @description 滑动翻页
 */
import { setTransitionDuration } from './animation/animation-util'
import storyState from './state'
import {
  PAGE_ROLE,
  DIRECTIONMAP,
  SWITCHPAGE_THRESHOLD,
  PAGE_STATE,
  SWITCHTYPES
} from './constants'
const {
  viewport,
  util
} = MIP
const dom = util.dom

const ACTIVE = PAGE_STATE.active
const CURRENT = PAGE_STATE.current
const STYLE = 'style'

const sliderTime = 200
// 页面回弹动画时间
const reboundTime = 80

// 翻页埋点
let pageViewed = [0]

// 是否已访问第一页
let isPageOneViewed = false

// 是否已访问分享页
let isSharePageViewed = false

let dragStartBind = null
let dragMoveBind = null
let dragEndBind = null

/**
 * 拖动开始
 *
 * @param {Event} e 事件对象
 */
function dragStart (e) {
  // 如果正处于翻页状态跳出
  if (this.moveFlag) {
    return
  }
  const touch = e.targetTouches[0] || e.changedTouches[0]
  this.touchstartX = touch.pageX
  this.touchstartY = touch.pageY
  this.sliderStartCB(e)
}

/**
 * 拖动中
 *
 * @param {Event} e 事件对象
 */
function dragMove (e) {
  // 特殊处理，分享页更多小故事滚动，禁止翻页滚动
  if (dom.contains(this.recommend, e.target)) {
    return
  }

  // 如果正处于翻页状态跳出
  if (this.moveFlag) {
    return
  }
  // 处理滑动移动
  this.slideMoving(e)
}

/**
 * 拖动结束
 *
 * @param {Event} e 事件对象
 */
function dragEnd (e) {
  // 特殊处理，分享页更多小故事滚动，禁止翻页滚动
  if (dom.contains(this.recommend, e.target)) {
    return
  }

  // 如果正处于翻页状态跳出
  if (this.moveFlag) {
    return
  }
  const touch = e.targetTouches[0] || e.changedTouches[0]
  this.touchendX = touch.pageX
  this.touchendY = touch.pageY

  // 只是点击当前页面的内容
  if (this.touchendX === this.touchstartX && this.touchendY === this.touchstartY) {
    this.moveFlag = false
    return
  }

  // 关闭其他滑动事件
  this.moveFlag = true
  // 处理滑动结束
  this.slideMovingEnd(e)
  // 还原state
  this.touchstartX = this.touchendX = 0
}

export default class MIPStorySliderSwitch {
  constructor (param) {
    // story 的实例
    this.storyInstance = param.storyInstance
    this.switchPageType = param.switchPageType
    this.initViewForSwitchCB = param.initfirstViewStatus
    this.sliderStartCB = param.openAutoplay
    this.resetSlideEndViewCB = param.resetSlideEndView
    this.showDampingCB = param.showDamping
    // 小故事实例 element
    this.storyElement = this.storyInstance.element
    // story 中每个页面(包括分享页)
    this.storyContain = this.storyInstance.storyContain
    // 翻页的页面state
    this.viewLength = this.storyContain.length - 1
    this.hasPreload = storyState.getPreloadIndex(this.viewLength)
    const pageState = storyState.getPageStateIndex(this.viewLength)
    this.preIndex = pageState[0]
    this.currentIndex = pageState[1]
    this.nextIndex = pageState[2]
    // touch 交互位置
    this.touchstartX = this.touchendX = 0
    // 是否在翻页过程中
    this.moveFlag = false
  }

  build () {
    this.initViewForSlider()
    this.bindEvent()
    this.recommend = this.storyElement.querySelector('.recommend')
  }

  /**
   * 初始化段落布局 Dom
   *
   * @param {string} type 初始化类型
   */
  initViewForSlider (type) {
    const storyContain = this.storyContain
    let preEle = storyContain[this.preIndex]
    let nextEle = storyContain[this.nextIndex]

    if (type === 'reset') {
      preEle = nextEle = storyContain[0]
      this.preIndex = this.currentIndex = 0
      this.nextIndex = 1
      storyState.setState(0)
    }
    // 添加current状态
    this.setCurrentPage()
    // 清除当前所有view已有的样式
    this.clearStyle()
    nextEle = storyContain[this.nextIndex]
    preEle = storyContain[this.preIndex]
    this.setViewState(true, ACTIVE, nextEle)
    this.setViewState(true, ACTIVE, preEle)

    // 初始化上一页、下一页的位置
    if (this.currentIndex !== this.viewLength - 1) {
      this.setSliderPosition(nextEle, false)
    }
    if (this.currentIndex !== 0) {
      this.setSliderPosition(preEle, true)
    }

    this.initViewForSwitchCB({
      preIndex: this.preIndex,
      currentIndex: this.currentIndex,
      nextIndex: this.nextIndex
    })
  }

  /**
   * 事件绑定
   */
  bindEvent () {
    dragStartBind = dragStart.bind(this)
    dragMoveBind = dragMove.bind(this)
    dragEndBind = dragEnd.bind(this)

    // 开始滑动
    this.sliderStart()
    // 滑动中
    this.sliding()
    // 结束滑动
    this.sliderEnd()
  }

  /**
   * 开始滑动时事件监听
   */
  sliderStart () {
    this.storyElement.addEventListener('touchstart', dragStartBind)
  }

  /**
   * 滑动中事件监听
   */
  sliding () {
    this.storyElement.addEventListener('touchmove', dragMoveBind)
  }

  /**
   * 滑动结束时事件监听
   */
  sliderEnd () {
    this.storyElement.addEventListener('touchend', dragEndBind)
  }

  /**
   * 滑动移动
   *
   * @param {Event} e 事件对象
   */
  slideMoving (e) {
    const data = this.getMoveData(e)
    const preEle = this.storyContain[this.preIndex]
    const currentEle = this.storyContain[this.currentIndex]
    const nextEle = this.storyContain[this.nextIndex]
    // 判断是否已滑动至边界值
    if (this.isConfineEle(e)) {
      return
    }

    // 页面的滑动，设置上一页、当前页和下一页的位置
    if (this.currentIndex !== this.preIndex) {
      this.setSliderPosition(preEle, null, data.preActiveMove)
    }
    if (this.currentIndex !== this.nextIndex) {
      this.setSliderPosition(nextEle, null, data.nextActiveMove)
    }
    this.setSliderPosition(currentEle, null, data.move)
  }

  /**
   * 滑动结束
   *
   * @param {Event} e 事件对象
   */
  slideMovingEnd (e) {
    const data = this.getMoveData(e)
    const move = data.move
    const threshold = data.threshold
    // 判断是否已滑动至边界值
    if (this.isConfineEle(e)) {
      if (this.isPositionChange(this.currentIndex)) {
        this.setRebound()
      }
      return
    }

    // 若滑动的距离小于阈值-弹回恢复原状
    if (Math.abs(move) <= threshold) {
      this.setRebound()
      this.resetReboundEndStatus()
    } else {
      // 若滑动的距离大于阈值-翻页
      this.switchEnd(e)
    }
  }

  /**
   * 页面手势滑动
   *
   * @param {HTMLElement} ele 页面元素
   * @param {boolean} isPre 是否是向前滑动
   * @param {number} changemove 手指位移距离
   */
  setSliderPosition (ele, isPre, changemove) {
    const screenWidth = viewport.getWidth()
    const screenHeight = viewport.getHeight()
    const width = isPre ? -screenWidth : screenWidth
    const height = isPre ? -screenHeight : screenHeight
    if (ele == null) {
      return
    }

    // 根据手指位移而修改位移
    if (changemove != null) {
      if (this.switchPageType === SWITCHTYPES.slideX) {
        ele.style.transform = 'translate(' + changemove + 'px, 0)'
        ele.style.webkitTransform = 'translate(' + changemove + 'px, 0)'
      } else {
        ele.style.transform = 'translate(0, ' + changemove + 'px)'
        ele.style.webkitTransform = 'translate(0, ' + changemove + 'px)'
      }
    } else {
      // 设置翻页前的前一页和后一页的位置
      if (this.switchPageType === SWITCHTYPES.slideX) {
        ele.style.transform = 'translate(' + width + 'px, 0)'
        ele.style.webkitTransform = 'translate(' + width + 'px, 0)'
      } else {
        ele.style.webkitTransform = 'translate(0, ' + height + 'px)'
      }
    }
  }

  /**
   * 未翻页成功，页面回弹恢复原状
   */
  setRebound () {
    const preEle = this.storyContain[this.preIndex]
    const currentEle = this.storyContain[this.currentIndex]
    const nextEle = this.storyContain[this.nextIndex]
    if (this.preIndex !== this.currentIndex) {
      this.setSliderPosition(preEle, true)
      setTransitionDuration(preEle, reboundTime)
    }

    if (this.nextIndex !== this.currentIndex) {
      this.setSliderPosition(nextEle, false)
      setTransitionDuration(nextEle, reboundTime)
    }

    this.setSliderPosition(currentEle, null, 0)
    setTransitionDuration(currentEle, reboundTime)
  }

  /**
   * 未翻页成功，页面回弹后重设页面状态
   */
  resetReboundEndStatus () {
    setTimeout(() => {
      this.moveFlag = false
      this.resetViewStyle()
    }, reboundTime)
  }

  /**
   * 重新设置页面样式
   */
  resetViewStyle () {
    const preEle = this.storyContain[this.preIndex]
    const currentEle = this.storyContain[this.currentIndex]
    const nextEle = this.storyContain[this.nextIndex]
    if (this.preIndex !== this.currentIndex) {
      preEle.removeAttribute('style')
      this.setSliderPosition(preEle, true)
    }

    if (this.nextIndex !== this.currentIndex) {
      nextEle.removeAttribute('style')
      this.setSliderPosition(nextEle, false)
    }
    currentEle.removeAttribute('style')
  }

  /**
   * 切换页面
   *
   * @param {Event} e 事件对象
   */
  switchEnd (e) {
    const preEle = this.storyContain[this.preIndex]
    const currentEle = this.storyContain[this.currentIndex]
    const nextEle = this.storyContain[this.nextIndex]
    let isPre = false

    // 判断页面切换方向
    this.getSwitchDirection(e)
    // 更新页面位置
    switch (this.direction) {
      case DIRECTIONMAP.back:
        this.setSliderPosition(preEle, null, 0)
        setTransitionDuration(preEle, sliderTime)
        break
      case DIRECTIONMAP.goto:
        isPre = true
        this.setSliderPosition(nextEle, null, 0)
        setTransitionDuration(nextEle, sliderTime)
        break
      default:
        break
    }
    this.setSliderPosition(currentEle, isPre, null)
    setTransitionDuration(currentEle, sliderTime)
    this.resetMovingEndStatus(this.direction)
  }

  /**
   * 翻页结束后，重新设置页面状态
   *
   * @param {string} direction 页面切换方向
   */
  resetMovingEndStatus (direction) {
    setTimeout(() => {
      this.moveFlag = false
      this.resetViewForSwitch(direction || DIRECTIONMAP.goto)
    }, +sliderTime)
  }

  /**
   * 页面翻页
   *
   * @param {string} direction 页面切换方向
   */
  resetViewForSwitch (direction) {
    const storyContain = this.storyContain
    let isPre = false
    switch (direction) {
      case DIRECTIONMAP.back:
        this.nextIndex = this.currentIndex
        this.currentIndex = this.preIndex
        this.preIndex = this.preIndex - 1 < 0 ? this.preIndex : this.preIndex - 1
        break
      case DIRECTIONMAP.goto:
        isPre = true
        this.preIndex = this.currentIndex
        this.currentIndex = this.currentIndex + 1
        this.nextIndex = this.currentIndex + 1 >= storyContain.length ? this.currentIndex : this.currentIndex + 1
        break
      default:
        break
    }
    const preEle = storyContain[this.preIndex]
    const currentEle = storyContain[this.currentIndex]
    const nextEle = storyContain[this.nextIndex]
    // 添加current状态
    this.setCurrentPage()
    // 清除当前所有view已有的样式
    this.clearStyle()
    if (this.preIndex !== this.currentIndex) {
      this.setViewState(true, ACTIVE, preEle)
      this.setSliderPosition(preEle, isPre, null)
    }

    if (this.nextIndex !== this.currentIndex) {
      this.setViewState(true, ACTIVE, nextEle)
      this.setSliderPosition(nextEle, !isPre, null)
    }

    this.setViewState(true, CURRENT, currentEle)
    this.setSliderPosition(currentEle, null, 0)
    this.resetSlideEndViewCB({
      preIndex: this.preIndex,
      currentIndex: this.currentIndex,
      nextIndex: this.nextIndex,
      direction: this.direction === DIRECTIONMAP.back ? 0 : 1
    })
  }

  /**
   * 判断页面切换方向
   *
   * @param {Event} e 事件对象
   */
  getSwitchDirection (e) {
    this.direction = DIRECTIONMAP.goto
    if (!e) {
      return
    }
    const data = this.getMoveData(e)
    const move = data.move
    if (move >= 0) {
      this.direction = DIRECTIONMAP.back
    }
  }

  /**
   * 判断是否为边界元素
   *
   * @param {Event} e 事件对象
   */
  isConfineEle (e) {
    const data = this.getMoveData(e)
    const move = data.move
    let isConfineEle = false
    // 第一页往前滑动
    if (this.currentIndex <= 0 && move > 0) {
      this.moveFlag = false
      // 展示蒙层告知不可滑动
      this.showDampingCB()
      isConfineEle = true
    }

    // 最后一页往后滑动
    if (this.currentIndex + 1 >= this.storyContain.length && move <= 0) {
      this.moveFlag = false
      isConfineEle = true
    }

    return isConfineEle
  }

  isPositionChange (index) {
    const currentEle = this.storyContain[index]
    const transformMatrix = currentEle.style.transform
    const matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',')
    if (matrix[0] === 0) {
      return false
    }
    return true
  }

  /**
   * 获取滑动距离数据
   *
   * @param {Event} e 事件对象
   */
  getMoveData (e) {
    const screenWidth = viewport.getWidth()
    const screenHeight = viewport.getHeight()
    const touch = e.targetTouches[0] || e.changedTouches[0]
    const moveX = touch.pageX - this.touchstartX
    const moveY = touch.pageY - this.touchstartY

    let move = moveX
    let preActiveMove = -screenWidth + moveX
    let nextActiveMove = screenWidth + moveX
    let threshold = SWITCHPAGE_THRESHOLD.horizontal

    // 滑动类型为上下滑动
    if (this.switchPageType === SWITCHTYPES.slideY) {
      move = moveY
      preActiveMove = -screenHeight + move
      nextActiveMove = screenHeight + moveY
      threshold = SWITCHPAGE_THRESHOLD.vertical
    }

    return {
      move: move,
      preActiveMove: preActiveMove,
      nextActiveMove: nextActiveMove,
      threshold: threshold
    }
  }

  /**
   * 设置当前页面
   *
   * @private
   */
  setCurrentPage () {
    const storyContainLength = this.storyContain.length
    for (let i = 0; i < storyContainLength; i++) {
      const currentPage = this.storyContain[i]
      if (i === this.currentIndex) {
        // 埋点
        if (window._hmt && pageViewed.indexOf(i) === -1) {
          const pageRole = currentPage.getAttribute('page-role')
          this.triggerStats(i, pageRole)
        }
        this.setPreload(i)
        // 设置当前页面为current状态
        this.setViewState(true, CURRENT, currentPage)
      } else {
        // 清除非当前页的current状态，确保只有一个current页
        this.setViewState(false, CURRENT, currentPage)
      }
      // 如果当前页面原先为active状态则清除
      if (this.hasStatus(ACTIVE, currentPage)) {
        this.setViewState(false, ACTIVE, currentPage)
      }
    }
  }

  /**
   * 设置预加载
   *
   * @param {number} index 索引
   * @private
   */
  setPreload (index) {
    const loaded = this.hasPreload
    const storyContain = this.storyContain
    const maxIndex = loaded[loaded.length - 1]
    const minIndex = loaded[0]
    const stateIndex = index >= maxIndex ? maxIndex : index
    // 更新页面索引状态
    storyState.setState(stateIndex)
    // 对封底页图片预加载
    if (maxIndex >= this.viewLength - 2) {
      const storyImgs = storyContain[this.viewLength].querySelectorAll('mip-story-img')
      for (let index = 0; index < storyImgs.length; index++) {
        storyImgs[index].setAttribute('preload', '')
      }
    }

    if (!this.direction) {
      return
    }

    if (this.direction === 'goto' && maxIndex < this.viewLength - 1) {
      const nextIndex = maxIndex + 1
      if (loaded.indexOf(nextIndex) !== -1) {
        return
      }
      storyContain[nextIndex].setAttribute('preload', '')
      this.hasPreload.push(nextIndex)
      return
    }

    if (minIndex > 0) {
      const preIndex = minIndex - 1
      storyContain[preIndex].setAttribute('preload', '')
      this.hasPreload.splice(0, 0, preIndex)
    }
  }

  /**
   * 清除所有页面样式
   */
  clearStyle () {
    const storyContain = this.storyContain
    for (let i = 0; i < storyContain.length; i++) {
      if (this.hasStatus(STYLE, storyContain[i])) {
        this.setViewState(false, STYLE, this.storyContain[i])
        storyContain[i].removeAttribute(STYLE)
      }
    }
  }

  /**
   * 判断当前元素是否有某状态，例如style/current/active的状态
   *
   * @param {string} viewState 页面状态
   * @param {HTMLElement} viewEle 页面元素
   */
  hasStatus (viewState, viewEle) {
    if (viewState && viewEle) {
      return viewEle.hasAttribute(viewState)
    }
  }

  /**
   * 设置页面状态
   *
   * @param {boolean} isSetState 是否设置状态
   * @param {string} viewState 页面状态
   * @param {HTMLElement} viewEle 页面元素
   */
  setViewState (isSetState, viewState, viewEle) {
    if (viewEle && viewState) {
      if (isSetState) {
        viewEle.setAttribute(viewState, '')
      } else {
        viewEle.removeAttribute(viewState)
      }
    }
  }

  /**
  * 处理翻页统计逻辑
  *
  * @param {number} pageIndex 页数下标
  * @param {string} role 页面类型
  */
  triggerStats (pageIndex, role) {
    // 分享页单独统计
    if (role === PAGE_ROLE.sharePage && !isSharePageViewed) {
      isSharePageViewed = true
      return this.trackEvent({
        'category': '_trackEvent',
        'action': '翻页进度',
        'optLabel': '滑动',
        'optValue': '翻到了分享页'
      })
    }
    let pageViewedData = {
      'category': '_trackEvent',
      'action': '翻页进度',
      'optLabel': '滑动',
      'optValue': '翻了1页'
    }
    // 这里主要是 保证第一页发送的时机
    if (!isPageOneViewed) {
      isPageOneViewed = true
      this.trackEvent(pageViewedData)
    }

    // 分享页不计入翻页
    if (role === PAGE_ROLE.sharePage) {
      return
    }
    pageViewed.push(pageIndex)
    const pageViewedInfo = '翻了' + (+pageViewed[pageIndex] + 1) + '页'
    pageViewedData.optValue = pageViewedInfo
    this.trackEvent(pageViewedData)
  }

  /**
  * 百度统计自定义事件
  *
  * @param {Object} obj  统计事件对象
  */
  trackEvent (obj) {
    const label = obj.optLabel || ''
    const value = obj.optValue || ''
    window._hmt.push([obj.category, obj.action, label, value])
  }
}

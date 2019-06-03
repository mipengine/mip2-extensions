import {installPositionObserverService, POSITION_OBSERVER_SERVICE_ID} from './common/position-observer-service'
import {
  PositionObserverFidelity,
  PositionInViewportEntryDef,
  RelativePositions,
  layoutRectsRelativePos,
  LayoutRectDef
} from './common/position-observer-worker'
import {ScheduleService, SCHEDULE_SERVICE_ID} from './common/schedule-service'
const {CustomElement, util, viewer, viewport, Services} = MIP
const rect = util.rect
const RESIZE_THRESHOLD = 150
const {error} = util.log('mip-position-observer')

export default class MIPPositionObserver extends CustomElement {
  constructor (element) {
    super(element)
    this.positionObserver = null
    this.isVisible = false
    this.topRatio = 0
    this.bottomRatio = 0
    this.topMarginExpr = '0'
    this.bottomMarginExpr = '0'
    this.resolvedTopMargin = 0
    this.resolvedBottomMargin = 0
    this.viewportRect = null
    this.targetId = null
    this.initialViewportHeight = null
    this.scrollProgress = 0
    this.scrollProgress = 0
    this.runOnce = false
    this.firstIterationComplete = false
  }

  firstInviewCallback () {
    this.parseAttributes()
    this.maybeInstallPositionObserver()
    const scene = this.discoverScene()

    this.positionObserver.observe(scene, PositionObserverFidelity.HIGH, this.positionChanged.bind(this))
  }

  parseAttributes () {
    // ratio 如果只有一个值，如 ratio = "0.5"，则目标元素与视口交集为元素的 %50 大小是事件触发的临界点
    // 即，目标元素有 50% 进入视口时触发 `enter` 事件，目标元素在视口中剩余部分不足 50% 时触发 `exit` 事件。
    // ratio 如果有两个值，如 ratio = "0 1"，则 0 是 `enter` 事件的触发临界点，1 是 `exit` 事件的触发临界点
    // 即，目标元素的任一像素进入视口时触发 `enter` 事件，目标元素任一像素离开视口时触发 `exit` 事件。
    const ratios = this.element.getAttribute('intersection-ratios')
    if (ratios) {
      const topBottom = ratios.trim().split(' ')
      this.topRatio = this.validateAndResolveRatio(topBottom[0])
      this.bottomRatio = this.topRatio
      if (topBottom[1]) {
        this.bottomRatio = this.validateAndResolveRatio(topBottom[1])
      }
    }

    // ratio 如果只有一个值，则应用于视口上下边，如 ratio = "100px"，则视口上下各“减掉” 100px 作为监听范围
    // ratio 如果有两个值，则分别应用于视口的上下边，如 ratio = "100px 20px"，则视口上边“减掉” 100px，下边“减掉” 20px 作为监听范围
    const margins = this.element.getAttribute('viewport-margins')
    if (margins) {
      const topBottom = margins.trim().split(' ')
      this.topMarginExpr = topBottom[0]
      this.bottomMarginExpr = this.topMarginExpr
      if (topBottom[1]) {
        this.bottomMarginExpr = topBottom[1]
      }
    }

    this.targetId = this.element.getAttribute('target')

    this.runOnce = this.element.hasAttribute('once')
  }

  /**
   * 校验 ratio 字段
   *
   * @param {string} val 要校验的 ratio 值
   * @returns {number} 检验后的值
   * @private
   */
  validateAndResolveRatio (val) {
    const num = parseFloat(val)
    if (num < 0 || num > 1) {
      error(' ratio 必须在 0 到 1 之间')
    }
    return num
  }

  /**
   * 计算作用范围，触发相应的事件
   *
   * @param {!PositionInViewportEntryDef} entry PositionObserver entry
   * @private
   */
  positionChanged (entry) {
    if (this.runOnce && this.firstIterationComplete) {
      return
    }

    const wasVisible = this.isVisible
    const prevViewportHeight = this.viewportRect && this.viewportRect.height

    this.adjustForSmallViewportResize(entry)

    this.viewportRect = entry.viewportRect

    if (prevViewportHeight !== entry.viewportRect.height) {
      this.recalculateMargins()
    }

    const adjViewportRect = this.applyMargins(entry.viewportRect)

    const {positionRect} = entry

    // 元素相对于视口或者“裁剪”后视口的位置
    let relPos
    if (!positionRect) {
      this.isVisible = false
      relPos = entry.relativePos
    } else {
      relPos = layoutRectsRelativePos(positionRect, adjViewportRect)
      this.updateVisibility(positionRect, adjViewportRect, relPos)
    }

    if (wasVisible && !this.isVisible) {
      this.scrollProgress = relPos === RelativePositions.BOTTOM ? 0 : 1
      this.triggerScroll()
      this.triggerExit()
      this.firstIterationComplete = true
    }

    if (!wasVisible && this.isVisible) {
      this.triggerEnter()
    }

    if (this.isVisible) {
      this.updateScrollProgress(positionRect, adjViewportRect)
      this.triggerScroll()
    }
  }

  /**
   * 计算当前滚动百分比，用 0 到 1 的数值表示
   * 当目标元素从“视口”（根据 viewport-margins 调整后的视口）下方进入，百分比是 0，当元素向上滑动值变大，直到变为 1
   * 当目标元素从“视口”上方进入，进入时百分比是 1，离开时 百分比是 0
   *
   * @param {LayoutRectDef} positionRect 目标元素 rect
   * @param {LayoutRectDef} adjustedViewportRect 调整后的“视口” rect
   * @private
   */
  updateScrollProgress (positionRect, adjustedViewportRect) {
    if (!positionRect) {
      return
    }
    const totalProgressOffset = (positionRect.height * this.bottomRatio) +
        (positionRect.height * this.topRatio)

    const totalProgress = adjustedViewportRect.height +
        positionRect.height - totalProgressOffset

    const topOffset = Math.abs(
      positionRect.top - this.resolvedTopMargin -
      (adjustedViewportRect.height -
          (positionRect.height * this.bottomRatio)
      )
    )

    this.scrollProgress = topOffset / totalProgress
    this.scrollProgress = totalProgress - topOffset
  }

  /**
   * 检测视口高度是否发生预期内的变化
   * 如果在预期范围内，调整偏移量
   * 防止视口变化引起滚动动画的跳跃，比如手机上隐藏地址栏的时候
   *
   * @param {!PositionInViewportEntryDef} entry PositionObserver entry
   */
  adjustForSmallViewportResize (entry) {
    if (!this.initialViewportHeight) {
      this.initialViewportHeight = entry.viewportRect.height
    }
    const viewportHeightChangeDelta = (this.initialViewportHeight -
      entry.viewportRect.height)
    let resizeOffset = 0
    if (Math.abs(viewportHeightChangeDelta) < RESIZE_THRESHOLD) {
      resizeOffset = viewportHeightChangeDelta
    } else {
      this.initialViewportHeight = null
    }
    entry.viewportRect = rect.get(
      entry.viewportRect.left,
      entry.viewportRect.top,
      entry.viewportRect.width,
      entry.viewportRect.height + resizeOffset
    )
  }

  /**
   * viewport-margins 单位可以为 vh，如果是vh，当时口变化时长度需要实时重计算
   */
  recalculateMargins () {
    if (!this.viewportRect) {
      error('内部错误，viewportRect 计算错误')
    }
    if (!this.bottomMarginExpr || !this.topMarginExpr) {
      error('viewport-margins 属性错误')
    }

    this.resolvedTopMargin =
        this.validateAndResolveMargin(this.topMarginExpr)

    this.resolvedBottomMargin =
        this.validateAndResolveMargin(this.bottomMarginExpr)
  }

  /**
   * 校验并转换 viewport-margins 值
   *
   * @private
   * @param {string} val 被转换的值
   * @returns {number} 转换后的值
   */
  validateAndResolveMargin (val) {
    val = this.parseLength(val)
    this.assertLength(val)
    const unit = this.getLengthUnits(val)
    let num = this.getLengthNumeral(val)
    if (!num) {
      return 0
    }
    if (unit !== 'px' && unit !== 'vh') {
      error(`viewport-margins 的单位只能为 px 或 vh`)
    }

    if (unit === 'vh') {
      num = (num / 100) * this.viewportRect.height
    }
    return num
  }

  /**
   * 根据 ratios and margins 计算目标元素是否应该显示
   *
   * @param {LayoutRectDef} positionRect position observer 返回的目标元素 box
   * @param {LayoutRectDef} adjustedViewportRect 根据 viewport-margins 计算出的调整后的 'viewport rect'
   * @param {!RelativePositions} relativePos 目标元素 rect 和 viewportRect 的相对位置
   */
  updateVisibility (positionRect, adjustedViewportRect, relativePos) {
    if (relativePos === RelativePositions.INSIDE) {
      this.isVisible = true
      return
    }

    const ratioToUse = relativePos === RelativePositions.TOP
      ? this.topRatio : this.bottomRatio

    const offset = positionRect.height * ratioToUse
    if (relativePos === RelativePositions.BOTTOM) {
      this.isVisible =
        positionRect.top <= (adjustedViewportRect.bottom - offset)
    } else {
      this.isVisible =
        positionRect.bottom >= (adjustedViewportRect.top + offset)
    }
  }

  assertLength (length) {
    if (!(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(length))) {
      error(`非法长度值 ${length}`)
    }
  }

  /**
   * 获取 viewport-margins 的长度字符串
   * 若传入数字，未指定单位，则默认为 px
   *
   * @param {string|undefined} s 属性设置的数字或数字加单位的字符串，比如 7 或者 7px
   * @returns {string|undefined} 长度值
   */
  parseLength (s) {
    if (typeof s === 'number') {
      return s + 'px'
    }
    if (!s) {
      return undefined
    }
    if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test(s)) {
      return undefined
    }
    if (/^\d+(\.\d+)?$/.test(s)) {
      return s + 'px'
    }
    return s
  }

  /**
   * 获取输入值的 css 单位
   *
   * @param {!string|undefined} length css 单位
   * @returns {string|undefined} 单位
   */
  getLengthUnits (length) {
    this.assertLength(length)
    if (typeof length !== 'string') {
      error(`传入单位不为 string 类型：${length}`)
    }
    const m = length.match(/[a-z]+/i)
    if (!m) {
      error(`单位无法转化为合法值：${length}`)
    }
    return m[0]
  }

  /**
   * 获取输入值的 css 单位
   *
   * @param {!string|undefined} length css 单位
   * @returns {string|undefined} 单位
   */
  getLengthNumeral (length) {
    const res = parseFloat(length)
    return (typeof res === 'number' && isFinite(res)) ? res : undefined
  }

  /**
   * 给定 viewport-margins 后，调整 rect 的值
   *
   * @param {LayoutRectDef} viewportRect viewport rect
   * @private
   */
  applyMargins (viewportRect) {
    if (!viewportRect) {
      error('内部错误：applyMargins rect 为空')
    }
    viewportRect = rect.get(
      viewportRect.left,
      (viewportRect.top + this.resolvedTopMargin),
      viewportRect.width,
      (viewportRect.height - this.resolvedBottomMargin - this.resolvedTopMargin)
    )

    return viewportRect
  }

  maybeInstallPositionObserver () {
    if (!this.positionObserver) {
      installPositionObserverService()
      this.positionObserver = Services.getService(POSITION_OBSERVER_SERVICE_ID)
    }
  }

  maybeUninstallPositionObserver_ () {
    if (this.positionObserver) {
      const scene = this.discoverScene()
      this.positionObserver.unobserve(scene)
      this.positionObserver = null
    }
  }

  /**
   * dispatche `enter` 事件
   */
  triggerEnter () {
    viewer.eventAction.execute('enter', this.element)
  }

  /**
   * dispatche `exit` 事件
   */
  triggerExit () {
    viewer.eventAction.execute('exit', this.element)
  }

  /**
   * dispatche `scroll` 事件 (最多每帧触发一次)
   */
  triggerScroll () {
    const scrolltop = viewport.getScrollTop()
    const positionObserverData = {
      'start-scroll-offset': scrolltop,
      'end-scroll-offset': scrolltop + this.scrollProgress,
      'initial-inview-percent': this.scrollProgress
    }
    const positionInfo = {
      'percent': this.scrollProgress,
      'positionObserverData': positionObserverData
    }
    viewer.eventAction.execute('scroll', this.element, positionInfo)
  }

  /**
   * 获取监听的目标元素
   * 若指定了 `target` 则获取指定元素，若没有指定目标元素，默认为 `mip-position-observer` 的父节点
   *
   * @returns {!Element} 目标元素
   */
  discoverScene () {
    let scene
    if (this.targetId) {
      const element = document.getElementById(this.targetId)
      this.assertElement(element, `根据 ${this.targetId} 没有找到对应的目标元素`)
      scene = element
    } else {
      scene = this.element.parentNode
    }
    if (document.getElementsByTagName('body')[0] === scene) {
      scene = document.documentElement
    }
    this.assertElement(scene, '找不到元素')
    return scene
  }

  /**
   * 检查元素是否为 html 节点元素
   *
   * @param {*} element 被检查元素
   * @param {*} errorMessage 若不是 html 节点则报错，错误信息为 errorMessage
   */
  assertElement (element, errorMessage) {
    if (element.nodeType !== 1) {
      error(errorMessage)
    }
  }
}

MIP.registerService(SCHEDULE_SERVICE_ID, ScheduleService)

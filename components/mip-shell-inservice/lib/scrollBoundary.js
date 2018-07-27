/**
 * @file 滚动边界处理
 * @author zhuguoxi@baidu.com (zhuguoxi)
 */

export default {
  /**
   * 滚动边界处理
   */
  init () {
    let touchStartEvent
    let {rect, css} = MIP.util
    // 收集body child元素 并进行包裹
    let scrollaBoundaryTouch = document.createElement('div')
    let offsetHeight
    let bodyPaddingTop
    let body = document.body
    let touchTarget
    let stopProFun = e => e.stopPropagation()

    scrollaBoundaryTouch.setAttribute('mip-shell-scrollboundary', true);
    [].slice.call(body.children).forEach(child => {
      if (/^(SCRIPT|IFRAME|MIP-SHELL|MIP-DATA|MIP-FIXED)/.test(child.nodeName)) {
        return
      }
      scrollaBoundaryTouch.appendChild(child)
    })
    body.appendChild(scrollaBoundaryTouch)

    // 添加事件处理
    scrollaBoundaryTouch.addEventListener('touchstart', e => {
      touchStartEvent = e
      // 内滚 兼容处理
      touchTarget = this.getClosestScrollElement(e.target)
      if (touchTarget) {
        touchTarget.addEventListener('touchmove', stopProFun)
      }
    })

    scrollaBoundaryTouch.addEventListener('touchmove', e => {
      let touchRect = e.targetTouches[0]
      let startTouchReact = touchStartEvent.targetTouches[0]

      // 兼容模式处理
      offsetHeight = document.compatMode === 'BackCompat'
        ? document.body.clientHeight
        : document.documentElement.clientHeight

      bodyPaddingTop = bodyPaddingTop || parseInt(css(body, 'paddingTop'), 10)
      let scrollTop = body.scrollTop || rect.getScrollTop()
      let scrollHeight = rect.getElementRect(scrollaBoundaryTouch).height + bodyPaddingTop

      // 到达顶部时 && 是向下滚动操作
      // 到达底部时 && 并且 向上滚动操作
      let isprevent = (
        touchRect.pageY >= startTouchReact.pageY &&
          touchRect.clientY > startTouchReact.clientY &&
          scrollTop < 5) ||
          (
            touchRect.pageY < startTouchReact.pageY &&
            scrollTop + offsetHeight >= scrollHeight
          )
      if (isprevent) {
        e.preventDefault()
      }
      e.stopPropagation()
    })

    scrollaBoundaryTouch.addEventListener('touchend', () => {
      if (touchTarget) {
        touchTarget.removeEventListener('touchmove', stopProFun)
      }
    })
  },

  /**
   * 获取上级可scroll的元素
   *
   * @param {Object} element 目标元素
   */
  getClosestScrollElement (element) {
    while (element && !element.getAttribute('mip-shell-scrollboundary')) {
      let overflowY = MIP.util.css(element, 'overflow-y')
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.clientHeight < element.scrollHeight) {
        return element
      }

      let overflowX = MIP.util.css(element, 'overflow-x')
      if ((overflowX === 'auto' || overflowX === 'scroll') && element.clientWidth < element.scrollWidth) {
        return element
      }
      element = element.parentNode
    }
    return null
  }
}

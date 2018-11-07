/**
 * @file 小说通用工具函数
 * @author JennyL
 * @author liujing
 */

export const getJsonld = (currentWindow) => {
  // 获取<head>中声明的mip-shell-xiaoshuo 配置。
  // 每个页面不同，如上一页链接，当前章节名
  let jsonld = currentWindow.document.head.querySelector("script[type='application/ld+json']")
  let jsonldConf
  try {
    jsonldConf = JSON.parse(jsonld.innerText).mipShellConfig
    if (!jsonldConf) {
      throw new Error('mip-shell-xiaoshuo配置错误，请检查头部 application/ld+json mipShellConfig')
    }
  } catch (e) {
    console.error(e)
  }
  return jsonldConf
}

/**
 * 获取root页面的window
 *
 * @param {window} currentWindow 当前页面的window
 * @returns {window} root页面的window
 */
export const getRootWindow = currentWindow => {
  return currentWindow.MIP.viewer.page.isRootPage ? currentWindow : currentWindow.parent
}

/**
 * 获取当前页面的iframe
 *
 * @returns {window} 当前iframe的window
 */
export const getCurrentWindow = () => {
  let pageId = window.MIP.viewer.page.currentPageId
  let pageInfo = window.MIP.viewer.page.getPageById(pageId)
  return pageInfo.targetWindow
}

/**
 * 获取上级可scroll的元素
 *
 * @private getClosestScrollElement
 * @param {Object} element 目标元素
 */
function getClosestScrollElement (element) {
  while (element && !element.getAttribute('mip-shell-scrollboundary')) {
    if (MIP.util.css(element, 'overflow-y') === 'auto' && element.clientHeight < element.scrollHeight) {
      return element
    }
    element = element.parentNode
  }
  return null
}

/**
 * 滚动边界处理
 */
export const scrollBoundary = () => {
  let touchStartEvent
  let {
    rect,
    css
  } = MIP.util
  // 收集body child元素 并进行包裹
  let scrollaBoundaryTouch = document.createElement('div')
  let offsetHeight
  let bodyPaddingTop
  let body = document.body
  let touchTarget
  let stopProFun = e => e.stopPropagation()

  scrollaBoundaryTouch.setAttribute('mip-shell-scrollboundary', true);
  [].slice.call(body.children).forEach(child => {
    if (/^(SCRIPT|IFRAME|MIP-SHELL|MIP-DATA)/.test(child.nodeName)) {
      return
    }
    scrollaBoundaryTouch.appendChild(child)
  })
  body.appendChild(scrollaBoundaryTouch)

  // 添加事件处理
  scrollaBoundaryTouch.addEventListener('touchstart', e => {
    touchStartEvent = e
    // 内滚 兼容处理
    touchTarget = getClosestScrollElement(e.target)
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
}

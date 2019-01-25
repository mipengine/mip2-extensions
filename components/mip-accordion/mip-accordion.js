/**
 * @file mip-accordion
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, location, getComputedStyle, sessionStorage */

import './mip-accordion.less'

const { CustomElement, util } = MIP
const { jsonParse } = util

/**
 * 表示展开状态的 DOM 属性 key
 *
 * @constant
 * @type {string}
 */
const EXPANDED_ATTRIBUTE = 'expanded'

/**
 * 表示是否展开的 DOM 属性 key
 *
 * @constant
 * @type {string}
 */
const ARIA_EXPANDED_ATTRIBUTE = 'aria-expanded'

/**
 * accordion 的头部 class 名
 *
 * @constant
 * @type {string}
 */
const MIP_ACCORDION_HEADER_CLASS = 'mip-accordion-header'

/**
 * accordion 的内容部分 class 名
 *
 * @constant
 * @type {string}
 */
const MIP_ACCORDION_CONTENT_CLASS = 'mip-accordion-content'

/**
 * 多层嵌套控制属性
 *
 * @constant
 * @type {string}
 */
const ARIA_CONTROLS_ATTRIBUTE = 'aria-controls'

/**
 * 表示打开的状态的属性值
 *
 * @constant
 * @type {string}
 */
const OPEN_STATUS = 'open'

/**
 * 表示关闭的状态的属性值
 *
 * @constant
 * @type {string}
 */
const CLOSE_STATUS = 'close'

/**
 * 设置 session storage 缓存
 *
 * @param {HTMLElement} sessionKey   存储 session 的 DOM
 * @param {string}      dataKey      session 的 object 数据的 key
 * @param {any}         dataValue    session 存储的 object 数据的 value
 */
function setSession (sessionKey, dataKey, dataValue) {
  let objsession = getSession(sessionKey)
  objsession[dataKey] = dataValue
  try {
    sessionStorage[sessionKey] = JSON.stringify(objsession)
  } catch (e) {}
}

/**
 * 获取 session 内容
 *
 * @param {string} key session 的 key
 */
function getSession (key) {
  try {
    let data = sessionStorage[key]
    return data ? jsonParse(data) : {}
  } catch (e) {}
  return {}
}

/**
 * Make height transiton for element that has unknown height.
 * height transiton from 0px/40px to whatever height element will be.
 *
 * author&maintainer liangjiaying<jiaojiaomao220@163.com>
 *
 * @param  {Object} opt options
 * @example
 * {
 *   "ele": document.getElementById('id1'), // target DOM
 *   "type": "fold",                  // "fold" or "unfold"
 *   "transitionTime": "0.3",         // seconds, animation time
 *   "tarHeight": "140px",            // DOM height when animation ends
 *   "oriHeight": "20px",             // DOM height when animation begins
 *   "cbFun": function() {}.bind()  //callback, exec after animation
 * }
 */
function heightAni (opt) {
  let element = opt.ele
  let type = opt.type

  if (!type || !element) {
    return
  }

  let transitionTime = isNaN(opt.transitionTime) ? 0.24 : Math.min(parseFloat(opt.transitionTime), 1)
  let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
  let tarHeight
  let cbFun = opt.cbFun || function () {}

  if (type === 'unfold') {
    if (opt.tarHeight !== undefined) {
      tarHeight = opt.tarHeight
    } else {
      element.style.transition = 'height 0s'
      element.style.height = 'auto'
      tarHeight = getComputedStyle(element).height
    }

    setTimeout(() => {
      element.style.transition = 'height 0s'
      element.style.height = 'auto'
    }, transitionTime * 1000)
  } else if (type === 'fold') {
    tarHeight = opt.tarHeight || 0
  }

  element.style.height = oriHeight

  // 开始动画
  setTimeout(() => {
    element.style.transition = 'height ' + transitionTime + 's'
    element.style.height = tarHeight
  }, 10)

  // 动画结束后，执行 callback
  setTimeout(cbFun, transitionTime * 1000)
}

// /**
//  * 获取元素的兄弟节点
//  *
//  * @param   {HTMLElement} el  源 DOM 元素
//  * @returns {HTMLElement}  目标 DOM 元素
//  */
// function getSibling (el) {
//   el = el.nextSibling
//   while (el.nodeType === 3) {
//     el = el.nextSibling
//   }

//   return el
// }

/**
 * 获取组件 slot 下面的所有 <section>，并且过滤掉嵌套 MIP 组件下面的 section，以免 MIP 组件嵌套造成相互影响
 *
 * @param {HTMLElement} element 组件根节点
 * @return {Array.<HTMLElement>} selection 列表
 */
function getSections (element) {
  const sections = element.querySelectorAll('section')
  let validSections = []
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i]

    let parent = section.parentNode
    while (parent) {
      if (parent.tagName.indexOf('MIP-') === 0) {
        if (parent === element) {
          validSections.push(section)
        }
        break
      }
      parent = parent.parentNode
    }
  }
  return validSections
}

export default class MIPAccordion extends CustomElement {
  /**
   * 允许预渲染
   */
  prerenderAllowed () {
    return true
  }

  /**
   * 组件渲染
   */
  build () {
    let element = this.element
    let type = element.getAttribute('type') || 'automatic'
    let sections = this.sections = getSections(element)
    let sessionId = this.sessionId = element.getAttribute('sessions-key')
    let sessionKey = this.sessionKey = `MIP-${sessionId}-${location.href}`
    let currentState = getSession.apply(this)

    element.setAttribute('role', 'tablist')

    sections.forEach((section, index) => {
      // let header = section.querySelector('[accordionbtn]')
      // let content = section.querySelector('[accordionbox]')

      let header = section.children.item(0)
      let content = section.children.item(1)
      header && header.classList.add(MIP_ACCORDION_HEADER_CLASS)
      content && content.classList.add(MIP_ACCORDION_CONTENT_CLASS)

      let contentId = content.getAttribute('id')
      if (!contentId) {
        contentId = `MIP_${sessionId}_content_${index}`
        content.setAttribute('id', contentId)
      }

      // tab 状态 [展开/收起] 判断
      if (currentState[contentId]) {
        section.setAttribute(EXPANDED_ATTRIBUTE, '')
      } else if (currentState[contentId] === false) {
        section.removeAttribute(EXPANDED_ATTRIBUTE)
      }

      // 手动控制或者自动根据用户操作控制
      if (type === 'manual' && section.hasAttribute(EXPANDED_ATTRIBUTE)) {
        content.setAttribute(ARIA_EXPANDED_ATTRIBUTE, OPEN_STATUS)
        setSession(sessionKey, element.getAttribute(ARIA_CONTROLS_ATTRIBUTE), true)
      } else if (type === 'automatic') {
        content.setAttribute(ARIA_EXPANDED_ATTRIBUTE, section.hasAttribute(EXPANDED_ATTRIBUTE).toString())
      }

      header.setAttribute(ARIA_CONTROLS_ATTRIBUTE, contentId)
    })

    if (type === 'automatic') {
      this.userSelect()
    }

    this.bindEvents()
  }

  /**
   * 恢复用户上次的选择
   */
  userSelect () {
    let ele = this.element
    let sessionData = getSession(this.sessionKey)

    for (let prop in sessionData) {
      if (!sessionData.hasOwnProperty(prop)) {
        return
      }

      if (sessionData[prop]) {
        let content = ele.querySelector('#' + prop)
        content.setAttribute(ARIA_EXPANDED_ATTRIBUTE, OPEN_STATUS)
        let parent = content.parentNode
        while (parent !== ele) {
          if (parent.tagName === 'section') {
            parent.setAttribute(EXPANDED_ATTRIBUTE, OPEN_STATUS)
          }
          parent = parent.parentNode
        }
        // ele.querySelector('section').setAttribute(EXPANDED_ATTRIBUTE, OPEN_STATUS)
      }
    }
  }

  /**
   * 绑定事件
   */
  bindEvents () {
    let element = this.element
    let sessionKey = this.sessionKey
    let sections = this.sections
    let aniTimeAttr = element.getAttribute('animatetime')
    let aniTime = isNaN(aniTimeAttr) ? 0.24 : Math.min(parseFloat(aniTimeAttr, 10), 1)

    sections.map(section => section.children.item(0)).forEach(accordionHeader => {
      accordionHeader.addEventListener('click', function () {
        let targetId = accordionHeader.getAttribute(ARIA_CONTROLS_ATTRIBUTE)
        let targetContent = element.querySelector('#' + targetId)
        let expanded = targetContent.getAttribute(ARIA_EXPANDED_ATTRIBUTE)

        let section = accordionHeader.parentNode
        let showMore = section.querySelector('.show-more')
        let showLess = section.querySelector('.show-less')

        if (expanded === OPEN_STATUS) {
          // 收起内容区域
          heightAni({
            ele: targetContent,
            type: 'fold',
            transitionTime: aniTime,
            cbFun: function () {
              targetContent.setAttribute(ARIA_EXPANDED_ATTRIBUTE, CLOSE_STATUS)
            }// .bind(undefined, targetContent)
          })

          section.removeAttribute(EXPANDED_ATTRIBUTE)
          if (showMore && showLess) {
            util.css(showMore, 'display', 'block')
            util.css(showLess, 'display', 'none')
          }

          // sections.forEach(section => {
          //   let showMore = section.querySelector('.show-more')
          //   let showLess = section.querySelector('.show-less')
          //   section.classList.remove(EXPANDED_ATTRIBUTE)
          //   if (showMore && showLess) {
          //     util.css(showMore, 'display', 'block')
          //     util.css(showLess, 'display', 'none')
          //   }
          // })

          setSession(sessionKey, targetId, false)
        } else {
          // 同时只能展开一个节点
          if (element.hasAttribute('expaned-limit')) {
            sections.forEach(section => {
              let content = section.querySelector(`.${MIP_ACCORDION_CONTENT_CLASS}`)
              let header = section.querySelector(`.${MIP_ACCORDION_HEADER_CLASS}`)
              let id = header.getAttribute(ARIA_CONTROLS_ATTRIBUTE)

              section.removeAttribute(EXPANDED_ATTRIBUTE)
              content.removeAttribute(ARIA_EXPANDED_ATTRIBUTE)
              setSession(sessionKey, id, false)

              heightAni({
                ele: content,
                type: 'fold',
                transitionTime: aniTime,
                cb: function () {
                  util.css(content, 'height', '')
                }
              })
            })
          }

          targetContent.setAttribute(ARIA_EXPANDED_ATTRIBUTE, OPEN_STATUS)
          section.setAttribute(EXPANDED_ATTRIBUTE, OPEN_STATUS)
          if (showMore && showLess) {
            util.css(showLess, 'display', 'block')
            util.css(showMore, 'display', 'none')
          }

          // sections.forEach(section => {
          //   let showMore = section.querySelector('.show-more')
          //   let showLess = section.querySelector('.show-less')
          //   section.setAttribute(EXPANDED_ATTRIBUTE, OPEN_STATUS)
          //   if (showMore && showLess) {
          //     util.css(showLess, 'display', 'block')
          //     util.css(showMore, 'display', 'none')
          //   }
          // })

          // unfold animation
          heightAni({
            ele: targetContent,
            type: 'unfold',
            oriHeight: 0,
            transitionTime: aniTime,
            cb: function () {
              util.css(targetContent, 'height', '')
            }
          })

          setSession(sessionKey, targetId, true)
        }
      })
    })
  }
}

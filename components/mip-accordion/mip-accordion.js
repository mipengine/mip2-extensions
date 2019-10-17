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
// const CLOSE_STATUS = 'close'

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
 *   "cb": function() {}.bind()  //callback, exec after animation
 * }
 */
function heightAni (opt) {
  let element = opt.ele
  let type = opt.type

  if (!type || !element) {
    return
  }

  let transitionTime = opt.transitionTime
  let oriHeight = (opt.oriHeight !== undefined ? opt.oriHeight : getComputedStyle(element).height)
  let tarHeight
  let cb = opt.cb || function () {}

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
  setTimeout(cb, transitionTime * 1000)
}

/**
 * 获取组件 slot 下面的所有 <section>，并且过滤掉嵌套 MIP 组件下面的 section，以免 MIP 组件嵌套造成相互影响
 *
 * @param {HTMLElement} element 组件根节点
 * @returns {Array.<HTMLElement>} selection 列表
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

/**
 * 生成 session key
 *
 * @param {string} sessionId sessionId
 * @returns {string} session key
 */
function getSessionKey (sessionId) {
  return `MIP-${sessionId}-${location.href}`
}

/**
 * 处理动画时间
 *
 * @param {string} aniTimeAttr 动画时间配置属性
 * @returns {number} 动画时间秒数
 */
function getAniTime (aniTimeAttr) {
  return isNaN(aniTimeAttr) ? 0.24 : Math.min(parseFloat(aniTimeAttr, 10), 1)
}

export default class MIPAccordion extends CustomElement {
  constructor (...args) {
    super(...args)

    this.type = ''
    this.sections = null
    this.sessionKey = ''
    this.aniTime = 0.24
    this.expandedLimit = false
  }

  /**
   * 允许预渲染
   */
  prerenderAllowed () {
    return true
  }

  build () {
    // 初始化属性
    this.type = this.element.getAttribute('type') || 'automatic'
    this.sections = getSections(this.element)
    this.sessionId = this.element.getAttribute('sessions-key')
    this.sessionKey = getSessionKey(this.sessionId)

    this.aniTime = getAniTime(this.element.getAttribute('animatetime'))
    this.expandedLimit = this.element.hasAttribute('expanded-limit')

    this.element.setAttribute('role', 'tablist')

    // 初始化节点属性，绑定事件
    this.sections.forEach((section, index) => {
      // let header = section.querySelector('[accordionbtn]')
      // let content = section.querySelector('[accordionbox]')
      this.initAttr(section, index)
      this.bindEvent(section)
    })
  }

  /**
   * 初始化 accordion 节点属性
   *
   * @param {HTMLElement} section 容器
   * @param {number} index section 在全文的序号
   */
  initAttr (section, index) {
    let header = this.getHeader(section)
    let content = this.getContent(section)

    // 添加默认样式
    header && header.classList.add(MIP_ACCORDION_HEADER_CLASS)
    content && content.classList.add(MIP_ACCORDION_CONTENT_CLASS)

    // 设置内容块 id
    let contentId = content.getAttribute('id')

    if (!contentId) {
      contentId = `MIP_${this.sessionId}_content_${index}`
      content.setAttribute('id', contentId)
    }

    header.setAttribute(ARIA_CONTROLS_ATTRIBUTE, contentId)

    // 根据组件配置和 session 状态初始化节点的展开和折叠
    let sectionDesc = {
      section,
      contentId,
      animate: false
    }

    // 手动控制或者自动根据用户操作控制
    if (this.type === 'manual' && section.hasAttribute(EXPANDED_ATTRIBUTE)) {
      this.unfold(sectionDesc)
    } else if (this.type === 'automatic') {
      this.currentState = this.currentState || getSession(this.sessionKey)

      if (this.currentState[contentId]) {
        this.unfold(sectionDesc)
      } else if (this.currentState[contentId] === false) {
        this.fold(sectionDesc)
      }
    }
  }

  /**
   * 绑定事件
   *
   * @param {HTMLElement} section 节点容器
   */
  bindEvent (section) {
    let header = this.getHeader(section)
    let targetId = header.getAttribute(ARIA_CONTROLS_ATTRIBUTE)

    header.addEventListener('click', () => {
      let expanded = section.getAttribute(EXPANDED_ATTRIBUTE)

      if (expanded === OPEN_STATUS) {
        this.fold({
          section,
          targetId
        })
        return
      }

      // 同时只能展开一个节点
      if (this.expandedLimit) {
        // 折叠其他节点
        this.sections
          .filter(otherSection => (
            otherSection !== section &&
            otherSection.hasAttribute(EXPANDED_ATTRIBUTE)
          ))
          .forEach(otherSection => {
            this.fold({
              section: otherSection
            })
          })
      }

      this.unfold({
        section,
        targetId
      })
    })
  }

  /**
   * 通过节点容器获取 header
   *
   * @param {HTMLElement} section 节点容器
   * @returns {HTMLElement} header
   */
  getHeader (section) {
    return section.children.item(0)
  }

  /**
   * 通过节点容器获取 content
   *
   * @param {HTMLElement} section 节点容器
   * @returns {HTMLElement} content
   */
  getContent (section) {
    return section.children.item(1)
  }

  /**
   * 展开节点
   *
   * @param {string=} targetId content 的节点 id
   * @param {HTMLElement} section 节点容器
   * @param {boolean} animate 展开过程是否出动画
   */
  unfold ({
    targetId,
    section,
    animate = true
  }) {
    section.setAttribute(EXPANDED_ATTRIBUTE, OPEN_STATUS)

    let content = this.getContent(section)
    if (!content) {
      return
    }

    content.setAttribute(ARIA_EXPANDED_ATTRIBUTE, OPEN_STATUS)

    // 记录折叠情况
    if (this.type === 'automatic') {
      targetId = targetId || content.getAttribute('id')
      setSession(this.sessionKey, targetId, true)
    }

    // 折叠过程是否出动画效果
    if (!animate) {
      return
    }

    heightAni({
      ele: content,
      type: 'unfold',
      oriHeight: 0,
      transitionTime: this.aniTime,
      cb () {
        util.css(content, 'height', '')
      }
    })
  }

  /**
   * 折叠节点
   *
   * @param {string=} targetId content 的节点 id
   * @param {HTMLElement} section 节点容器
   * @param {boolean} animate 展开过程是否出动画
   */
  fold ({
    section,
    targetId,
    animate = true
  }) {
    section.removeAttribute(EXPANDED_ATTRIBUTE)

    let content = this.getContent(section)
    if (!content) {
      return
    }

    // 记录折叠情况
    if (this.type === 'automatic') {
      targetId = targetId || content.getAttribute('id')
      setSession(this.sessionKey, targetId, false)
    }

    // 折叠过程是否出动画效果
    if (animate) {
      // 收起内容区域
      heightAni({
        ele: content,
        type: 'fold',
        transitionTime: this.aniTime,
        cb () {
          content.removeAttribute(ARIA_EXPANDED_ATTRIBUTE)
        }
      })
    } else {
      content.removeAttribute(ARIA_EXPANDED_ATTRIBUTE)
    }
  }
}

/**
 * @file mip 全屏滚动组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-fullpage-scroll.less'

const { CustomElement, util, viewer, viewport } = MIP
const { Gesture, platform } = util

export default class MIPFullpageScroll extends CustomElement {
  static props = {
    direction: {
      type: String,
      default: 'horizontal'
    },

    navigateable: {
      type: Boolean,
      default: false
    },

    focus: {
      type: Number,
      default: 1
    },

    loop: {
      type: Boolean,
      default: false
    },

    autoplay: {
      type: Boolean,
      default: false
    },

    timeout: {
      type: Number,
      default: 3000
    }
  }

  constructor (...elements) {
    super(...elements)

    this.timer = null
    this.currentIndex = 0
    this.vh = 0
    this.vw = 0
  }

  build () {
    let { focus } = this.props
    let ele = this.element

    this.gesture = new Gesture(ele, {
      preventY: true,
      preventX: true
    })
    this.sections = [...ele.querySelectorAll('section')]
    this.currentIndex = focus - 1

    this.render()
    this.goTo(this.currentIndex)
    this.bindEvents()
    this.registerEvents()
  }

  /**
   * 渲染相关的操作
   */
  render () {
    let { direction, navigateable } = this.props
    let wrapper = document.createElement('div')
    let ele = this.element
    let vh = this.vh = viewport.getHeight()
    let vw = this.vw = viewport.getWidth()

    if (platform.isIOS() && platform.isBaiduApp()) {
      // 兼容 iOS 手百的 webview 竖向高度的 Bug
      vh = this.vh = vh - 52
    }

    wrapper.setAttribute('mip-fullpage-scroll-wrapper', '')
    wrapper.innerHTML = ele.innerHTML
    util.css(ele, {
      width: vw + 'px',
      height: vh + 'px'
    })

    this.wrapper = wrapper
    ele.innerHTML = ''
    ele.appendChild(wrapper)

    ;[...ele.querySelectorAll('section')].forEach(section => util.css(section, {
      width: vw + 'px',
      height: vh + 'px'
    }))

    if (direction === 'horizontal') {
      ele.setAttribute('direction', 'horizontal')
      util.css(wrapper, {
        width: this.sections.length * vw + 'px'
      })
    } else {
      util.css(wrapper, {
        height: this.sections.length * vh + 'px'
      })
    }

    if (navigateable) {
      this.initNav()
    }
  }

  /**
   * 绑定组件的事件
   */
  bindEvents () {
    this.gesture.on('swipe', (event, data) => {
      if (data.swipeDirection === 'up' || data.swipeDirection === 'left') {
        if (this.currentIndex < this.sections.length - 1) {
          this.currentIndex++
        }
      }
      if (data.swipeDirection === 'down' || data.swipeDirection === 'right') {
        if (this.currentIndex > 0) {
          this.currentIndex--
        }
      }
      this.addLoopListener()
      this.goTo(this.currentIndex)
    })

    this.addLoopListener()
  }

  addLoopListener () {
    let { autoplay, timeout } = this.props
    if (autoplay) {
      clearInterval(this.timer)
      this.timer = setInterval(() => this.next(), timeout)
      this.isPause = false
    }
  }

  /**
   * 注册对外暴露的事件
   */
  registerEvents () {
    this.addEventAction('goTo', (e, index) => {
      this.addLoopListener()
      this.goTo(index - 1)
    })
    this.addEventAction('back', () => {
      this.addLoopListener()
      this.back()
    })
    this.addEventAction('next', () => {
      this.addLoopListener()
      this.next()
    })
  }

  /**
   * 初始化导条控件
   */
  initNav () {
    let navWrapper = document.createElement('mip-fixed')
    let { direction } = this.props

    navWrapper.setAttribute('navigator', '')
    navWrapper.setAttribute('still', '')

    for (let i = 0; i < this.sections.length; i++) {
      let navItem = document.createElement('span')
      navItem.setAttribute('navigator-item', i)
      if (i + 1 === this.currentIndex) {
        navItem.setAttribute('current-item', '')
      }
      navWrapper.appendChild(navItem)
    }

    navWrapper.addEventListener('click', e => {
      let target = e.target
      if (target && target.hasAttribute('navigator-item')) {
        let index = target.getAttribute('navigator-item')
        this.goTo(+index)
      }
    })

    this.element.appendChild(navWrapper)
    if (direction === 'horizontal') {
      let width = navWrapper.clientWidth
      util.css(navWrapper, {
        marginLeft: -(width / 2) + 'px'
      })
    } else {
      let height = navWrapper.clientHeight
      util.css(navWrapper, {
        marginTop: -(height / 2) + 'px'
      })
    }
  }

  /**
   * 通过下标定位到某个 section
   *
   * @param {number} index 表示第几个 section
   */
  goTo (index) {
    let { direction, navigateable, loop } = this.props
    let len = this.sections.length

    if (loop) {
      index = (len + index) % len
      index = index < 0 ? (index + len) : index
    } else {
      index = index < 0 ? 0 : index
      index = index > len - 1 ? len - 1 : index
    }

    this.currentIndex = index

    if (direction === 'horizontal') {
      util.css(this.wrapper, {
        left: '-' + index * this.vw + 'px'
      })
    } else {
      util.css(this.wrapper, {
        top: '-' + index * this.vh + 'px'
      })
    }

    if (navigateable) {
      [...this.element.querySelectorAll('[navigator-item]')].forEach((item, i) => {
        if (index === i) {
          item.setAttribute('current-item', '')
        } else {
          item.removeAttribute('current-item')
        }
      })
    }

    viewer.eventAction.execute('change', this.element, { index: index + 1 })
  }

  /**
   * 去上一个 section
   */
  back () {
    this.goTo(--this.currentIndex)
  }

  /**
   * 去下一个 section
   */
  next () {
    this.goTo(++this.currentIndex)
  }
}

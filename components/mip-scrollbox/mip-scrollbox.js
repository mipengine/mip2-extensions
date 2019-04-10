/**
 * @file 横向滑动组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-scrollbox.less'

const { CustomElement, util, viewport } = MIP
const logger = util.log('mip-scrollbox')

/**
 * 默认配置
 *
 * @const
 * @type {Object}
 */
const DEFAULTS = {
  rate: 97 / 1140 * 100,
  right: 24 / 97 * 100,
  type: null
}

export default class MIPScrollbox extends CustomElement {
  /**
   * connectedCallback 回调
   */
  connectedCallback () {
    let me = this
    let element = me.element
    ;[
      '[data-wrapper]',
      '[data-inner]',
      '[data-scroller]',
      '[data-item]'
    ].forEach(key => {
      if (!element.querySelectorAll(key).length) {
        logger.error(element, `组件必须包含属性 '${key}'`)
        me.build = function () {}
      }
    })
  }

  /**
   * 提前执行，因为要设置元素的宽度
   */
  build () {
    let element = this.element
    // 不能用 Object.assign 不然的话 element.dataset 不能拷贝过来
    let config = util.fn.extend({}, DEFAULTS, element.dataset)
    let updateView = util.fn.throttle(() => viewport.trigger('changed'), 200)

    // 绑定滚动事件触发更新视图
    element.querySelector('[data-inner]').addEventListener('scroll', updateView)
    element.addEventListener('touchmove', e => e.stopPropagation())

    if (config.type !== 'row') {
      return
    }

    let nodes = element.querySelectorAll('[data-item]')
    let width = 0
    let cols = 0
    let nodesArr = [...nodes]

    // 这个 for 循环是用来计算宽度 width 的
    nodesArr.forEach(node => {
      let col = node.dataset.col || 3
      width += col * config.rate
      cols += col - 0
    })

    // 这个 for 循序是需要用到通过上面 for 循序计算出来的总的 width
    nodesArr.forEach(node => {
      util.css(node, {
        width: (node.dataset.col || 3) * config.rate / width * 100 + '%',
        paddingRight: config.right / cols + '%'
      })
    })
    util.css(element.querySelector('[data-scroller]'), {
      width: width + '%'
    })
    // element.querySelector('[data-scroller]').style.width = width + '%'
  }
}

/**
 * @file 横向滑动组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-scrollbox.less'

const {CustomElement, util, viewport} = MIP

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
    let element = this.element;
    [
      '[data-wrapper]',
      '[data-inner]',
      '[data-scroller]',
      '[data-item]'
    ].forEach(key => {
      if (!element.querySelectorAll(key).length) {
        console.warn('组件必须包含属性元素 `' + key + '` 。', element)
        me.build = function () {}
      }
    })
  }

  /**
   * 提前执行，因为要设置元素的宽度
   */
  build () {
    let element = this.element
    let config = Object.assign({}, DEFAULTS, element.dataset)
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
    let nodesArr = [].slice.call(nodes)

    // 这个 for 循环是用来计算宽度 width 的
    nodesArr.forEach(node => {
      let col = node.dataset.col || 3
      width += col * config.rate
      cols += col - 0
    })

    // 这个 for 循序是需要用到通过上面 for 循序计算出来的总的 width
    nodesArr.forEach(node => {
      node.style.width = (node.dataset.col || 3) * config.rate / width * 100 + '%'
      node.style.paddingRight = config.right / cols + '%'
    })
    element.querySelector('[data-scroller]').style.width = width + '%'
  }
}

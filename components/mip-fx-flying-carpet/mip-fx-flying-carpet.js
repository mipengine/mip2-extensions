/**
 * @file 视差滚动组件
 * @author sekiyika(pengxing@baidu.com)
 */

import './mip-fx-flying-carpet.less'

export default class MIPFxFlyingCarpet extends MIP.CustomElement {
  /**
   * 视差滚动组件
   *
   * @param {Array.<*>} args args
   */
  constructor (...args) {
    super(...args)

    /**
     * 组件容器
     * @type {HTMLElement}
     * @private
     */
    this.container_ = null

    /**
     * 子节点列表
     * @type {Array.<HTMLElmeent>}
     * @private
     */
    this.children_ = []
  }

  /** @override */
  build () {
    let container = document.createElement('div')
    container.setAttribute('class', 'i-mip-fx-flying-carpet-container')
    this.container_ = container

    let childNodes = Array.from(this.element.children)
    childNodes.forEach(node => container.appendChild(node))

    let clip = document.createElement('div')
    clip.setAttribute('class', 'i-mip-fx-flying-carpet-clip')
    clip.appendChild(container)

    this.element.appendChild(clip)
  }
}

/**
 * @file 镂空滚动组件
 * @author sekiyika(pengxing@baidu.com)
 */

import './mip-fx-flying-carpet.less'

export default class MIPFxFlyingCarpet extends MIP.CustomElement {
  /** @override */
  build () {
    let container = document.createElement('div')
    container.setAttribute('class', 'i-mip-fx-flying-carpet-container')

    let children = [...this.element.children]
    children.forEach(child => container.appendChild(child))

    let clip = document.createElement('div')
    clip.setAttribute('class', 'i-mip-fx-flying-carpet-clip')
    clip.appendChild(container)

    this.element.appendChild(clip)
  }
}

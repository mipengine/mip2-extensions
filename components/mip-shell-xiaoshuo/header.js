/**
 * file: 小说shell 头部的处理
 * author: xiongwenjie
 */

class Header {
  constructor (rootEl) {
    // 渲染侧边栏目录元素
    this.header = document.querySelector('.mip-shell-header-wrapper')
  }
  show () {
    this.header.classList.add('show')
  }
  hide () {
    this.header.classList.remove('show')
  }
}

export default Header

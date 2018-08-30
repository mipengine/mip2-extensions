/**
 * file: 小说shell 头部的处理
 * author: xiongwenjie
 */
let viewer = MIP.viewer
class Header {
  constructor (rootEl) {
    // 渲染侧边栏目录元素
    this.header = document.querySelector('.mip-shell-header-wrapper')
    this.headerBtn = document.querySelector('.mip-shell-header-wrapper a')
    this.initEvent()
  }
  /**
   * 抛出头部回退信息
   */
  initEvent () {
    this.headerBtn.addEventListener('click', () => {
      viewer.sendMessage('interaction-log', {
        info: { back: 'back' },
        dim: {pd: 'novel'}
      })
    })
  }
  show () {
    this.header.classList.add('show')
  }
  hide () {
    this.header.classList.remove('show')
  }
}

export default Header

/**
 * file: 小说shell 头部的处理
 * author: xiongwenjie
 */
import {sendLog} from '../common/log'

class Header {
  constructor (rootEl) {
    // 渲染侧边栏目录元素
    this.header = document.querySelector('.mip-shell-header-wrapper')
    this.headerBtn = document.querySelector('.mip-shell-header-wrapper .back-button')
    this.initEvent()
  }
  /**
   * 抛出头部回退信息
   */
  initEvent () {
    console.log(this.headerBtn)
    this.headerBtn.addEventListener('click', () => {
      // 点击回退按钮 发送日志
      sendLog('interaction', {back: 'back'})
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

/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */
import {constant} from '../constant-config'
let event = window.MIP.util.event

class Event {
  constructor (config) {
    this.state = true
  }
  bind () {
    let isRootPage = true
    /**
     * 当【下一页】按钮被点击了, 抛出'next-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let nextPageButton = '.mip-shell-footer .page-next'
    event.delegate(document.body, nextPageButton, 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
        name: constant.NEXT_PAGE_BUTTON_CLICK
      })
    })

    /**
     * 当【上一页】按钮被点击了, 抛出'previous-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let previousPageButton = '.mip-shell-footer .page-previous'
    event.delegate(document.body, previousPageButton, 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
        name: constant.PREVIOUS_PAGE_BUTTON_CLICK
      })
    })

    window.addEventListener(constant.NEXT_PAGE_BUTTON_CLICK, e => console.log('NEXT_PAGE_BUTTON_CLICK'))
    window.addEventListener(constant.PREVIOUS_PAGE_BUTTON_CLICK, e => console.log('PREVIOUS_PAGE_BUTTON_CLICK'))
  }
}

export default Event

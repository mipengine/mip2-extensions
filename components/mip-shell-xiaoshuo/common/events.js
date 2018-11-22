/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * @author liujing
 */
import {Constant} from './constant-config'
import {sendTCLog} from './log'

let event = window.MIP.util.event

export default class XiaoshuoEvents {
  // 每次搜索点出，同步刷新调用
  bindRoot () {
    /**
     * 当【下一页】按钮被点击了, 抛出'next-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let nextPageButton = '.mip-shell-footer .page-next:not(.disabled)'
    event.delegate(document.documentElement, nextPageButton, 'click', function () {
      // tc日志打点
      sendTCLog('interaction', {
        type: 'b',
        action: 'nextShellButton'
      })
      window.MIP.viewer.page.emitCustomEvent(window, false, {
        name: Constant.NEXT_PAGE_BUTTON_CLICK
      })
    })

    /**
     * 当【上一页】按钮被点击了, 抛出'previous-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let previousPageButton = '.mip-shell-footer .page-previous:not(.disabled)'
    event.delegate(document.documentElement, previousPageButton, 'click', function () {
      // tc日志打点
      sendTCLog('interaction', {
        type: 'b',
        action: 'preShellButton'
      })
      window.MIP.viewer.page.emitCustomEvent(window, false, {
        name: Constant.PREVIOUS_PAGE_BUTTON_CLICK
      })
    })
  }

  // 每次翻页/页面刷新时都会触发
  bindAll () {
    this.bindPrePageButton()
    this.bindNextPageButton()
  }

  /**
   * 当shell内部【上一页】按钮被点击了,发送tc日志
   *
   * @private
   */
  bindPrePageButton () {
    event.delegate(document.documentElement, '.navigator a:first-child', 'click', function () {
      // tc日志打点
      sendTCLog('interaction', {
        type: 'b',
        action: 'prePageButton'
      })
    })
  }

  /**
   * 当shell内部【下一页】按钮被点击了,发送tc日志
   *
   * @private
   */
  bindNextPageButton () {
    event.delegate(document.documentElement, '.navigator a:last-child', 'click', function () {
      // tc日志打点
      sendTCLog('interaction', {
        type: 'b',
        action: 'nextPageButton'
      })
    })
  }
}

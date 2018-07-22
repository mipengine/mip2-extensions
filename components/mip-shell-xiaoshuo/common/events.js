/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */
import {Constant} from '../constant-config'
import state from './state'
let event = window.MIP.util.event

class XiaoshuoEvents {
  constructor (config) {
    this.state = true
  }

  // 每次搜索点出，同步刷新调用
  bindRoot () {
    /**
     * 当【下一页】按钮被点击了, 抛出'next-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let nextPageButton = '.mip-shell-footer .page-next:not(.disabled)'
    event.delegate(document.body, nextPageButton, 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(window, false, {
        name: Constant.NEXT_PAGE_BUTTON_CLICK
      })
    })

    /**
     * 当【上一页】按钮被点击了, 抛出'previous-page-button-clicked'事件
     * @fires 'next-page-button-clicked'
     */
    let previousPageButton = '.mip-shell-footer .page-previous:not(.disabled)'
    event.delegate(document.body, previousPageButton, 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(window, false, {
        name: Constant.PREVIOUS_PAGE_BUTTON_CLICK
      })
    })

    // 抛出 “在根页面,搜索点出页” 事件给阅读器
    window.MIP.viewer.page.emitCustomEvent(window, false, {
      name: Constant.IN_ROOT_PAGE
    })

    window.addEventListener(Constant.NEXT_PAGE_BUTTON_CLICK, e => console.log('NEXT_PAGE_BUTTON_CLICK'))
    window.addEventListener(Constant.PREVIOUS_PAGE_BUTTON_CLICK, e => console.log('PREVIOUS_PAGE_BUTTON_CLICK'))
  }

  // 每次翻页/页面刷新时都会触发
  bindAll () {
    console.log(state)
    let isRootPage = state.isRootPage()
    console.log('isRootPage: ', isRootPage)

    // event.delegate(document.body, previousPageButton, 'click', function () {
    //   window.MIP.viewer.page.emitCustomEvent(window, false, {
    //     name: Constant.PREVIOUS_PAGE_BUTTON_CLICK
    //   })
    // })
  }
}

export default XiaoshuoEvents

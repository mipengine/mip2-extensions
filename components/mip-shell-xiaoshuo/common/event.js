/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */
class Event {
  constructor (config) {
    this.state = true
  }
  bind () {
    let isRootPage = true
    /**
     * 当下一页按钮被点击了, 抛出'next-page-button-clicked'事件
     *
     * @fires 'next-page-button-clicked'
     */
    document.addEventListener('下一页按钮', 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
        name: 'next-page-button-clicked'
      })
    })
    /**
     * 当上一页按钮被点击了, 抛出'previous-page-button-clicked'事件
     *
     * @fires 'next-page-button-clicked'
     */
    document.addEventListener('上一页按钮', 'click', function () {
      window.MIP.viewer.page.emitCustomEvent(isRootPage ? window : window.parent, false, {
        name: 'previous-page-button-clicked'
      })
    })
  }
}

export default Event

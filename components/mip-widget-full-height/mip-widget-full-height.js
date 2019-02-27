/**
 * @file mip-widget-full-height 组件
 * @author oott123<git@public.oott123.com> chenqiushi
 */

const {CustomElement, util, viewport, viewer} = MIP
const log = util.log('mip-widget-full-height')
let createLock = false

export default class MIPWidgetFullHeight extends CustomElement {
  build () {
    if (MIP.standalone) {
      return
    }
    if (createLock) {
      log.error(this.element, '一个页面只允许使用一个 mip-full-height 组件！')
      return
    }

    createLock = true

    this.isAndroid = document.documentElement.classList.contains('mip-i-android-scroll')
    this.latestScrollHeight = 0

    viewport.on('resize', () => {
      this.updateViewportHeight()
    })

    this.updateViewportHeight()

    setTimeout(() => {
      viewport.trigger('resize') // iOS 下第一次不触发 resize。手动触发下
    }, 166)

    setInterval(() => {
      this.updateViewportHeight()
    }, 166)
  }

  updateViewportHeight () {
    let scrollHeight = viewport.getScrollHeight()
    if (this.isAndroid) {
      scrollHeight = document.body.scrollHeight
    }
    // console.log(scrollHeight, bodyHeight);
    // scrollHeight = bodyHeight;
    if (scrollHeight !== this.latestScrollHeight) {
      // console.log('高度变动，from=%d, to=%d', this.latestScrollHeight, scrollHeight);
      this.latestScrollHeight = scrollHeight
      viewer.sendMessage('full-height-update', {
        scrollHeight
      })
    }
  }
}

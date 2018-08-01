/**
 * @file 极速服务 shell 定制
 * @author zhuguoxi@baidu.com (zhuguoxi)
 */

import './mip-shell-inservice.less'
import scrollBoundary from './lib/scrollBoundary'
import MoreAction from './lib/MoreAction'
import ProcessConfig from './lib/ProcessConfig'
import Footer from './lib/Footer' // 底部控制栏

export default class MIPShellInservice extends MIP.builtinComponents.MIPShell {
  constructor (...args) {
    super(...args)

    this.alwaysReadConfigOnLoad = false
    this.transitionContainsHeader = false
    this.moreAction = new MoreAction(this.headerInfo = {})
    scrollBoundary.init()
    this.processConfig = new ProcessConfig()
    this.footer = new Footer()
  }

  /**
   * 组件一加载进行 刷新token
   */
  build () {
    super.build()
    this.processConfig.reflushToken()
  }

  /**
   * MipShell 扩展配置处理函数, 异步获取 熊掌号信息
   *
   * @param {Object} shellConfig 继承MipShell config
   */
  async processShellConfig (shellConfig) {
    this.shellConfig = shellConfig
    this.footer.initShellConfig(shellConfig)

    await this.processConfig.init(this.headerInfo, shellConfig).process()
    this.updateShellConfig(shellConfig)
    if (shellConfig.isId) {
      this.refreshShell({ pageId: window.MIP.viewer.page.pageId, asyncRefresh: true })
    }
  }
  /**
   * 更多按钮hook
   *
   * @param {string} buttonName 触发button类型
   */
  handleShellCustomButton (buttonName) {
    if (buttonName === 'share') {
      this.moreAction.share()
      this.toggleDropdown(false)
    } else if (buttonName === 'indexPage') {
      this.moreAction.indexPage()
      this.toggleDropdown(false)
    } else if (buttonName === 'about') {
      this.moreAction.about()
      this.toggleDropdown(false)
    }
    // 修复 非首页极速服务页 无后退时场景
    if (buttonName === 'back' && history.length < 2) {
      this.moreAction.indexPage()
    }
  }
  /**
   * 是否显示 关闭button, 不能返回搜索结果页时进行处理
   */
  showHeaderCloseButton () {
    let { canClose } = MIP.hash.hashTree || {}
    return canClose && canClose.value === 'true'
  }

  /**
   * 底部菜单栏导航
   */
  renderOtherParts () {
    this.footer._render()
  }

  updateOtherParts () {
    this.moreAction.sendLog(this.processConfig.getLocalToken())

    let pageMeta = this.currentPageMeta
    this.footer.initCurrentPageMeta(pageMeta)

    this.footer._update()
  }

  bindHeaderEvents () {
    super.bindHeaderEvents()

    this.footer._bind()
  }

  unbindHeaderEvents () {
    super.unbindHeaderEvents()

    this.footer._unbind()
  }

  bindAllEvents () {
    super.bindAllEvents()

    this.footer._bindAll()
  }

  /**
   * 页面切换动画
   */
  beforeSwitchPage (options) {
    console.log('beforeSwitchPage options: ', options)
    // 固定动画切换方向为前进方向
    // options.isForward = true
    // 固定打开新的iframe
    // options.newPage = true
    window.MIP_SHELL_OPTION.allowTransition = false

    // MIP.util.naboo.animate(ele, {
    //   width: "90%"
    // }, {
    //   duration: 2000,
    //   cb: function () {
    //     console.log('动画结束')
    //   }
    // }).start()

    let pageMeta = options.targetPageMeta
    this.footer.initTargetPageMeta(pageMeta)

    this.footer._switchPage()
  }

  afterSwitchPage (options) {
    // 向所有页面广播页面切换事件，并给出切换前后的 pageId
    console.log('afterSwitchPage options: ', options)
    let {sourcePageId, targetPageId} = options
    window.MIP.viewer.page.broadcastCustomEvent({
      name: 'switchPageComplete',
      data: {
        targetPageId,
        sourcePageId
      }
    })
  }

}

/**
 * @file 极速服务 小说shell
 * @author liangjiaying@baidu.com (JennyL)
 */

import './mip-shell-xiaoshuo.less'
import Catalog from './catalog' // 侧边栏目录
import Footer from './footer' // 底部控制栏
import {Mode, FontSize} from './setting' // 背景色调整，字体大小调整

export default class MipShellXiaoshuo extends window.MIP.builtinComponents.MipShell {
  // 继承基类 shell, 扩展小说shell
  constructor (...args) {
    super(...args)
    this.alwaysReadConfigOnLoad = true
    this.transitionContainsHeader = false
  }

  // 基类方法：修改配置。从mip-shell 配置中获取 `config` 字段
  processShellConfig (shellConfig) {
    this.shellConfig = shellConfig
  }

  // 自有方法：初始化所有内置对象，包括底部控制栏，侧边栏，字体调整按钮，背景颜色模式切换
  _initAllObjects () {
    let configMeta = this.currentPageMeta
    // 创建底部 bar
    this.footer = new Footer(configMeta.footer)
    // 创建目录侧边栏
    this.catalog = new Catalog(configMeta.catalog)
    // 创建字体调整栏
    this.fontSize = new FontSize(document.querySelector('.mip-shell-footer-wrapper .mip-shell-xiaoshuo-control-fontsize'))
    // 创建模式切换（背景色切换）
    this.mode = new Mode()
  }

  // 基类方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe颜色设置，通知所有iframe和根页面颜色改变
  bindAllEvents () {
    super.bindAllEvents()
    // 初始化所有内置对象
    let me = this
    // 暴露给外部html的调用方法，显示底部控制栏
    // 使用 on="tap:xiaoshuo-shell.showShellFooter"调用
    this.addEventAction('showShellFooter', function () {
      window.MIP.viewer.page.emitCustomEvent(window.parent, false, {
        name: 'showShellFooter'
      })
    })
    // 暴露给外部html的调用方法, 显示目录侧边栏
    this.addEventAction('showShellCatalog', function () {
      window.MIP.viewer.page.emitCustomEvent(window.parent, false, {
        name: 'showShellCatalog'
      })
    })
    // 功能绑定：背景色切换
    this.addEventAction('changeMode', function (e, mode) {
      window.MIP.viewer.page.broadcastCustomEvent({
        name: 'changeMode',
        data: {
          mode: mode
        }
      })
    })
    // 并执行一次背景色/字体初始化
    window.MIP.viewer.page.broadcastCustomEvent({
      name: 'changeMode'
    })
    // 绑定底部弹层控制条拖动事件
    this.addEventAction('showFontAdjust', function (e) {
      this.fontSize.showFontBar(e)
    })
    this.addEventAction('changeFont', function (e, data) {
      this.fontSize.changeFont(e, data)
    })

    // 绑定弹层点击关闭事件
    if (this.$buttonMask) {
      this.$buttonMask.onclick = this._closeEverything.bind(me)
    }
  }

  // 基类方法：绑定页面可被外界调用的事件。
  // 如从跳转后的iframe内部emitEvent, 调用根页面的shell bar弹出效果
  bindRootEvents () {
    super.bindRootEvents()
    let me = this
    // 绑定 Root shell 字体bar拖动事件
    this.fontSize.bindDragEvent()
    // 承接emit事件：根页面修改页面模式、背景
    window.addEventListener('changeMode', (e, data) => {
      if (e.detail[0]) {
        me.mode.update(e, e.detail[0].mode)
      } else {
        me.mode.update(e)
      }
    })
    // 承接emit事件：根页面展示底部控制栏
    window.addEventListener('showShellFooter', (e, data) => {
      me.footer.show(me)
    })
    // 承接emit事件：显示目录侧边栏
    window.addEventListener('showShellCatalog', (e, data) => {
      me.catalog.show(me)
      me.footer.hide()
    })
  }

  // 基类方法：初始化。用于除头部bar之外的元素
  renderOtherParts () {
    super.renderOtherParts()
    // 初始化所有内置对象，包括底部控制栏，侧边栏，字体调整按钮，背景颜色模式切换
    this._initAllObjects()
  }

  // 基类方法：更新。用于除头部bar之外的元素
  updateOtherParts () {
    super.updateOtherParts()
    this._initAllObjects()
  }

  _closeEverything () {
    // 关闭所有可能弹出的bar
    this.toggleDOM(this.$buttonWrapper, false) // 关不掉分享按钮组
    this.$buttonWrapper.style.display = 'none' // XXX: hack, 修复 toggleDOM 中强制给未展示底部按钮组增加display:block问题
    this.footer.hide()
    this.catalog.hide()
    this.fontSize.hideFontBar()
    // 关闭黑色遮罩
    this.toggleDOM(this.$buttonMask, false)
  }
  // 基类方法：页面跳转后shell可刷新
  refreshShell (...args) {
    console.log('refreshShell')
    super.refreshShell(...args)
    this._closeEverything()
  }

  // todo 干什么的？
  unbindHeaderEvents () {
    super.unbindHeaderEvents()
    console.log('unbindHeaderEvents')
    // if (this.footEventHandler) {
    //     // LJ: 这里为什么还要调用一次？
    //     this.footEventHandler()
    //     this.footEventHandler = undefined
    // }
  }

  // 基类方法: 处理头部自定义按钮点击事件，由于没有按钮，置空
  handleShellCustomButton (buttonName) {
    // 如果后期需要增加bar按钮，增加如下配置：
    // "header": {
    //     "show": true,
    //     "title": "神武天帝",
    //     "buttonGroup": [
    //         {"name": "setting", "text": "设置"},
    //         {"name": "cancel", "text": "取消"}
    //     ]
    // }
  }

  // 基类方法：绑定头部弹层事件。
  bindHeaderEvents () {
    super.bindHeaderEvents()

    // let event = window.MIP.util.event

    // Delegate dropdown button
    // this.footEventHandler = event.delegate(this.$footerWrapper, '[mip-footer-btn]', 'click', function (e) {
    //   let buttonName = this.dataset.buttonName
    //   me.handleFooterButton(buttonName)
    // })
  }
}

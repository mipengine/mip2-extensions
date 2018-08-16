/**
 * file: 小说shell 底部控制栏
 * author: liangjiaying <jiaojiaomao220@163.com>
 */

import {settingHtml} from './setting'
// 整个底 bar 控制栏
class footer {
  constructor (config) {
    this.config = config
    this.$footerWrapper = this._render() // 底部包裹控制栏的mip-fixed元素
    // 禁止冒泡，防止从小说层，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
  }

  // 创建底部控制栏并插入页面
  _render (config) {
    // 获取 mip-shell-xiaoshuo 配置（通用，每个页面相同）
    if (config) {
      this.config = config
    }

    // 将底部 bar 插入到页面中
    let $footerWrapper = document.querySelector('.mip-shell-footer-wrapper')
    let hadFooter = !!$footerWrapper
    if (!hadFooter) {
      // 初次见面新建一个wrapper, 二次更新时直接复用
      $footerWrapper = document.createElement('mip-fixed')
      $footerWrapper.setAttribute('type', 'bottom')
      $footerWrapper.setAttribute('mip-shell', '')
      $footerWrapper.classList.add('mip-shell-footer-wrapper')
    }

    let $footer = document.createElement('div')
    $footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
    $footer.innerHTML = this._createFooterDom()
    if (!hadFooter) {
      $footerWrapper.appendChild($footer)
      document.body.appendChild($footerWrapper)
    } else {
      // 将footer内容替换为新内容
      $footerWrapper.removeChild($footerWrapper.querySelector('.mip-shell-footer'))
      $footerWrapper.appendChild($footer)
    }
    return $footerWrapper
  }

  // 根据config 创建底部footer
  _createFooterDom () {
    // currentPageMeta: 基类提供的配置，页面中用户在shell json配置的内容
    let renderFooterButtonGroup = actionGroup => actionGroup.map(function (actionConfig) {
      if (actionConfig.name === 'catalog') {
        // 目录按钮样式
        return `<div class="button click-cursor" on="click:xiaoshuo-shell.showShellCatalog"> <i class="icon icon-menulist"><p>${actionConfig.text}</p></i> </div>`
      } else if (actionConfig.name === 'darkmode') {
        // 夜间模式按钮
        return `<div class="button click-cursor" data-current-bg="default" data-hidden-bg="night">
          <span class="bg-button night-mode" on="click:xiaoshuo-shell.changeMode(night)" > <i class="icon icon-night"><p>${actionConfig.text}</p></i>  </span>
          <span class="bg-button light-mode click-cursor" on="click:xiaoshuo-shell.changeMode(default)" > <i class="icon icon-day"><p>${actionConfig.text2}</p></i> </span>
        </div>`
      } else if (actionConfig.name === 'settings') {
        // 字体大小按钮
        return `<div class="button click-cursor" on="click:xiaoshuo-shell.showFontAdjust"> <i class="icon icon-font"><p>${actionConfig.text}</p></i></div>`
      }
    }).join('')

    // 创建底部按钮 HTML
    let footerHTML = `
        <div class="upper mip-border mip-border-bottom">
            <a class="page-button page-previous" mip-link href="" replace>
                <i class="icon gap-right-small icon-left"></i>
                ${this.config.hrefButton.previous}
            </a>
            <a class="page-button page-next" mip-link href="" replace>
                ${this.config.hrefButton.next}
                <i class="icon gap-left-small icon-right"></i>
            </a>
        </div>
        <div class="button-wrapper">
            ${renderFooterButtonGroup(this.config.actionGroup)}
        </div>
        <div class="mip-xiaoshuo-settings">${settingHtml()}</div>
        `
    return footerHTML
  }

  /**
   * 修改footer 【上一页】【下一页】链接, 增加跳转链接及是否可以跳转
   *
   * @param {Object} conf 头部json-ld配置
   */
  updateDom (conf) {
    let previousHref = (conf['previousPage'] && conf['previousPage']['url']) || ''
    let nextHref = (conf['nextPage'] && conf['nextPage']['url']) || ''
    let previousButton = document.querySelector('.mip-shell-footer .page-previous')
    previousButton.setAttribute('href', previousHref)
    previousButton.classList.remove('disabled')
    if (!previousHref) previousButton.classList.add('disabled')

    let nextButton = document.querySelector('.mip-shell-footer .page-next')
    nextButton.setAttribute('href', nextHref)
    nextButton.classList.remove('disabled')
    if (!nextHref) nextButton.classList.add('disabled')
  }

  // 显示底bar
  show (shellElement) {
    let footer = this
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    // window.setTimeout(function () {
    footer.$footerWrapper.classList.add('show')
    if (shellElement) {
      shellElement.toggleDOM(shellElement.$buttonMask, true)
    }
    // }, 400)
  }
  // 隐藏底bar
  hide () {
    this.$footerWrapper.classList.remove('show')
  }
  // 禁止冒泡，防止从控制栏触发外层小说页面滚动
  _stopPropagation () {
    if (this.propagationStopped) {
      // 由于控制栏只有一个，刷新页面时只绑定一次
      return
    }
    // sidebar 绑定一次停止冒泡事件, 防止滚到底部后外层小说内容继续滚动
    this.$footerWrapper.addEventListener('scroll', (e) => {
      e && e.stopPropagation()
    })
    this.$footerWrapper.addEventListener('touchmove', (e) => {
      // 保证滑块可以滑动，不然其他区域出现滚动穿透的现象
      // TODO 但滑块区上下滚动还是会滚动穿透
      if (e.target.tagName !== 'INPUT') {
        e && e.stopPropagation()
        e && e.preventDefault()
        return false
      }
    })
    return true
  }
}

export default footer

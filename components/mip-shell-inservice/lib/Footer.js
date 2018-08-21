/**
 * @file 底部菜单栏导航
 * @author  duxiaonan@baidu.com (duxiaonan)
 */
export default class Footer {
  /**
   * 初始化ShellConfig配置信息
   *
   * @param {Object} shellConfig 继承MipShell config
   */
  initShellConfig (shellConfig) {
    this.shellConfig = shellConfig
  }

  /**
   * 初始化当前页面Meta配置信息
   *
   * @param {Object} currentPageMeta 当前页面配置信息
   */
  initCurrentPageMeta (currentPageMeta) {
    this.currentPageMeta = currentPageMeta
  }

  /**
   * 初始化源页面Meta配置信息
   *
   * @param {Object} sourcePageMeta 源页面配置信息
   */
  initSourcePageMeta (sourcePageMeta) {
    this.sourcePageMeta = sourcePageMeta
  }

  /**
   * 初始化目标页面Meta配置信息
   *
   * @param {Object} targetPageMeta 目标页面配置信息
   */
  initTargetPageMeta (targetPageMeta) {
    this.targetPageMeta = targetPageMeta
  }

  /**
   * 底部菜单栏初始化DOM
   */
  render () {
    let footerWrapper = document.createElement('mip-fixed')
    footerWrapper.setAttribute('type', 'bottom')
    footerWrapper.setAttribute('mip-shell', '')
    footerWrapper.classList.add('mip-shell-footer-wrapper')
    let footer = document.createElement('div')
    footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
    footer.innerHTML = this.renderFooterTemplate()
    footerWrapper.appendChild(footer)
    this.$footerWrapper = footerWrapper
    this.$footer = footer

    document.body.appendChild(footerWrapper)
  }

  /**
   * 底部菜单栏更新DOM
   */
  update () {
    let pageMeta = this.currentPageMeta
    let shellConfig = this.shellConfig
    let { borderColor, backgroundColor } = shellConfig.footer

    if (pageMeta.footer >= 0) {
      if (!this.$footerWrapper.innerHTML) {
        this.$footerWrapper.appendChild(this.$footer)
      }
      this.$footer.style.cssText = 'border-top: 1px solid ' + borderColor + ' !important'
      this.$footer.style.backgroundColor = backgroundColor
      this.renderFooter(pageMeta, shellConfig)
    } else {
      this.$footerWrapper.innerHTML = ''
    }
  }

  /**
   * 页面切换时底部菜单栏重新渲染
   */
  switchPage () {
    let pageMeta = this.targetPageMeta
    let shellConfig = this.shellConfig

    this.renderFooter(pageMeta, shellConfig)
  }

  /**
   * 状态更新时控制底部菜单栏样式
   *
   * @param {Object} pageMeta 页面Meta配置信息
   * @param {Object} shellConfig 继承MipShell config
   */
  renderFooter (pageMeta, shellConfig) {
    let { buttonGroup } = shellConfig.footer
    let pageMetaFooter = pageMeta.footer

    let renderFooterButtonGroup = buttonGroup => buttonGroup.map((buttonConfig, index) => {
      let clsActive = '.button.button-' + buttonConfig.name + '-active'
      let clsNegative = '.button.button-' + buttonConfig.name + '-negative'
      let buttonActive = this.$footer.querySelector(clsActive)
      let buttonNegative = this.$footer.querySelector(clsNegative)
      if (pageMetaFooter === index) {
        buttonActive.classList.add('button-show')
        buttonNegative.classList.remove('button-show')
      } else {
        buttonActive.classList.remove('button-show')
        buttonNegative.classList.add('button-show')
      }
    })

    renderFooterButtonGroup(buttonGroup)
  }

  /**
   * 初始化底部菜单栏
   */
  renderFooterTemplate () {
    let shellConfig = this.shellConfig
    let { color, buttonGroup } = shellConfig.footer

    let renderFooterButtonGroupTemplate = buttonGroup => this.renderFooterButtonGroup(buttonGroup, color).join('')

    return `
      <div class="button-wrapper">
        ${renderFooterButtonGroupTemplate(buttonGroup)}
      </div>
    `
  }

  /**
   * 状态初始化
   *
   * @param {Object} buttonGroup 底部菜单栏按钮组
   * @param {string} color 底部菜单栏主题色
   */
  renderFooterButtonGroup (buttonGroup, color) {
    return buttonGroup.map((buttonConfig) => {
      return `
            <div class="button button-${buttonConfig.name}-active button-show" style="color: ${color}" mip-footer-btn data-button-name="${buttonConfig.name}" data-button-link="${buttonConfig.link}">
              <mip-img width="24" height="24" src="${buttonConfig.iconActive}"></mip-img>
              ${buttonConfig.text}
            </div>
            <div class="button button-${buttonConfig.name}-negative button-show" mip-footer-btn data-button-name="${buttonConfig.name}" data-button-link="${buttonConfig.link}">
              <mip-img width="24" height="24" src="${buttonConfig.icon}"></mip-img>
              ${buttonConfig.text}
            </div>
          `
    })
  }

  /**
   * 绑定点击事件
   */
  bind () {
    let me = this
    let event = window.MIP.util.event

    // 代理底部菜单栏的点击事件
    this.footEventHandler = event.delegate(this.$footerWrapper, '[mip-footer-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      let buttonLink = this.dataset.buttonLink
      me.handleFooterButton(buttonName, buttonLink)
    })
  }

  /**
   * 解绑点击事件
   */
  unbind () {
    if (typeof this.footEventHandler === 'function') {
      this.footEventHandler()
      this.footEventHandler = undefined
    }
  }

  /**
   * 处理底部菜单栏button
   *
   * @param {string} buttonName 按钮名称
   * @param {string} buttonLink 跳转链接
   */
  handleFooterButton (buttonName, buttonLink) {
    // let serviceUrl = this.headerInfo.serviceUrl
    // TODO: 目标页面是MIP页面时底部菜单栏不显示
    window.MIP.viewer.open(buttonLink, {isMipLink: true, replace: false, cacheFirst: true})
  }
}

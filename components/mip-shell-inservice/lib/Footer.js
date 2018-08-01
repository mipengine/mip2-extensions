/*
*
*
*
* */

// 整个底 bar 控制栏
export default class Footer {
  initShellConfig (shellConfig) {
    this.shellConfig = shellConfig
  }

  initCurrentPageMeta (currentPageMeta) {
    this.currentPageMeta = currentPageMeta
  }

  initTargetPageMeta (targetPageMeta) {
    this.targetPageMeta = targetPageMeta
  }

  /**
   * 底部菜单栏导航
   */
  _render () {
    this.$footerWrapper = document.createElement('mip-fixed')
    this.$footerWrapper.setAttribute('type', 'bottom')
    this.$footerWrapper.setAttribute('mip-shell', '')
    this.$footerWrapper.classList.add('mip-shell-footer-wrapper')
    this.$footer = document.createElement('div')
    this.$footer.classList.add('mip-shell-footer', 'mip-border', 'mip-border-top')
    this.$footer.innerHTML = this.renderFooterTemplate()
    // this.renderFooter()
    this.$footerWrapper.appendChild(this.$footer)

    document.body.appendChild(this.$footerWrapper)
  }

  _update () {
    let pageMeta = this.currentPageMeta
    let shellConfig = this.shellConfig
    let { borderColor, backgroundColor } = shellConfig.footer

    if (!isNaN(pageMeta.footer)) {
      // this.$footer.innerHTML = this.renderFooterTemplate()
      this.$footer.style.cssText = 'border: 1px solid ' + borderColor + ' !important'
      this.$footer.style.backgroundColor = backgroundColor
      // this.$footerWrapper.appendChild(this.$footer)
      this.renderFooter(pageMeta, shellConfig)
    } else {
      this.$footerWrapper.innerHTML = ''
    }
  }

  _switchPage () {
    let pageMeta = this.targetPageMeta
    let shellConfig = this.shellConfig

    this.renderFooter(pageMeta, shellConfig)
  }

  renderFooter (pageMeta, shellConfig) {
    // let pageMeta = this.currentPageMeta
    // let shellConfig = this.shellConfig
    // let { color, buttonGroup } = shellConfig.footer
    // let pageMetaFooter = pageMeta.footer + '' || ''
    //
    // let renderFooterButtonGroup = buttonGroup => buttonGroup.map((buttonConfig, index) => {
    //   if (pageMetaFooter && pageMetaFooter === index + '') {
    //     return `
    //         <div class="button button-active" style="color: ${color}" mip-footer-btn data-button-name="${buttonConfig.name}" data-button-link="${buttonConfig.link}">
    //           <mip-img width="24" height="24" src="${buttonConfig.iconActive}"></mip-img>
    //           ${buttonConfig.text}
    //         </div>
    //       `
    //   } else {
    //     return `
    //         <div class="button" mip-footer-btn data-button-name="${buttonConfig.name}" data-button-link="${buttonConfig.link}">
    //           <mip-img width="24" height="24" src="${buttonConfig.icon}"></mip-img>
    //           ${buttonConfig.text}
    //         </div>
    //       `
    //   }
    // }).join('')
    //
    // let footerHTML = `
    //   <div class="button-wrapper">
    //     ${renderFooterButtonGroup(buttonGroup)}
    //   </div>
    // `
    //
    // return footerHTML

    // let pageMeta = this.currentPageMeta
    // let shellConfig = this.shellConfig
    let { buttonGroup } = shellConfig.footer
    let pageMetaFooter = pageMeta.footer + '' || ''

    let renderFooterButtonGroup = buttonGroup => buttonGroup.map((buttonConfig, index) => {
      // let clsActive = 'button button-' + buttonConfig.name + '-active'
      // let clsNegative = 'button button-' + buttonConfig.name + '-negative'
      // this.$buttonActive = document.getElementsByClassName(clsActive)[0]
      // this.$buttonNegative = document.getElementsByClassName(clsNegative)[0]
      let clsActive = '.button.button-' + buttonConfig.name + '-active'
      let clsNegative = '.button.button-' + buttonConfig.name + '-negative'
      this.$buttonActive = this.$footer.querySelector(clsActive)
      this.$buttonNegative = this.$footer.querySelector(clsNegative)
      if (pageMetaFooter && pageMetaFooter === index + '') {
        this.$buttonActive.classList.add('button-show')
        this.$buttonNegative.classList.remove('button-show')
      } else {
        this.$buttonActive.classList.remove('button-show')
        this.$buttonNegative.classList.add('button-show')
      }
    })

    renderFooterButtonGroup(buttonGroup)
  }

  renderFooterTemplate () {
    let shellConfig = this.shellConfig
    let { color, buttonGroup } = shellConfig.footer

    let renderFooterButtonGroupTemplate = buttonGroup => buttonGroup.map((buttonConfig) => {
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
    }).join('')

    let footerHTML = `
      <div class="button-wrapper">
        ${renderFooterButtonGroupTemplate(buttonGroup)}
      </div>
    `

    return footerHTML
  }

  _bind () {
    let me = this
    let event = window.MIP.util.event

    // 代理底部菜单栏的点击事件
    this.footEventHandler = event.delegate(this.$footerWrapper, '[mip-footer-btn]', 'click', function (e) {
      let buttonName = this.dataset.buttonName
      let buttonLink = this.dataset.buttonLink
      me.handleFooterButton(buttonName, buttonLink)
    })
  }

  _unbind () {
    if (this.footEventHandler) {
      this.footEventHandler()
      this.footEventHandler = undefined
    }
  }

  handleFooterButton (buttonName, buttonLink) {
    // let serviceUrl = this.headerInfo.serviceUrl
    // TODO: 目标页面是MIP页面时底部菜单栏不显示
    window.MIP.viewer.open(buttonLink, {isMipLink: true, replace: false})
  }

  _bindAll () {
    // // 初始化所有内置对象
    // // 创建模式切换（背景色切换）
    // // this.pageStyle = new PageStyle()
    // // const isRootPage = MIP.viewer.page.isRootPage
    // window.addEventListener('mipShellEvents', e => {
    //   let {type, data} = e.detail[0]
    //   console.log(type, data)
    //
    //   switch (type) {
    //     case 'updateShell':
    //
    //       break
    //     case 'slide':
    //
    //       break
    //     case 'togglePageMask':
    //
    //       break
    //     case 'toggleDropdown':
    //
    //       break
    //     case 'toggleTransition':
    //       this.shellToggle(data)
    //
    //       break
    //   }
    // })
  }

  shellToggle (data) {
    // console.log(data)
    // let isToggled = data.toggle

    // if(!isToggled){
    //   let nextpageMeta = data.nextpageMeta || {footer:3}
    //   //tod
    //   this.shellConfig.footer[nextpageMeta.footer]
    //
    // }else{
    //   //tod
    // }
  }
}

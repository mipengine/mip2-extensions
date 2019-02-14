/**
 * @file 菜单组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-nav-slidedown.less'

const { CustomElement, util } = MIP

/**
 * 按钮事件处理
 */
function navClickHandler () {
  if (window.innerWidth > 767) {
    return
  }

  let wiseNav = document.querySelector('#bs-navbar')

  // 关闭菜单
  if (wiseNav.classList.contains('in')) {
    util.css(wiseNav, 'height', '0')
    util.css(document.body, 'overflow', 'scroll')
    util.css(document.querySelector('.navbar-wise-close'), 'margin-top', '20px')
    document.body.classList.add('no-scroll')
    document.documentElement.classList.add('no-scroll')
    setTimeout(() => wiseNav.classList.remove('in'), 500)
  } else {
    // 打开菜单
    document.body.classList.add('no-scroll')
    document.documentElement.classList.add('no-scroll')
    setNavHeight('open')
    window.addEventListener('orientationchange', () => setTimeout(setNavHeight('resize'), 100))
    window.addEventListener('resize', setNavHeight('resize'))
  }

  /**
   * 重新定义列表高度
   *
   * @param {string} mode 下一步状态
   */
  function setNavHeight (mode) {
    if (mode === 'open') {
      wiseNav.classList.add('in')
    }

    if ((mode === 'resize' && wiseNav.classList.contains('in')) || mode === 'open') {
      let listNum = document.querySelectorAll('#bs-navbar li').length
      let offsetTop = document.querySelector('mip-nav-slidedown')
        ? document.querySelector('mip-nav-slidedown').getBoundingClientRect().top
        : 0
      let navHeight = window.innerHeight - document.querySelector('.navbar-header').clientHeight - offsetTop

      util.css(wiseNav, 'height', navHeight + 'px')

      // 关闭按钮距离底部固定为 90 px
      let closeBtnTop = navHeight - (document.querySelector('.navbar-right li').clientHeight) * listNum - 90
      closeBtnTop > 20
        ? util.css(document.querySelector('.navbar-wise-close'), 'margin-top', closeBtnTop + 'px')
        : util.css(document.querySelector('.navbar-wise-close'), 'margin-top', '20px')
    }
  }
}

export default class MipNavSlidedown extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    let element = this.element
    this.render()
    this.bindEvents()
    element.removeAttribute('style')
  }

  /**
   * 给菜单和关闭按钮绑定事件，clseBtn 点击 trigger
   */
  bindEvents () {
    let element = this.element
    let toggleBtn = element.querySelector('.navbar-header .navbar-toggle')
    let closeBtn = element.querySelector('#navbar-wise-close-btn')

    toggleBtn && toggleBtn.addEventListener('click', navClickHandler)

    if (closeBtn) {
      closeBtn.addEventListener('touchstart', () => element.classList.add('down'))
      closeBtn.addEventListener('mousedown', () => element.classList.add('down'))
      closeBtn.addEventListener('touchend', () => element.classList.remove('down'))
      closeBtn.addEventListener('mouseup', () => element.classList.remove('down'))
      closeBtn.addEventListener('click', navClickHandler)
      closeBtn.addEventListener('touchend', navClickHandler)
    }
  }

  /**
   * 渲染移动端头部以及按钮
   */
  render () {
    let element = this.element
    let id = element.getAttribute('data-id')
    let showBrand = !(element.getAttribute('data-showBrand') === '0')
    let brandName = element.getAttribute('data-brandName') || ''
    let brandHref = element.getAttribute('data-brandhref') || '#'
    let ulNav = element.querySelector('#' + id)
    let container = document.createElement('div')

    const ICON_BAR_HTML = `<span class="icon-bar"></span>`
    const btnWrap = `
      <div class="navbar-header">
        <button class="navbar-toggle collapsed" type="button" data-target="#${id}" aria-controls="${id}" aria-expanded="false">
          <span class="sr-only">导航</span>
          ${ICON_BAR_HTML}${ICON_BAR_HTML}${ICON_BAR_HTML}
        </button>
        ${showBrand ? '<a href=' + brandHref + ' class="navbar-brand">' + brandName + '</a>' : ''}
      </div>`

    container.appendChild(util.dom.create(btnWrap))
    container.appendChild(ulNav)
    element.appendChild(container)
    document.querySelector('.mip-nav-wrapper').classList.add('show')
  }
}

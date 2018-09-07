/**
 * @file 菜单 mip-nav-slidedown
 * @author liangjiaying tfciw
 * @time 2016.09
 * @transfer 2018.08
 */
import './mip-nav-slidedown.less'
const { CustomElement, util } = MIP
export default class MipNavSlidedown extends CustomElement {
  constructor (...args) {
    super(...args)
    this.render()
    this.bindEvents()
    this.element.removeAttribute('style')
  }

  /**
   * 渲染移动端头部以及按钮
   */
  render () {
    const id = this.element.getAttribute('data-id')
    const showBrand = !(this.element.getAttribute('data-showBrand') === 0)
    const brandName = this.element.getAttribute('data-brandName') || ''
    const brandHref = this.element.getAttribute('data-brandhref') || '#'
    const ulNav = this.element.querySelector('#' + id)
    let container = document.createElement('div')
    const btnWrap =
      `
      <div class="navbar-header">
        <button class="navbar-toggle collapsed" type="button" data-target="#${id}" aria-controls="${id}" aria-expanded="false">
          <span class="sr-only">导航</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        ${showBrand ? '<a href=' + brandHref + ' class="navbar-brand">' + brandName + '</a>' : ''}
      </div>
    `
    container.appendChild(util.dom.create(btnWrap))
    container.appendChild(ulNav)
    this.element.appendChild(container)
    document.querySelector('.mip-nav-wrapper').classList.add('show')
  }

  /**
   * 给菜单和关闭按钮绑定事件，mip1引用了zepto，clseBtn点击trigger
   */
  bindEvents () {
    this.element.querySelector('.navbar-header .navbar-toggle').addEventListener('click', this.navClickHandler, false)
    let $closeBtn = this.element.querySelector('#navbar-wise-close-btn')
    if ($closeBtn.length > 0) {
      this.addHoverClass($closeBtn)
      $closeBtn.addEventListener('click', this.navClickHandler, false)
      $closeBtn.addEventListener('touchend', this.navClickHandler, false)
    }
  }

  /**
   * 按钮事件处理
   */
  navClickHandler () {
    if (window.innerWidth > 767) {
      return
    }
    let $wiseNav = document.querySelector('#bs-navbar')
    // 关闭菜单
    if ($wiseNav.classList.contains('in')) {
      util.css($wiseNav, 'height', '0px')
      util.css(document.body, 'overflow', 'scroll')
      util.css(document.querySelector('.navbar-wise-close'), 'margin-top', '20px')
      document.body.classList.add('no-scroll')
      document.documentElement.classList.add('no-scroll')
      setTimeout(() => {
        $wiseNav.classList.remove('in')
      }, 500)
    } else {
      // 打开菜单
      document.body.classList.add('no-scroll')
      document.documentElement.classList.add('no-scroll')
      setNavHeight('open')
      window.addEventListener('orientationchange', () => {
        setTimeout(setNavHeight('resize'), 100) // hack: orientationchange 取window高度不及时
      })
      window.addEventListener('resize', setNavHeight('resize'))
    }

    /**
     * 重新定义列表高度
     *
     * @param {string} mode 下一步状态
     */
    function setNavHeight (mode) {
      if (mode === 'open') {
        $wiseNav.classList.add('in')
      }

      if ((mode === 'resize' && $wiseNav.classList.contains('in')) || mode === 'open') {
        let listNum = document.querySelectorAll('#bs-navbar li').length
        let offsetTop = document.querySelector('mip-nav-slidedown') ? document.querySelector('mip-nav-slidedown').getBoundingClientRect().top : 0
        let navHeight = window.innerHeight - document.querySelector('.navbar-header').clientHeight - offsetTop
        util.css($wiseNav, 'height', navHeight + 'px')
        // 关闭按钮距离底部固定为90px
        let closeBtnTop = navHeight - (document.querySelector('.navbar-right li').clientHeight) * listNum - 90
        if (closeBtnTop > 20) {
          util.css(document.querySelector('.navbar-wise-close'), 'margin-top', closeBtnTop + 'px')
        } else {
          util.css(document.querySelector('.navbar-wise-close'), 'margin-top', '20px')
        }
      }
    }
  }

  /**
   * 监听事件，按钮添加类，修改状态
   *
   * @param {HTMLElement} $dom dom节点
   */
  addHoverClass ($dom) {
    $dom.addEventListener('touchstart', () => {
      this.element.classList.add('down')
    })
    $dom.addEventListener('mousedown', () => {
      this.element.classList.add('down')
    })
    $dom.addEventListener('touchend', () => {
      this.element.classList.remove('down')
    })
    $dom.addEventListener('mouseup', () => {
      this.element.classList.remove('down')
    })
  }
}

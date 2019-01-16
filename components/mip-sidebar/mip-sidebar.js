import './mip-sidebar.less'

let {
  CustomElement,
  util
} = MIP

const ANIMATION_TIMEOUT = 300

export default class MIPSidebar extends CustomElement {
  constructor (...args) {
    super(...args)
    // 限制 side 属性是 left 或者 right
    this.side = this.element.getAttribute('side')
    if (this.side !== 'left' && this.side !== 'right') {
      this.side = 'left'
      this.element.setAttribute('side', this.side)
    }

    this.isOpen = false
    this.running = false
    this.bodyOverflow = 'hidden'
    this.mask = null
  }

  toggle (e) {
    this.isOpen ? this.close(e) : this.open()
  }

  /**
   * 打开 sidebar 和 mask
   */
  open () {
    if (this.isOpen) {
      return
    }
    this.isOpen = true
    util.css(this.element, {display: 'block'})
    util.css(this.mask, {display: 'block'})

    setTimeout(() => {
      this.element.classList.add('show')
      this.mask.classList.add('show')
    }, 0)

    setTimeout(() => {
      this.running = true
    }, ANIMATION_TIMEOUT)

    this.bodyOverflow = getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    this.element.setAttribute('aria-hidden', 'false')
  }

  /**
   * 关闭 sidebar 和 mask
   *
   * @param {Object} e 点击事件
   */
  close (e) {
    e.preventDefault()
    if (!this.running) {
      return
    }

    this.running = false

    this.element.classList.remove('show')
    this.mask.classList.remove('show')

    setTimeout(() => {
      this.isOpen = false
      util.css(this.element, {display: 'none'})
      util.css(this.mask, {display: 'none'})
    }, ANIMATION_TIMEOUT)

    document.body.style.overflow = this.bodyOverflow
    this.element.setAttribute('aria-hidden', 'true')
  }

  build () {
    let el = this.element
    if (!this.isOpen) {
      el.setAttribute('aria-hidden', 'true')
    }

    this.mask = document.createElement('div')
    this.mask.className = 'mip-sidebar-mask'
    el.parentNode.appendChild(this.mask)

    document.addEventListener('keydown', e => {
      if (e.keyCode === 27) {
        this.close(e)
      }
    }, false)
    this.mask.addEventListener('touchmove', e => {
      e.preventDefault()
    }, false)
    this.mask.addEventListener('click', e => {
      this.close(e)
    })
    this.addEventAction('toggle', e => {
      this.toggle(e)
    })
    this.addEventAction('open', () => {
      this.open()
    })
    this.addEventAction('close', e => {
      this.close(e)
    })
  }
}

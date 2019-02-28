import './mip-sidebar.less'

const { CustomElement, util } = MIP

const ANIMATION_TIMEOUT = 300

export default class MIPSidebar extends CustomElement {
  constructor (...args) {
    super(...args)
    this.side = 'left'
    this.isOpen = false
    this.running = false
    this.bodyOverflow = 'hidden'
    this.mask = null
  }

  connectedCallback () {
    this.side = this.element.getAttribute('side')
    // side 必须是 left 或者 right，默认是 left
    if (this.side !== 'left' && this.side !== 'right') {
      this.side = 'left'
      this.element.setAttribute('side', this.side)
    }
  }

  toggle (e) {
    this.isOpen ? this.close(e) : this.open()
  }

  /**
   * 打开 sidebar 和 mask
   */
  open () {
    let el = this.element
    let mask = this.mask

    if (this.isOpen) {
      return
    }
    this.isOpen = true

    util.css(el, { display: 'block' })
    util.css(mask, { display: 'block' })

    // 触发重绘，Android UC 等浏览器需要
    this.mask.getBoundingClientRect()

    setTimeout(() => {
      el.classList.add('show')
      mask.classList.add('show')
    }, 0)

    setTimeout(() => {
      this.running = true
    }, ANIMATION_TIMEOUT)

    this.bodyOverflow = getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    el.setAttribute('aria-hidden', 'false')
  }

  /**
   * 关闭 sidebar 和 mask
   *
   * @param {Object} e 点击事件
   */
  close (e) {
    let el = this.element
    let mask = this.mask

    e.preventDefault()
    if (!this.running) {
      return
    }
    this.running = false

    el.classList.remove('show')
    mask.classList.remove('show')

    setTimeout(() => {
      this.isOpen = false
      util.css(el, { display: 'none' })
      util.css(mask, { display: 'none' })
    }, ANIMATION_TIMEOUT)

    document.body.style.overflow = this.bodyOverflow
    el.setAttribute('aria-hidden', 'true')
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
    this.mask.addEventListener('click', this.close.bind(this))
    this.addEventAction('toggle', this.toggle.bind(this))
    this.addEventAction('open', this.open.bind(this))
    this.addEventAction('close', this.close.bind(this))
  }
}

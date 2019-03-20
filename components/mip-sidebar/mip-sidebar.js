import './mip-sidebar.less'

const {CustomElement, Services, util} = MIP

const TRANSITION_TIMEOUT = 300

export default class MIPSidebar extends CustomElement {
  static get observedAttributes () {
    return ['open']
  }

  constructor (...args) {
    super(...args)
    this.inTransition = false
    this.bodyOverflow = 'hidden'
    this.mask = null
    this.handleToggle = this.handleToggle.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.timer = Services.timer()
  }

  build () {
    /** @type {!HTMLElement} */
    const element = this.element

    if (this.isOpen()) {
      this.open()
    } else {
      element.setAttribute('aria-hidden', 'true')
    }

    this.mask = document.createElement('div')
    this.mask.classList.add('mip-sidebar-mask')
    element.parentElement.appendChild(this.mask)

    document.addEventListener('keydown', event => event.keyCode === 27 && this.handleClose())
    this.mask.addEventListener('touchmove', event => event.preventDefault())
    this.mask.addEventListener('click', this.handleClose)
    this.addEventAction('toggle', this.handleToggle)
    this.addEventAction('open', this.handleOpen)
    this.addEventAction('close', this.handleClose)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'open') {
      this.isOpen() ? this.open() : this.close()
    }
  }

  handleToggle () {
    this.isOpen() ? this.handleClose() : this.handleOpen()
  }

  handleOpen () {
    this.inTransition || this.element.setAttribute('open', '')
  }

  handleClose () {
    this.inTransition || this.element.removeAttribute('open')
  }

  async transition () {
    this.inTransition = true
    await this.timer.sleep(TRANSITION_TIMEOUT)
    this.inTransition = false
  }

  isOpen () {
    return this.props.open
  }

  open () {
    /** @type {!HTMLElement} */
    const element = this.element
    const mask = this.mask

    util.css(element, { display: 'block' })
    util.css(mask, { display: 'block' })

    // 触发重绘，Android UC 等浏览器需要
    this.mask.getBoundingClientRect()

    this.timer.delay(() => {
      element.classList.add('show')
      mask.classList.add('show')
    })

    this.transition()

    this.bodyOverflow = getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    element.setAttribute('aria-hidden', 'false')
  }

  close () {
    /** @type {!HTMLElement} */
    const element = this.element
    const mask = this.mask

    element.classList.remove('show')
    mask.classList.remove('show')

    this.transition().then(() => {
      util.css(element, { display: 'none' })
      util.css(mask, { display: 'none' })
    })

    document.body.style.overflow = this.bodyOverflow
    element.setAttribute('aria-hidden', 'true')
  }
}

MIPSidebar.props = {
  side: {
    type: String,
    default: 'left'
  },
  open: Boolean
}

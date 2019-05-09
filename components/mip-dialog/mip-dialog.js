import './mip-dialog.less'

const {CustomElement, util: {string: {camelize, hyphenate}}, viewer} = MIP

const TAG = 'mip-dialog'

const KEYCODES = {
  TAB: 9,
  ESC: 27
}

const reactiveProps = {
  type: {
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  mask: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  forceRender: {
    type: Boolean,
    default: false
  }
}

export default class MIPDialog extends CustomElement {
  static get observedAttributes () {
    return Object.keys(reactiveProps).map(hyphenate)
  }

  constructor (element) {
    super(element)

    /** @type {Record<string, HTMLElement>} */
    this.elements = null

    /** @type {Record<string, HTMLTemplateElement} */
    this.slots = null

    this.cx = this.cx.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleMaskClick = this.handleMaskClick.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  connectedCallback () {
    this.connect()
  }

  buildCallback () {
    this.render()
  }

  disconnectedCallback () {
    this.disconnect()
  }

  cx (suffix) {
    if (Array.isArray(suffix)) {
      return suffix.map(this.cx).join(' ')
    }

    if (typeof suffix === 'object' && suffix !== null) {
      return this.cx(Object.keys(suffix).filter(key => suffix[key]).map(hyphenate))
    }

    const {type} = this.props
    const prefix = type ? `mip-${type}-dialog` : TAG

    return suffix ? `${prefix}-${suffix}` : prefix
  }

  toggleMask () {
    const {$container} = this.elements

    $container.classList.toggle(this.cx('mask'))
  }

  toggleDialog () {
    const {mask} = this.props
    const {$container} = this.elements

    mask && this.toggleMask()
    $container.classList.toggle(this.cx('container-hidden'))
  }

  handleVisibleChange () {
    this.elements ? this.toggleDialog() : this.render()
  }

  handleMaskChange () {
    const {visible} = this.props

    this.elements && visible && this.toggleMask()
  }

  handleKeyboardChange () {
    const {keyboard} = this.props

    keyboard ? this.bindKeyboardEvents() : this.unbindKeyboardEvents()
  }

  /**
   * @param {Event} event object.
   */
  handleOk (event) {
    viewer.eventAction.execute('ok', this.element, event)
  }

  /**
   * @param {Event} event object.
   */
  handleCancel (event) {
    viewer.eventAction.execute('cancel', this.element, event)
  }

  /**
   * @param {MouseEvent} event object.
   */
  handleMaskClick (event) {
    const {target, currentTarget} = event
    const {maskClosable} = this.props

    target === currentTarget && maskClosable && this.handleCancel(event)
  }

  /**
   * @param {KeyboardEvent} event object.
   */
  handleKeyDown (event) {
    const {keyboard, visible} = this.props

    if (!visible) {
      return
    }

    if (keyboard && event.keyCode === KEYCODES.ESC) {
      event.stopPropagation()
      this.handleCancel(event)
    }
  }

  bindEvents () {
    const {$okButton, $cancelButton, $container} = this.elements

    $okButton && $okButton.addEventListener('click', this.handleOk)
    $cancelButton && $cancelButton.addEventListener('click', this.handleCancel)
    $container && $container.addEventListener('click', this.handleMaskClick)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  connect () {
    if (!this.elements) {
      return
    }

    const {$portal} = this.elements

    document.body.appendChild($portal)
  }

  disconnect () {
    if (!this.elements) {
      return
    }

    const {$portal} = this.elements

    document.body.removeChild($portal)
  }

  renderMask () {
    const {mask} = this.props

    if (!mask) {
      return ''
    }

    return `<div class="${this.cx('mask')}"></div>`
  }

  renderSlot (name) {
    const {[`${name}$`]: slot} = this.slots

    if (!slot) {
      return ''
    }

    return `<div class="${this.cx(name)}">${slot}</div>`
  }

  render () {
    const {visible, mask, forceRender} = this.props

    if (!visible && !forceRender) {
      return
    }

    this.slots = [...this.element.querySelectorAll('template[slot]')].reduce((slots, element) => ({
      ...slots,
      [`${element.getAttribute('slot')}$`]: element.innerHTML
    }), {})
    const $portal = document.createElement('div')

    const template =
      `<div class="${this.cx(['container', {containerHidden: !visible, mask}])}">` +
        `<div class="${this.cx()}">` +
          `<div class="${this.cx('content')}">` +
            this.renderSlot('header') +
            this.renderSlot('body') +
            this.renderSlot('footer') +
          '</div>' +
        '</div>' +
      '</div>'

    $portal.innerHTML = template

    this.elements = template.match(/mip-[a-z-]*?dialog-[a-z-]*/g)
      .reduce((elements, className) => ({
        ...elements,
        [`$${camelize(className.match(/dialog-([a-z-]+)$/)[1])}`]: $portal.querySelector(`.${className}`)
      }), {$portal})

    this.bindEvents()
    this.connect()
  }
}

MIPDialog.props = {
  ...reactiveProps,
  keyboard: {
    type: Boolean,
    default: true
  }
}

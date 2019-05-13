import './mip-dialog.less'

const {CustomElement, util: {string: {hyphenate}}, viewer} = MIP

const TAG = 'mip-dialog'

const KEYCODES = {
  TAB: 9,
  ESC: 27
}

export default class MIPDialog extends CustomElement {
  static props = {
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
    keyboard: {
      type: Boolean,
      default: true
    },
    forceRender: {
      type: Boolean,
      default: false
    }
  }

  static get observedAttributes () {
    return Object.keys(MIPDialog.props).map(hyphenate)
  }

  constructor (element) {
    super(element)

    /** @type {Record<string, HTMLElement>} */
    this.refs = null

    /** @type {Record<string, HTMLTemplateElement} */
    this.slots = null
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

  cx = (suffix) => {
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
    const {$container} = this.refs

    $container.classList.toggle(this.cx('mask'))
  }

  toggleDialog () {
    const {mask} = this.props
    const {$container} = this.refs

    mask && this.toggleMask()
    $container.classList.toggle(this.cx('container-hidden'))
  }

  handleVisibleChange () {
    this.refs ? this.toggleDialog() : this.render()
  }

  handleMaskChange () {
    const {visible} = this.props

    this.refs && visible && this.toggleMask()
  }

  /**
   * @param {Event} event object.
   */
  handleOk = (event) => {
    viewer.eventAction.execute('ok', this.element, event)
  }

  /**
   * @param {Event} event object.
   */
  handleCancel = (event) => {
    viewer.eventAction.execute('cancel', this.element, event)
  }

  /**
   * @param {MouseEvent} event object.
   */
  handleMaskClick = (event) => {
    const {target, currentTarget} = event
    const {maskClosable} = this.props

    target === currentTarget && maskClosable && this.handleCancel(event)
  }

  /**
   * @param {KeyboardEvent} event object.
   */
  handleKeyDown = (event) => {
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
    const {$container, $okButton, $cancelButton} = this.refs

    $container && $container.addEventListener('click', this.handleMaskClick)
    $okButton && $okButton.addEventListener('click', this.handleOk)
    $cancelButton && $cancelButton.addEventListener('click', this.handleCancel)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  connect () {
    if (!this.refs) {
      return
    }

    const {$portal} = this.refs

    document.body.appendChild($portal)
  }

  disconnect () {
    if (!this.refs) {
      return
    }

    const {$portal} = this.refs

    document.body.removeChild($portal)
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

    this.slots = [...this.element.querySelectorAll('template[slot]')]
      .reduce((slots, element) => ({
        ...slots,
        [`${element.getAttribute('slot')}$`]: element.innerHTML
      }), {})

    const $portal = document.createElement('div')

    const template =
      `<div ref="container" class="${this.cx(['container', {containerHidden: !visible, mask}])}">` +
        `<div class="${this.cx()}">` +
          `<div class="${this.cx('content')}">` +
            this.renderSlot('header') +
            this.renderSlot('body') +
            this.renderSlot('footer') +
          '</div>' +
        '</div>' +
      '</div>'

    $portal.innerHTML = template

    this.refs = [...$portal.querySelectorAll('[ref]')]
      .reduce((refs, element) => ({
        ...refs,
        [`$${element.getAttribute('ref')}`]: element
      }), {$portal})

    this.bindEvents()
    this.connect()
  }
}

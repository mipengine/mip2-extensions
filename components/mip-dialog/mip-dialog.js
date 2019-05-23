import './mip-dialog.less'

const {CustomElement, templates, util: {fn: {memoize}, string: {hyphenate}}, viewer} = MIP

const TAG = 'mip-dialog'

const SLOTS = ['header', 'body', 'footer']

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

    this.openTime = Date.now()
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

  cx = memoize((suffix) => {
    if (Array.isArray(suffix)) {
      return suffix.map(this.cx).join(' ')
    }

    if (typeof suffix === 'object' && suffix !== null) {
      return this.cx(Object.keys(suffix).filter(key => suffix[key]).map(hyphenate))
    }

    const {type} = this.props
    const prefix = type ? `mip-${type}-dialog` : TAG

    return suffix ? `${prefix}-${suffix}` : prefix
  })

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
    const {visible} = this.props

    if (visible) {
      this.openTime = Date.now()
    }

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
    const {$okButton} = this.refs

    if (event.target !== $okButton) {
      return
    }

    viewer.eventAction.execute('ok', this.element, event)
  }

  /**
   * @param {Event} event object.
   */
  handleCancel = (event) => {
    const {target} = event
    const {maskClosable} = this.props
    const {$container, $cancelButton} = this.refs

    if ((target !== $container || !maskClosable || Date.now() - this.openTime < 300) && target !== $cancelButton) {
      return
    }

    viewer.eventAction.execute('cancel', this.element, event)
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
    const {$container} = this.refs

    $container.addEventListener('click', this.handleOk)
    $container.addEventListener('click', this.handleCancel)
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

  getSlotContainer = name => `<div ref="${name}" class="${this.cx(name)}"></div>`

  renderSlot = async (name) => {
    const {[`$${name}`]: container} = this.refs
    const {[`${name}$`]: slot} = this.slots

    if (!container || !slot) {
      return
    }

    container.innerHTML = slot.getAttribute('type') === 'mip-mustache'
      ? await templates.render(slot, slot.scope)
      : slot.innerHTML

    container.querySelectorAll('[ref]').forEach((element) => {
      this.refs[`$${element.getAttribute('ref')}`] = element
    })
  }

  renderSlots () {
    return Promise.all(SLOTS.map(this.renderSlot))
  }

  async render () {
    const {visible, mask, forceRender} = this.props

    if (!visible && !forceRender) {
      return
    }

    this.slots = [...this.element.querySelectorAll('template[slot]')]
      .reduce((slots, element) => ({
        ...slots,
        [`${element.getAttribute('slot')}$`]: element
      }), {})

    Object.keys(this.slots).forEach(name => Object.defineProperty(this.slots[name], 'scope', {
      get () {},
      set () {
        this.renderSlot(name)
      }
    }))

    const $portal = document.createElement('div')

    const template =
      `<div ref="container" class="${this.cx(['container', {containerHidden: !visible, mask}])}">` +
        `<div class="${this.cx()}">` +
          `<div class="${this.cx('content')}">` +
            SLOTS.map(this.getSlotContainer).join('') +
          '</div>' +
        '</div>' +
      '</div>'

    $portal.innerHTML = template

    this.refs = [...$portal.querySelectorAll('[ref]')]
      .reduce((refs, element) => ({
        ...refs,
        [`$${element.getAttribute('ref')}`]: element
      }), {$portal})

    await this.renderSlots()

    this.bindEvents()
    this.connect()
  }
}

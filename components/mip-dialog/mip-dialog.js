import './mip-dialog.less'

const {CustomElement, templates, util: {fn: {memoize}, string: {hyphenate}}, viewer} = MIP

const TAG = 'mip-dialog'

const SLOTS = ['header', 'body', 'footer']

const KeyCodes = {
  TAB: 9,
  ESC: 27
}

const ClassNames = {
  CONTAINER: 'container',
  HIDDEN: 'hidden',
  MASK: 'mask',
  CONTENT: 'content'
}

export default class MIPDialog extends CustomElement {
  static props = {
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

  /** @type {Record<string, HTMLElement>} */
  refs = null

  /** @type {Record<string, HTMLTemplateElement} */
  slots = null

  openTime = Date.now()

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

    return suffix ? `${TAG}-${suffix}` : TAG
  })

  toggleMask () {
    const {$container} = this.refs

    $container.classList.toggle(this.cx(ClassNames.MASK))
  }

  toggleDialog () {
    const {mask} = this.props
    const {$container} = this.refs

    mask && this.toggleMask()
    $container.classList.toggle(this.cx(ClassNames.HIDDEN))
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

  triggerOk (event) {
    viewer.eventAction.execute('ok', this.element, event)
  }

  triggerCancel (event) {
    viewer.eventAction.execute('cancel', this.element, event)
  }

  /**
   * @param {Event} event object.
   */
  handleOk = (event) => {
    const {target} = event
    const {$okButton} = this.refs

    if (!$okButton || !$okButton.contains(target)) {
      return
    }

    this.triggerOk(event)
  }

  /**
   * @param {Event} event object.
   */
  handleCancel = (event) => {
    const {target} = event
    const {maskClosable} = this.props
    const {$container, $cancelButton} = this.refs

    if (
      (target !== $container || !maskClosable || Date.now() - this.openTime < 300) &&
      (!$cancelButton || !$cancelButton.contains(target))
    ) {
      return
    }

    this.triggerCancel(event)
  }

  /**
   * @param {KeyboardEvent} event object.
   */
  handleKeyDown = (event) => {
    const {keyboard, visible} = this.props

    if (!visible) {
      return
    }

    if (keyboard && event.keyCode === KeyCodes.ESC) {
      event.stopPropagation()
      this.triggerCancel(event)
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
    if (!this.refs) {
      return
    }

    const {[`$${name}`]: container} = this.refs
    const {[`${name}$`]: slot} = this.slots

    if (!container) {
      return
    }

    if (!slot) {
      container.classList.add(this.cx(ClassNames.HIDDEN))

      return
    }

    container.innerHTML = slot.getAttribute('type') === 'mip-mustache'
      ? await templates.render(slot, slot.scope)
      : slot.innerHTML

    if (!container.innerHTML) {
      container.classList.add(this.cx(ClassNames.HIDDEN))

      return
    }

    container.classList.remove(this.cx(ClassNames.HIDDEN))

    container.querySelectorAll('[ref]').forEach((element) => {
      this.refs[`$${element.getAttribute('ref')}`] = element
    })
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

    const $portal = document.createElement('div')

    const template =
      `<div ref="container" class="${this.cx([
        ClassNames.CONTAINER,
        {[ClassNames.HIDDEN]: !visible, [ClassNames.MASK]: mask}
      ])}">` +
        `<div class="${this.cx()}">` +
          `<div class="${this.cx(ClassNames.CONTENT)}">` +
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

    await Promise.all(SLOTS.map(this.renderSlot))

    this.bindEvents()
    this.connect()
  }
}

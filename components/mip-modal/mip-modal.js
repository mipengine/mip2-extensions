import MIPModalService from './services/mip-modal'

import './mip-modal.less'

const {CustomElement, registerService, util: {string: {hyphenate}}} = MIP

const TAG = 'mip-modal'
const CLASSNAME_PREFIX = `${TAG}-dialog`
const SLOTS = ['header', 'body', 'footer']

/**
 * @param {string} suffix of class name.
 */
const cx = suffix => `${CLASSNAME_PREFIX}-${suffix}`

const propagatedProps = {
  visible: Boolean,
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
  }
}

const ATTRIBUTES_TO_PROPAGATE = Object.keys(propagatedProps).map(hyphenate)

const defaultSlots = {
  header: `<div class="${cx('title')}">{{title}}</div>`,
  body: '{{content}}',
  footer:
    `<div class="${cx('buttons')}">` +
      `<button ref="okButton" type="button" class="${cx('button')} ${cx('button-primary')} ${cx('ok-button')}">` +
        `<span class="${cx('button-text')}">{{okText}}</span>` +
      '</button>' +
      `<button ref="cancelButton" type="button" class="${cx('button')} ${cx('cancel-button')}">` +
        `<span class="${cx('button-text')}">{{cancelText}}</span>` +
      '</button>' +
    '</div>'
}

export default class MIPModal extends CustomElement {
  static props = {
    ...propagatedProps,
    title: {
      default: ''
    },
    content: {
      default: ''
    },
    okText: {
      default: '确定'
    },
    cancelText: {
      default: '取消'
    }
  }

  static get observedAttributes () {
    return Object.keys(MIPModal.props).map(hyphenate)
  }

  /** @type {Record<string, HTMLElement>} */
  refs = null

  /** @type {Record<string, HTMLTemplateElement>} */
  slots = {}

  buildCallback () {
    this.render()
  }

  attributeChangedCallback (name) {
    if (!this.element.isBuilt()) {
      return
    }

    ATTRIBUTES_TO_PROPAGATE.includes(name) && this.propagateAttribute(name)
    SLOTS.forEach(this.propagateSlotScope)
  }

  /**
   * @param {string} attrName of current element.
   */
  propagateAttribute = (attrName) => {
    const {$dialog} = this.refs

    if (!this.element.hasAttribute(attrName)) {
      $dialog.removeAttribute(attrName)

      return
    }

    $dialog.setAttribute(attrName, this.element.getAttribute(attrName))
  }

  /**
   * @param {string[]} attributes to propagate.
   */
  propagateAttributes (attributes) {
    attributes.forEach(this.propagateAttribute)
  }

  /**
   * @param {string} name of slot.
   * @param {string} html template of slot
   */
  propagateSlotIfAbsent (name, html = defaultSlots[name]) {
    const {$dialog} = this.refs
    const slotKey = `${name}$`

    this.slots[slotKey] = $dialog.querySelector(`template[slot="${name}"]`)

    if (this.slots[slotKey]) {
      return
    }

    const template = document.createElement('template')

    template.setAttribute('type', 'mip-mustache')
    template.setAttribute('slot', name)
    template.innerHTML = html

    this.slots[slotKey] = template

    $dialog.appendChild(template)
  }

  propagateSlotScope = (name) => {
    const {$dialog} = this.refs
    const {[`${name}$`]: slot} = this.slots

    slot.scope = this.props
    $dialog.customElement.renderSlot(name)
  }

  propagateSlot = (name) => {
    this.propagateSlotIfAbsent(name)
    this.propagateSlotScope(name)
  }

  render () {
    const {innerHTML} = this.element
    const $dialog = document.createElement('mip-dialog')

    this.element.innerHTML = ''
    $dialog.innerHTML = innerHTML

    this.refs = {$dialog}

    this.propagateAttributes(ATTRIBUTES_TO_PROPAGATE)

    SLOTS.forEach(this.propagateSlot)

    this.refs = [...$dialog.querySelectorAll('[ref]')]
      .reduce((refs, element) => ({
        ...refs,
        [`$${element.getAttribute('ref')}`]: element
      }), this.refs)

    this.element.appendChild($dialog)
  }
}

registerService(TAG, MIPModalService)

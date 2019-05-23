import MIPModalService from './services/mip-modal'

import './mip-modal.less'

const {CustomElement, registerService, util: {string: {hyphenate}}} = MIP

const TAG = 'mip-modal'
const CLASSNAME_PREFIX = `${TAG}-dialog`

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

  constructor (element) {
    super(element)

    /** @type {Record<string, HTMLElement>} */
    this.refs = null

    /** @type {Record<string, HTMLTemplateElement} */
    this.slots = null
  }

  buildCallback () {
    this.render()
  }

  attributeChangedCallback (name) {
    if (!this.element.isBuilt()) {
      return
    }

    const {$dialog} = this.refs

    ATTRIBUTES_TO_PROPAGATE.includes(name) && this.propagateAttribute($dialog, name)
    Object.values(this.slots).forEach(this.propagateSlotScope)
  }

  /**
   * @param {HTMLElement} target element to propagate.
   * @param {string} attrName of current element.
   */
  propagateAttribute = (target, attrName) => {
    if (!this.element.hasAttribute(attrName)) {
      target.removeAttribute(attrName)

      return
    }

    target.setAttribute(attrName, this.element.getAttribute(attrName))
  }

  /**
   * @param {HTMLElement} target element to propagate.
   * @param {string[]} attributes to propagate.
   */
  propagateAttributes (target, attributes) {
    attributes.forEach(this.propagateAttribute.bind(this, target))
  }

  /**
   * @param {HTMLElement} target element to propagate.
   * @param {string} name of slot.
   * @param {string} html template of slot
   */
  propagateSlotIfAbsent (target, name, html = defaultSlots[name]) {
    if (target.querySelector(`template[slot="${name}"]`)) {
      return
    }

    const template = document.createElement('template')

    template.setAttribute('type', 'mip-mustache')
    template.setAttribute('slot', name)
    template.innerHTML = html

    target.appendChild(template)
  }

  propagateSlotScope = (target) => {
    target.scope = this.props
  }

  render () {
    const {innerHTML} = this.element
    const $dialog = document.createElement('mip-dialog')

    this.element.innerHTML = ''
    $dialog.setAttribute('type', 'modal')
    $dialog.innerHTML = innerHTML

    this.propagateAttributes($dialog, ATTRIBUTES_TO_PROPAGATE)

    this.propagateSlotIfAbsent($dialog, 'header')
    this.propagateSlotIfAbsent($dialog, 'body')
    this.propagateSlotIfAbsent($dialog, 'footer')

    this.refs = [...$dialog.querySelectorAll('[ref]')]
      .reduce((refs, element) => ({
        ...refs,
        [`$${element.getAttribute('ref')}`]: element
      }), {$dialog})

    this.slots = [...$dialog.querySelectorAll('template[slot]')]
      .reduce((slots, element) => ({
        ...slots,
        [`${element.getAttribute('slot')}$`]: element
      }), {})

    Object.values(this.slots).forEach(this.propagateSlotScope)

    this.element.appendChild($dialog)
  }
}

registerService(TAG, MIPModalService)

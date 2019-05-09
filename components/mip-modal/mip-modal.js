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
  okText: {
    default: '确定'
  },
  cancelText: {
    default: '取消'
  },
  keyboard: {
    type: Boolean,
    default: true
  }
}

const ATTRIBUTES_TO_PROPAGATE = Object.keys(propagatedProps).map(hyphenate)

export default class MIPModal extends CustomElement {
  static get observedAttributes () {
    return Object.keys(MIPModal.props).map(hyphenate)
  }

  constructor (element) {
    super(element)

    /** @type {Record<string, HTMLElement>} */
    this.elements = null

    this.propagateAttribute = this.propagateAttribute.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.renderBody = this.renderBody.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
  }

  buildCallback () {
    this.render()
  }

  attributeChangedCallback (name) {
    if (!this.element.isBuilt()) {
      return
    }

    ATTRIBUTES_TO_PROPAGATE.includes(name) && this.propagateAttribute(name)
  }

  propagateAttribute (attrName) {
    const {$dialog} = this.elements

    if (!this.element.hasAttribute(attrName)) {
      $dialog.removeAttribute(attrName)

      return
    }

    $dialog.setAttribute(attrName, this.element.getAttribute(attrName))
  }

  propagateAttributes () {
    ATTRIBUTES_TO_PROPAGATE.forEach(this.propagateAttribute)
  }

  propagateSlotIfAbsent (name, render) {
    const {$dialog} = this.elements

    if ($dialog.querySelector(`template[slot="${name}"]`)) {
      return
    }

    const template = document.createElement('template')

    template.setAttribute('slot', name)
    template.innerHTML = render()

    $dialog.appendChild(template)
  }

  renderHeader () {
    const {title} = this.props

    return `<div class="${cx('title')}">${title}</div>`
  }

  renderBody () {
    const {content} = this.props

    return content
  }

  renderFooter () {
    const {okText, cancelText} = this.props

    return `<div class="${cx('buttons')}">` +
        `<button type="button" class="${cx('button')} ${cx('button-primary')} ${cx('ok-button')}">` +
          `<span class="${cx('button-text')}">${okText}</span>` +
        '</button>' +
        `<button type="button" class="${cx('button')} ${cx('cancel-button')}">` +
          `<span class="${cx('button-text')}">${cancelText}</span>` +
        '</button>' +
      '</div>'
  }

  render () {
    const {innerHTML} = this.element
    const $dialog = document.createElement('mip-dialog')

    this.element.innerHTML = ''
    $dialog.setAttribute('type', 'modal')
    $dialog.innerHTML = innerHTML

    this.elements = {
      $dialog
    }

    this.propagateAttributes()

    this.propagateSlotIfAbsent('header', this.renderHeader)
    this.propagateSlotIfAbsent('body', this.renderBody)
    this.propagateSlotIfAbsent('footer', this.renderFooter)

    this.element.appendChild($dialog)
  }
}

MIPModal.props = {
  ...propagatedProps,
  title: {
    default: ''
  },
  content: {
    default: ''
  }
}

registerService(TAG, MIPModalService)

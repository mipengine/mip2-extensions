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
  static props = {
    ...propagatedProps,
    title: {
      default: ''
    },
    content: {
      default: ''
    }
  }

  static get observedAttributes () {
    return Object.keys(MIPModal.props).map(hyphenate)
  }

  constructor (element) {
    super(element)

    /** @type {Record<string, HTMLElement>} */
    this.refs = null
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

  propagateAttribute = (attrName) => {
    const {$dialog} = this.refs

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
    const {$dialog} = this.refs

    if ($dialog.querySelector(`template[slot="${name}"]`)) {
      return
    }

    const template = document.createElement('template')

    template.setAttribute('slot', name)
    template.innerHTML = render(this.props)

    $dialog.appendChild(template)
  }

  renderHeader = ({title}) => `<div class="${cx('title')}">${title}</div>`

  renderBody = ({content}) => content

  renderFooter = ({okText, cancelText}) =>
    `<div class="${cx('buttons')}">` +
      `<button ref="okButton" type="button" class="${cx('button')} ${cx('button-primary')} ${cx('ok-button')}">` +
        `<span class="${cx('button-text')}">${okText}</span>` +
      '</button>' +
      `<button ref="cancelButton" type="button" class="${cx('button')} ${cx('cancel-button')}">` +
        `<span class="${cx('button-text')}">${cancelText}</span>` +
      '</button>' +
    '</div>'

  render () {
    const {innerHTML} = this.element
    const $dialog = document.createElement('mip-dialog')

    this.element.innerHTML = ''
    $dialog.setAttribute('type', 'modal')
    $dialog.innerHTML = innerHTML

    this.refs = {
      $dialog
    }

    this.propagateAttributes()

    this.propagateSlotIfAbsent('header', this.renderHeader)
    this.propagateSlotIfAbsent('body', this.renderBody)
    this.propagateSlotIfAbsent('footer', this.renderFooter)

    this.element.appendChild($dialog)
  }
}

registerService(TAG, MIPModalService)

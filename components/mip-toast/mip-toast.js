/**
 * @file mip-toast 组件
 * @author yanshi
 */

import './mip-toast.less'

/* global MIP */

const {CustomElement, util} = MIP
const {parse} = util

export default class MIPToast extends CustomElement {
  constructor (element) {
    super(element)

    this.show = true
    this.close = false
    this.isBlock = false
    this.hasPic = false
    this.showToastText = ''
    this.handleShow = this.handleShow.bind(this)
    this.handleShowToast = this.handleShowToast.bind(this)
    this.handleHide = this.handleHide.bind(this)
  }

  build () {
    this.render()
    // deprecated
    this.addEventAction('show', this.handleShow)

    this.addEventAction('showToast', this.handleShowToast)
    this.addEventAction('hidden', this.handleHide)
  }

  update (config) {
    const closeTime = (config && config.closeTime) || this.props.closeTime
    const infoIconSrc = (config && config.infoIconSrc) || this.props.infoIconSrc

    const showTime = closeTime * 1000

    if (!infoIconSrc) {
      this.show = false
    } else {
      this.isBlock = true
      this.hasPic = true
    }
    setTimeout(() => {
      this.close = false
      this.render(config)
    }, showTime)

    this.render(config)
  }

  handleShow (info) {
    const {infoText} = this.props
    this.close = true
    if (typeof info === 'string') {
      this.showToastText = info
    } else {
      this.showToastText = infoText
    }
    this.update()
  }

  handleShowToast (e, str) {
    this.close = true
    let config = {}
    let infoText = ''
    if (str) {
      config = parse(str, 'ObjectLiteral')()
      infoText = config && config.infoText
    }
    this.showToastText = infoText || this.props.infoText
    this.update(config)
  }

  handleHide () {
    this.close = false
    this.render()
  }

  render (config) {
    const station = (config && config.station) || this.props.station
    const infoIconSrc = (config && config.infoIconSrc) || this.props.infoIconSrc

    const wrapper = document.createElement('div')
    const fixed = document.createElement('mip-fixed')
    const toastWrapper = document.createElement('div')
    const toast = document.createElement('div')
    const toastImg = document.createElement('img')
    const toastText = document.createElement('p')

    wrapper.classList.add('wrapper')
    wrapper.appendChild(fixed)

    fixed.setAttribute('type', 'top')
    fixed.setAttribute('still', true)
    fixed.classList.add(station)

    if (!this.close) {
      fixed.style.display = 'none'
    }

    fixed.appendChild(toastWrapper)

    if (this.hasPic) {
      toastWrapper.classList.add('limit-width')
    }
    toastWrapper.appendChild(toast)

    toast.classList.add('toast')

    if (this.show) {
      toastImg.setAttribute('src', infoIconSrc)
      toastImg.classList.add('icon')
      toast.appendChild(toastImg)
    }

    toastText.innerText = this.showToastText
    if (this.isBlock) {
      toastText.classList.add('block')
    }
    toast.appendChild(toastText)

    this.element.innerHTML = ''
    this.element.appendChild(wrapper)
  }
}

MIPToast.props = {
  infoIconSrc: {
    type: String,
    default: ''
  },
  infoText: {
    type: String,
    default: ''
  },
  closeTime: {
    type: Number,
    default: 3
  },
  station: {
    type: String,
    default: ''
  }
}

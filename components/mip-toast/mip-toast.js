import './mip-toast.less'

const {CustomElement} = MIP

export default class MIPToast extends CustomElement {
  constructor (element) {
    super(element)

    this.show = true
    this.close = false
    this.isBlock = false
    this.hasPic = false
    this.showToastText = ''
    this.showTime = 2500
    this.handleShow = this.handleShow.bind(this)
    this.handleHide = this.handleHide.bind(this)
  }

  build () {
    this.render()
    this.addEventAction('show', this.handleShow)
    this.addEventAction('hidden', this.handleHide)
  }

  update () {
    const {closeTime, infoIconSrc, autoClose} = this.props

    if (!!closeTime && closeTime !== 2500) {
      this.showTime = closeTime * 1000
    }
    if (!infoIconSrc) {
      this.show = false
    } else {
      this.isBlock = true
      this.hasPic = true
    }
    if (autoClose) {
      setTimeout(() => {
        this.close = false
        this.render()
      }, this.showTime)
    }
    this.render()
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

  handleHide () {
    this.close = false
    this.render()
  }

  render () {
    const {station, infoIconSrc} = this.props
    const wrapper = document.createElement('div')
    const fixed = document.createElement('mip-fixed')
    const toastWrapper = document.createElement('div')
    const toast = document.createElement('div')
    const toastImg = document.createElement('img')
    const toastText = document.createElement('p')

    wrapper.classList.add('wrapper')
    wrapper.appendChild(fixed)

    fixed.setAttribute('type', 'top')
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
  autoClose: {
    type: Boolean,
    default: true
  },
  closeTime: {
    type: Number,
    default: 2500
  },
  station: {
    type: String,
    default: ''
  }
}

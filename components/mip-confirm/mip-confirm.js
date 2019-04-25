import './mip-confirm.less'

const {CustomElement, viewer} = MIP

export default class MIPConfirm extends CustomElement {
  constructor (element) {
    super(element)
    this.confirm = false
    this.dialog = false
    this.myDialog = false
    this.click = false
    this.cancel = this.cancel.bind(this)
    this.isOk = this.isOk.bind(this)
  }

  build () {
    const container = document.createElement('div')

    container.innerHTML = '<mip-fixed type="top left bottom right" class="mask"></mip-fixed>' +
      '<mip-fixed type="top" class="wrapper">' +
      '<div class="toast">' +
      '<div class="confirm-title"></div>' +
      '<p class="confirm-content"></p>' +
      '<div class="confirm-footer"></div>' +
      '</div>' +
      '</mip-fixed>'

    this.container = container
    this.element.appendChild(container)

    const {isDemo, pattern} = this.props

    if (isDemo) {
      this.click = true
      this.myDialog = false
    }

    if (pattern === 'confirm') {
      this.dialog = false
      this.confirm = true
    } else {
      this.confirm = false
      this.dialog = true
    }

    this.addEventAction('show', () => {
      this.myDialog = true
      this.render()
    })
    this.addEventAction('hidden', () => {
      this.myDialog = false
      this.render()
    })

    this.render()
  }

  cancel () {
    viewer.eventAction.execute('ready', this.element, false)
    this.myDialog = false
    if (this.isDemo) {
      this.click = true
    }
    this.render()
  }

  isOk () {
    viewer.eventAction.execute('ready', this.element, true)
    this.myDialog = false
    if (this.isDemo) {
      this.click = true
    }
    this.render()
  }

  render () {
    const {infoTitle} = this.props

    this.container.style.display = this.myDialog ? null : 'none'
    this.element.querySelector('.confirm-title').innerHTML = `<div>${infoTitle}</div>`

    const footer = this.element.querySelector('.confirm-footer')

    if (this.confirm) {
      footer.innerHTML = '<button class="confirm-footer-btn confirm-footer-left">取消</button>' +
        '<button class="confirm-footer-btn confirm-footer-right">确定</button>'
      footer.querySelector('.confirm-footer-left').addEventListener('click', this.cancel)
      footer.querySelector('.confirm-footer-right').addEventListener('click', this.isOk)
    }

    if (this.dialog) {
      footer.innerHTML = '<button class="confirm-footer-btn confirm-footer-bottom">确定</button>'
      footer.querySelector('.confirm-footer-bottom').addEventListener('click', this.isOk)
    }
  }
}

MIPConfirm.props = {
  infoText: {
    type: String,
    default: ''
  },
  infoTitle: {
    type: String,
    default: ''
  },
  pattern: {
    type: String,
    default: 'alert'
  },
  isDemo: {
    type: Boolean,
    default: true
  }
}

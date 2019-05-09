/**
 * @file mip-confirm 组件
 * @author yanshi
 */

import './mip-confirm.less'

/* global MIP */

const {CustomElement, viewer} = MIP

export default class MIPConfirm extends CustomElement {
  constructor (element) {
    super(element)
    this.isDialogOpen = false
    this.cancelHandler = this.cancelHandler.bind(this)
    this.okHandler = this.okHandler.bind(this)
  }

  build () {
    const container = document.createElement('div')

    container.innerHTML = '' +
      '<mip-fixed still type="top" class="wrapper">' +
        '<div class="toast">' +
        '<div class="confirm-title"></div>' +
          '<p class="confirm-content"></p>' +
          '<div class="confirm-footer"></div>' +
        '</div>' +
      '</mip-fixed>' +
      '<mip-fixed still type="top left bottom right" class="mask"></mip-fixed>'

    this.container = container
    this.element.appendChild(container)

    this.addEventAction('show', () => {
      this.isDialogOpen = true
      this.render()
    })
    this.addEventAction('hidden', () => {
      this.isDialogOpen = false
      this.render()
    })

    this.render()
  }

  cancelHandler () {
    viewer.eventAction.execute('ready', this.element, false)
    this.isDialogOpen = false
    this.render()
  }

  okHandler () {
    viewer.eventAction.execute('ready', this.element, true)
    this.isDialogOpen = false
    this.render()
  }

  render () {
    const {infoTitle, infoText, pattern} = this.props
    const ele = this.element
    const wrapper = document.querySelector('.wrapper')
    const mask = ele.querySelector('.mask')

    const footer = ele.querySelector('.confirm-footer')
    const title = ele.querySelector('.confirm-title')
    const content = ele.querySelector('.confirm-content')

    wrapper.style.display = this.isDialogOpen ? null : 'none'
    mask.style.display = this.isDialogOpen ? null : 'none'

    title.innerHTML = `<div>${infoTitle}</div>`
    content.innerText = infoText

    if (pattern === 'confirm') {
      footer.innerHTML = '<button class="confirm-footer-btn confirm-footer-left">取消</button>' +
        '<button class="confirm-footer-btn confirm-footer-right">确定</button>'
      footer.querySelector('.confirm-footer-left').addEventListener('click', this.cancelHandler)
      footer.querySelector('.confirm-footer-right').addEventListener('click', this.okHandler)
    } else if (pattern === 'alert') {
      footer.innerHTML = '<button class="confirm-footer-btn confirm-footer-bottom">确定</button>'
      footer.querySelector('.confirm-footer-bottom').addEventListener('click', this.okHandler)
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
  }
}

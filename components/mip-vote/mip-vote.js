/**
 * @file mip 投票计数类型的组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-vote.less'

const { CustomElement } = MIP

export default class mipVote extends CustomElement {
  static props = {
    text: {
      type: String,
      default: ''
    },

    src: {
      type: String,
      default: ''
    },

    icon: {
      type: String,
      default: ''
    }
  }

  constructor (...elements) {
    super(...elements)
    this.counter = 0
  }

  build () {
    this.text = this.getA
    this.render()
  }

  render () {
    let templateDom = this.element.querySelector('template[type="mip-mustache"]')
    let wrapper = document.createElement('div')

    this.data = this.props

    wrapper.innerHTML = templateDom.innerHTML

    this.element.appendChild(wrapper)

    // let { text, icon } = this.props
    // let button = document.createElement('div')
    // let iconDom = document.createElement('mip-img')
    // let textDom = document.createElement('span')

    // iconDom.src = icon
    // textDom.innerHTML = text

    // button.appendChild(iconDom)
    // button.appendChild(textDom)

    // this.element.appendChild(button)
  }
}

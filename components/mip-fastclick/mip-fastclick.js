import FastClick from 'fastclick'

export default class MIPFastClick extends MIP.CustomElement {
  constructor (...args) {
    super(...args)
    let targetId = this.element.getAttribute('target')
    let target = document.querySelector('#' + targetId) || this.element
    FastClick.attach(target)
  }
}

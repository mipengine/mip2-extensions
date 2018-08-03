import FastClick from 'fastclick'

export default class MIPFastClick extends MIP.CustomElement {
  constructor (...args) {
    super(...args)
    let targetId = this.element.getAttribute('target')
    this.target = document.getElementById(targetId) || this.element
  }

  connectedCallback () {
    this.fastclick = FastClick.attach(this.target)
  }

  disconnectedCallback () {
    this.fastclick.destroy()
    this.fastclick = null
  }
}

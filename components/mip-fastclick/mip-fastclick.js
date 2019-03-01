import FastClick from 'fastclick'

export default class MIPFastClick extends MIP.CustomElement {
  connectedCallback () {
    let targetId = this.element.getAttribute('target')
    this.target = document.getElementById(targetId) || this.element
    this.fastclick = FastClick.attach(this.target)
  }

  disconnectedCallback () {
    this.fastclick.destroy()
    this.fastclick = null
  }
}

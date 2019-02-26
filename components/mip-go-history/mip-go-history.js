import './index.less'

export default class MIPGoHistory extends MIP.CustomElement {
  build () {
    let node = this.element
    let address = node.getAttribute('data')
    node.addEventListener('click', () => {
      let referrer = document.referrer
      let state = window.history.state
      if (state && state != null) {
        window.history.back()
      } else {
        if (referrer) {
          window.history.back()
        } else {
          window.location.href = address
        }
      }
    })
  }
}

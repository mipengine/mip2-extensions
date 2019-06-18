
export default class MIPTestItem extends MIP.CustomElement {
  build () {
    let wrapper = document.createElement('div')
    wrapper.innerHTML = 'i am child'
    this.element.appendChild(wrapper)
  }
}

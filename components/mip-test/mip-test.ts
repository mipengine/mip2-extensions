import('./export')
    .then((module) => {
      module.default();
      // → logs 'Hi from the default export!'
      module.aa();
      // → logs 'Doing stuff…'
    });

import img from './cache-put.png'
import './exportJS'

console.log(img)
export default class MIPTest extends MIP.CustomElement {
  build () {
    const a = '123'
    console.log(a)
    let wrapper = document.createElement('div')
    wrapper.innerHTML = 'i am father'
    this.element.appendChild(wrapper)
  }
}

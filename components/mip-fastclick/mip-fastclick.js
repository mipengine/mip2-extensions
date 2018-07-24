import FastClick from 'fastclick'

export default class MIPFastClick extends MIP.CustomElement {
  constructor (ele) {
    super(ele)
    FastClick.attach(document.body)
  }
}

/**
 * @file mip-history
 * @author Jenny_L(jiaojiaomao220@163.com), liwenqian(liwenqian@baidu.com)
 */
import './mip-history.less'
let { CustomElement } = MIP

export default class MipHistory extends CustomElement {
  firstInviewCallback () {
    this.init()
  }

  init () {
    const history = this.element.getAttribute('history')
    if (!history) {
      return
    }
    
    const historyArr = history.split(',')
    const func = historyArr[0]

    switch (func) {
      case 'go':
        const step = historyArr[1]
        if (step) {
          this.element.addEventListener('click', () => {
            window.history.go(step - 0)
          }, false)
        }
        else {
          console.warn('history.go() 需要填写第二个参数')
        }
        break
      case 'back':
        this.element.addEventListener('click', () => {
          window.history.back()
        }, false)
        break
      case 'forward':
        this.element.addEventListener('click', () => {
          window.history.forward()
        }, false)
        break
    }
  }
}

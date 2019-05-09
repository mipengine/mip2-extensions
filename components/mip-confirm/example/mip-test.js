/**
 * @file 测试组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* globals MIP */

class MIPTest extends MIP.CustomElement {
  build () {
    this.addEventAction('print', data => {
      this.print(data)
    })
  }

  /**
   * 打印的测试内容
   *
   * @param {any} content 打印的内容
   */
  print (content) {
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2)
    }

    this.element.innerHTML = '<code><pre>' + content + '</pre></code>'
  }
}

MIP.registerElement('mip-test', MIPTest)

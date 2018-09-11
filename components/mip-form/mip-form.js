/**
 * @file mip-form.js 表单组件
 * @author duxiaonan@baidu.com (duxiaonan)
 */

import Form from './mip-form-fn'
import './mip-form.less'

let { CustomElement, util } = MIP

export default class MipForm extends CustomElement {
  // 提前渲染
  prerenderAllowed () {
    return true
  }

  // 插入文档时执行
  build () {
    let element = this.element
    let addClearBtn = element.hasAttribute('clear')
    let form = new Form()
    form.createDom(element)

    if (addClearBtn) {
      let clearArr = ['text', 'input', 'datetime', 'email', 'number', 'search', 'tel', 'url']
      let clearList = clearArr.map(clear => `input[type=${clear}]`).join(',')
      // clearItems为类数组对象
      let clearItems = element.querySelectorAll(clearList)

      if (!clearItems.length) {
        return
      }

      let cross = document.createElement('div')
      cross.id = 'mip-form-cross'
      this.cross = cross

      for (let clearItem of clearItems) {
        let height = clearItem.offsetHeight
        clearItem.addEventListener('focus', function () {
          let self = this
          cross.setAttribute('name', self.getAttribute('name'))
          util.css(cross, {
            top: self.offsetTop + (height - 16) / 2 - 8 + 'px',
            left: self.offsetWidth - 32 + 'px'
          })
          self.parentNode.appendChild(cross)
          if (self.value !== '') {
            util.css(cross, {display: 'block'})
          } else {
            util.css(cross, {display: 'none'})
            self.addEventListener('input', function () {
              if (util && util.platform && util.platform.isAndroid() && self.type === 'search') {
                // andriod type=search自带清空按钮, 不显示清空
                return
              }
              util.css(cross, {display: (self.value !== '' ? 'block' : 'none')})
            })
          }
        }, false)
        // 点击提交时，如果报错信息展示，则隐藏清空按钮
        clearItem.addEventListener('blur', function () {
          util.css(cross, {display: 'none'})
        }, false)
      }
      cross.addEventListener('touchstart', this.clear, false)
      cross.addEventListener('mousedown', this.clear, false)
      cross.addEventListener('click', this.clear, false)
    }

    form.initMessageEvents(element)
  }

  clear (e) {
    e.stopPropagation()
    e.preventDefault()
    let name = e.target.getAttribute('name')
    let inputSelect = this.parentNode.querySelector('input[name="' + name + '"]')
    inputSelect.focus()
    inputSelect.value = ''
    util.css(this, {display: 'none'})
  }
}

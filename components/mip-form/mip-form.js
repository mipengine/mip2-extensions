/**
 * @file mip-form.js 表单组件
 * @author duxiaonan@baidu.com (duxiaonan)
 */

import Form from './mip-form-fn'
import './mip-form.less'

let { CustomElement, util } = MIP

export default class MipForm extends CustomElement {
  prerenderAllowed () {
    return true
  }

  build () {
    let addClearBtn = this.element.hasAttribute('clear')
    let form = new Form()
    form.createDom(this.element)

    if (addClearBtn) {
      this.addClearButton()
    }
    form.initMessageEvents(this.element)
  }

  addClearButton () {
    const clearArr = ['text', 'input', 'datetime', 'email', 'number', 'search', 'tel', 'url']
    const clearList = clearArr.map(clear => `input[type=${clear}]`).join(',')
    const clearItems = this.element.querySelectorAll(clearList)

    if (!clearItems.length) {
      return
    }

    let cross = document.createElement('div')
    cross.id = 'mip-form-cross'

    for (let clearItem of clearItems) {
      const itemHeight = clearItem.offsetHeight
      clearItem.addEventListener('focus', function () {
        cross.setAttribute('name', this.getAttribute('name'))
        util.css(cross, {
          top: this.offsetTop + (itemHeight - 16) / 2 - 8 + 'px',
          left: this.offsetWidth - 32 + 'px'
        })
        this.parentNode.appendChild(cross)
        if (this.value !== '') {
          util.css(cross, {display: 'block'})
        } else {
          util.css(cross, {display: 'none'})
          this.addEventListener('input', function () {
            // andriod type=search自带清空按钮, 不显示清空
            if (util && util.platform && util.platform.isAndroid() && this.type === 'search') {
              return
            }
            util.css(cross, {display: (this.value !== '' ? 'block' : 'none')})
          })
        }
      }, false)
      // 点击提交时，如果报错信息展示，则隐藏清空按钮
      clearItem.addEventListener('blur', () => {
        util.css(cross, {display: 'none'})
      }, false)
    }
    cross.addEventListener('touchstart', this.clear, false)
    cross.addEventListener('mousedown', this.clear, false)
    cross.addEventListener('click', this.clear, false)
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

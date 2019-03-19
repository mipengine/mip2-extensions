/**
 * @file mip-form.js 表单组件
 * @author duxiaonan@baidu.com (duxiaonan)
 */

import Form from './mip-form-fn'
import './mip-form.less'

let { CustomElement } = MIP

export default class MipForm extends CustomElement {
  prerenderAllowed () {
    return true
  }

  build () {
    let form = new Form()
    form.createDom(this.element)
    form.setEventHandle()
  }
}

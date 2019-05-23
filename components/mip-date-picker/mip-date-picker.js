/**
 * @file mip-date-picker 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-date-picker.less'
import Calendar from './calendar'

const { CustomElement } = MIP

export default class MIPDatePicker extends CustomElement {
  constructor (...elements) {
    super(...elements)

    this.startDateEle = null
  }

  build () {
    let calendar = new Calendar()
    calendar.render()
  }
}

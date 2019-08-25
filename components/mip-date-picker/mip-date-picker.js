/**
 * @file mip-date-picker.js 时间选择器
 * @author miya
 *
 */
import SingleDatePicker from './single-date-picker'
import dateUtil from './util'

const { CustomElement, util } = MIP
const { error } = util.log('mip-date-display')

export default class MIPDatePicker extends CustomElement {
  constructor (element) {
    super(element)

    this.state = {
      view: 'date',
      mode: null,
      selectedDate: null,
      hilightedDate: null,
      dayOffset: null,
      minDate: null,
      maxDate: null
    }

    this.getAttributes = this.getAttributes.bind(this)
    this.examFormat = this.examFormat.bind(this)
  }

  build () {
    this.getAttributes()

    if (this.state.mode === 'date-picker') {
      this.picker = new SingleDatePicker(this.element, this.state)
    } else if (this.state.mode === 'range-picker') {
      // this.picker = new RangePicker(this.element, this.state)
    }
  }

  getAttributes () {
    this.state.mode = this.element.getAttribute('mode')
    if (!this.state.mode) {
      error('模式为必选项，组件未声明模式 mode 字段')
    }

    this.state.format = this.element.getAttribute('format') || 'yyyy-MM-dd'
    this.examFormat()

    this.state.minDate = dateUtil.parseToDate(this.element.getAttribute('min-date')) ||
      dateUtil.shiftYear(new Date(), -100)
    this.state.minDate.setHours(0, 0, 0, 0)
    this.state.maxDate = dateUtil.parseToDate(this.element.getAttribute('max-date')) ||
      dateUtil.shiftYear(new Date(), 100)
    this.state.maxDate.setHours(23, 59, 59, 999)
    // 日历默认最左侧为周日，即 `日 一 二 三 四 五 六`，可以通过 `dayOffset` 调整是从周几开始
    this.state.dayOffset = this.element.getAttribute('day-offset') || 0

    const defaultDate = dateUtil.parseToDate(this.element.getAttribute('selected-date'))
    // 选中日期需要在设定范围内，若不在，则返回边界值
    this.state.selectedDate = defaultDate
      ? dateUtil.constrainDate(defaultDate, this.state.minDate, this.state.maxDate)
      : ''
    this.state.hilightedDate = defaultDate || new Date()
  }

  examFormat () {
    const regYMD = /y{4}[-|/]M{2}[-|/]d{2}/
    const regDMY = /d{2}[-|/]M{2}[-|/]y{4}/
    const regMDY = /M{2}[-|/]d{2}[-|/]y{4}/
    if (!regYMD.test(this.state.format) &&
      !regDMY.test(this.state.format) &&
      !regMDY.test(this.state.format)) {
      error(`format 属性错误： ${this.state.format}`)
    }
  }
}

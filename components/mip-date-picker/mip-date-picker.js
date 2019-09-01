/**
 * @file mip-date-picker.js 时间选择器
 * @author miya
 *
 */
import DatePicker from './date-picker'
import dateUtil from './util'
import RangePicker from './range-picker'

const {CustomElement, util} = MIP
const {jsonParse} = util
const { error } = util.log('mip-date-picker')

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
      maxDate: null,
      start: null,
      end: null
    }

    this.getAttributes = this.getAttributes.bind(this)
    this.examFormat = this.examFormat.bind(this)
  }

  build () {
    this.getAttributes()

    if (this.state.mode === 'date-picker') {
      this.picker = new DatePicker(this.element, this.state)
    } else if (this.state.mode === 'range-picker') {
      this.picker = new RangePicker(this.element, this.state)
    }

    this.addEventAction(
      'clear',
      (event, arg) => {
        this.picker.clearInput()
      }
    )

    this.addEventAction(
      'setDate',
      (event, arg) => {
        if (this.state.mode !== 'date-picker') {
          error('非 date-picker 模式下不允许 setDate，请使用 setDates')
          return
        }
        const date = jsonParse(arg).date
        this.picker.setDate(date)
      }
    )

    this.addEventAction(
      'setDates',
      (event, arg) => {
        if (this.state.mode !== 'range-picker') {
          error('非 range-picker 模式下不允许 setDates，请使用 setDate')
          return
        }
        const date = jsonParse(arg)
        this.picker.setDates(date)
      }
    )

    this.addEventAction(
      'today',
      (event, arg) => {
        if (this.state.mode !== 'date-picker') {
          error('非 date-picker 模式下不允许 today')
          return
        }
        this.picker.selectToday()
      }
    )

    this.addEventAction(
      'setStart',
      (event, arg) => {
        if (this.state.mode !== 'range-picker') {
          error('非 range-picker 模式下不允许 setStart')
          return
        }
        this.picker.setStart()
      }
    )

    this.addEventAction(
      'setEnd',
      (event, arg) => {
        if (this.state.mode !== 'range-picker') {
          error('非 range-picker 模式下不允许 setEnd')
          return
        }
        this.picker.setEnd()
      }
    )
  }

  getAttributes () {
    this.state.mode = this.element.getAttribute('mode')
    if (!this.state.mode) {
      error('模式为必选项，组件未声明模式 mode 字段')
    }

    this.state.display = this.element.getAttribute('display') || 'overlay'

    this.state.format = this.element.getAttribute('format') || 'yyyy-MM-dd'
    this.examFormat()

    // mode = date 单个日期选择模式下的 input 框选择器
    if (this.state.mode === 'date-picker') {
      this.state.inputSelector = this.element.getAttribute('input-selector')
      if (!this.state.inputSelector) {
        error('mode = date-picker 模式下必须通过 input-selector 属性指定 input 框')
        return
      }
    }

    // mode = range 日期范围选择模式下的起始和结束日期的 input 框选择器
    if (this.state.mode === 'range-picker') {
      this.state.startInputSelector = this.element.getAttribute('start-input-selector')
      this.state.endInputSelector = this.element.getAttribute('end-input-selector')
      if (!this.state.startInputSelector) {
        error('mode = range-picker 模式下必须通过 start-input-selector 属性指定起始日期的 input 框')
        return
      }
      if (!this.state.endInputSelector) {
        error('mode = range-picker 模式下必须通过 end-input-selector 属性指定结束日期的 input 框')
        return
      }
    }

    const specifyMinDate = this.element.getAttribute('min-date')
    this.state.minDate = dateUtil.parseToDate(specifyMinDate) ||
      dateUtil.shiftYear(new Date(), -100)
    this.state.minDate.setHours(0, 0, 0, 0)
    this.state.maxDate = dateUtil.parseToDate(this.element.getAttribute('max-date')) ||
      dateUtil.shiftYear(new Date(), 100)
    this.state.maxDate.setHours(23, 59, 59, 999)
    // 日历默认最左侧为周日，即 `日 一 二 三 四 五 六`，可以通过 `dayOffset` 调整是从周几开始，0 为周日，1 为周一，以此类推
    this.state.dayOffset = this.element.getAttribute('day-offset') - 0 || 0

    const defaultDate = dateUtil.parseToDate(this.element.getAttribute('selected-date'))
    // 选中日期需要在设定范围内，若不在，则返回边界值
    this.state.selectedDate = defaultDate
      ? dateUtil.constrainDate(defaultDate, this.state.minDate, this.state.maxDate)
      : ''
    // 用户指定默认选择的 selected-date 优先显示在日历第一页
    // 若用户未指定 selected-date，但指定了日期范围，且 today 在范围内，则显示今天
    // 若 today 不在范围内，则将 minDate 作为第一页显示
    // 若均未指定，则显示今天
    const isTodayInrange = dateUtil.inRange(new Date(), this.state.minDate, this.state.maxDate)
    this.state.hilightedDate = defaultDate ||
      (specifyMinDate && !isTodayInrange && this.state.minDate) ||
      new Date()
    // mode = range-picker 时的默认选中起止日期
    this.state.start = dateUtil.parseToDate(this.element.getAttribute('start'))
    this.state.end = dateUtil.parseToDate(this.element.getAttribute('end'))

    this.state.openAfterSelect = this.element.hasAttribute('open-after-select')
    this.state.openAfterclear = this.element.hasAttribute('open-after-clear')
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

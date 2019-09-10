/**
 * @file single-date-picker.js 时间选择器
 * @author miya
 *
 */
import './date-picker.less'
import DayPicker from './views/day-picker'
import MonthPicker from './views/month-picker'
import YearPicker from './views/year-picker'

const {viewer} = MIP

export default class BasePicker {
  constructor (element, options) {
    this.element = element
    this.state = options
    this.views = {
      date: null,
      month: null,
      year: null
    }

    this.onClick = this.onClick.bind(this)
    this.close = this.close.bind(this)

    this.picker = new DayPicker()
  }

  render () {
    this.changeView(this.state.view)

    const picker = this.picker.render(this.state)
    this.pickerWrapper.firstChild.innerHTML = picker
    const input = this.state.mode === 'range-picker' ? this.startInput : this.input
    this.adjustPosition(input)
    this.focusCurrent()
  }

  shouldFocusOnRender () {
    if (this.state.mode === 'range-picker') {
      return this.startInput !== document.activeElement &&
        this.endInput !== document.activeElement
    }
    return this.input !== document.activeElement
  }

  close () {
    if (this.state.display === 'static') {
      return
    }

    if (!this.isVisible()) {
      return
    }

    const dpElement = this.pickerWrapper.firstChild
    const calElement = dpElement.firstChild
    if (calElement) {
      dpElement && dpElement.removeChild(calElement)
    }

    document.body.focus()
    this.emitDeactivateEvent()
  }

  changeView (view) {
    if (this.views[view]) {
      this.picker = this.views[view]
    } else {
      this.picker = (view === 'month') ? this.views.month = new MonthPicker()
        : (view === 'year') ? this.views.year = new YearPicker() : this.views.date = new DayPicker()
    }
  }

  getInputValidDate (value) {
    // date 必须满足指定的 format，默认为 yyyy-mm-DD
    // 如：2019-09-08，分隔符可能是 - 或者 /，而且必须能转换成合法日期才更新 hilightedDate
    let year = null
    let month = null
    let date = null
    let matchs = null
    if (this.state.format === 'yyyy-MM-dd' || this.state.format === 'yyyy/MM/dd') {
      matchs = value.match(/(\d{4})[-|/](\d{2})[-|/](\d{2})/)
      matchs && ([, year, month, date] = matchs)
    } else if (this.state.format === 'MM-dd-yyyy' || this.state.format === 'MM/dd/yyyy') {
      matchs = value.match(/(\d{2})[-|/](\d{2})[-|/](\d{4})/)
      matchs && ([, month, date, year] = matchs)
    } else if (this.state.format === 'dd-MM-yyyy' || this.state.format === 'dd/MM/yyyy') {
      matchs = value.match(/(\d{2})[-|/](\d{2})[-|/](\d{4})/)
      matchs && ([, date, month, year] = matchs)
    }
    year = year && (year - 0)
    month = month && (month - 1)
    date = date && (date - 0)
    return {
      isvalid: year && month > -1 && month < 12 &&
        date > -1 && date < 32,
      year,
      month,
      date
    }
  }

  onClick (event) {
    event.target.className.split(' ').forEach(evt => {
      let handler = this.picker.onClick[evt]
      const operations = {
        close: this.close,
        setState: this.setState
      }
      handler && handler(event, operations, this.state)
    })
  }

  isVisible () {
    const dpElement = this.pickerWrapper.firstChild
    const calElement = dpElement.firstChild
    return !!this.pickerWrapper && !!dpElement && !!calElement
  }

  focusCurrent () {
    if (this.state.view === 'year' || this.state.view === 'month') {
      const current = this.pickerWrapper.querySelector('.dp-current')
      current && current.focus()
    } else if (this.state.display !== 'static') {
      this.pickerWrapper.focus()
    }
  }

  adjustPosition (input) {
    const inputPos = input.getBoundingClientRect()
    const win = window

    adjustCalY(this.pickerWrapper, inputPos, win)
    adjustCalX(this.pickerWrapper, inputPos, win)

    this.pickerWrapper.style.visibility = ''
  }

  emitActivateEvent () {
    viewer.eventAction.execute('activate', this.element, {})
  }

  emitDeactivateEvent () {
    viewer.eventAction.execute('deactivate', this.element, {})
  }
}

function adjustCalX (wrapper, inputPos, win) {
  const scrollLeft = win.pageXOffset
  const inputLeft = inputPos.left + scrollLeft
  const maxRight = win.innerWidth + scrollLeft
  const offsetWidth = wrapper.offsetWidth
  const calRight = inputLeft + offsetWidth
  const shiftedLeft = maxRight - offsetWidth
  const left = calRight > maxRight && shiftedLeft > 0 ? shiftedLeft : inputLeft

  wrapper.style.left = left + 'px'
}

function adjustCalY (wrapper, inputPos, win) {
  const scrollTop = win.pageYOffset
  const inputTop = scrollTop + inputPos.top
  const calHeight = wrapper.offsetHeight
  const belowTop = inputPos.height + 2
  const aboveTop = inputTop - calHeight - 2
  const isAbove = (aboveTop > 0 && belowTop + calHeight > scrollTop + win.innerHeight)
  const top = isAbove ? aboveTop : belowTop

  if (wrapper.classList) {
    wrapper.classList.toggle('dp-is-above', isAbove)
    wrapper.classList.toggle('dp-is-below', !isAbove)
  }
  wrapper.style.top = top + 'px'
}

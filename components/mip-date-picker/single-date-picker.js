/**
 * @file mip-date-picker.js 时间选择器
 * @author miya
 *
 */
import './date-picker.less'
import dateUtil from './util'
import DatePicker from './date-picker'
import MonthPicker from './month-picker'
import YearPicker from './year-picker'

export default class SingleDatePicker {
  constructor (element, options) {
    this.element = element
    this.state = options
    this.views = {
      date: null,
      month: null,
      year: null
    }

    this.generateWrapper = this.generateWrapper.bind(this)
    this.attachContainerEvents = this.attachContainerEvents.bind(this)
    this.attachInputEvents = this.attachInputEvents.bind(this)
    this.setState = this.setState.bind(this)
    this.render = this.render.bind(this)
    this.isVisible = this.isVisible.bind(this)
    this.focusCurrent = this.focusCurrent.bind(this)
    this.hasFocus = this.hasFocus.bind(this)
    this.onClick = this.onClick.bind(this)
    this.close = this.close.bind(this)
    this.changeView = this.changeView.bind(this)
    this.adjustPosition = this.adjustPosition.bind(this)
    this.focusInput = this.focusInput.bind(this)
    this.blurInput = this.blurInput.bind(this)
    this.shouldFocusOnRender = this.shouldFocusOnRender.bind(this)
    this.updateDate = this.updateDate.bind(this)
    this.updateDateByInput = this.updateDateByInput.bind(this)

    this.generateWrapper()
    this.attachContainerEvents()
    this.attachInputEvents()
  }

  generateWrapper () {
    // mip-form
    const form = document.createElement('mip-form')
    const label = document.createElement('label')
    label.classList.add('dp-label')
    this.input = document.createElement('input')
    this.input.classList.add('dp-input')

    // date-picker-wrapper
    this.pickerWrapper = document.createElement('section')
    this.pickerWrapper.classList.add(`dp-below`)
    let pickerElement = document.createElement('section')
    pickerElement.classList.add('dp')
    this.pickerWrapper.appendChild(pickerElement)

    label.appendChild(this.input)
    label.appendChild(this.pickerWrapper)
    form.appendChild(label)

    this.element.appendChild(form)
  }

  // getAttributes () {
  //   this.state.mode = this.element.getAttribute('mode')
  //   if (!this.state.mode) {
  //     error('模式为必选项，组件未声明模式 mode 字段')
  //   }

  //   if (this.state.mode === 'date-picker') {
  //     this.picker = new DatePicker()
  //   } else if (this.state.mode === 'range-picker') {
  //     // this.picker = new RangePicker()
  //   }

  //   this.state.format = this.element.getAttribute('format') || 'yyyy-MM-dd'
  //   this.examFormat()

  //   this.state.minDate = dateUtil.parseToDate(this.element.getAttribute('min-date')) ||
  //     dateUtil.shiftYear(new Date(), -100)
  //   this.state.minDate.setHours(0, 0, 0, 0)
  //   this.state.maxDate = dateUtil.parseToDate(this.element.getAttribute('max-date')) ||
  //     dateUtil.shiftYear(new Date(), 100)
  //   this.state.maxDate.setHours(23, 59, 59, 999)
  //   // 日历默认最左侧为周日，即 `日 一 二 三 四 五 六`，可以通过 `dayOffset` 调整是从周几开始
  //   this.state.dayOffset = this.element.getAttribute('day-offset') || 0

  //   // selectedDate：input 框输入的时间
  //   const inputDate = dateUtil.parseToDate(this.input.value)
  //   // 选中日期需要在设定范围内，若不在，则返回边界值
  //   this.state.selectedDate = inputDate
  //     ? dateUtil.constrainDate(inputDate, this.state.minDate, this.state.maxDate)
  //     : ''
  //   this.state.hilightedDate = inputDate || new Date()
  // }

  // examFormat () {
  //   const regYMD = /y{4}[-|/]M{2}[-|/]d{2}/
  //   const regDMY = /d{2}[-|/]M{2}[-|/]y{4}/
  //   const regMDY = /M{2}[-|/]d{2}[-|/]y{4}/
  //   if (!regYMD.test(this.state.format) &&
  //     !regDMY.test(this.state.format) &&
  //     !regMDY.test(this.state.format)) {
  //     error(`format 属性错误： ${this.state.format}`)
  //   }
  // }

  setState (state) {
    let needRender
    for (let key in state) {
      this.state[key] = state[key]
      if (key === 'view' || key === 'hilightedDate' || key === 'needRender') {
        needRender = true
      }
      if (key === 'selectedDate') {
        this.state.hilightedDate = state[key]
        this.input.value = state[key]
          ? dateUtil.format(this.state.format, state[key])
          : ''
        if (this.state.view === 'date') {
          this.updateDate(state[key])
        }
      }
    }
    if (needRender) {
      this.render()
    }
    // emit('statechange')
  }

  updateDate (selectedDate) {
    Array.from(this.pickerWrapper.querySelector('.dp-days').children).forEach(element => {
      element.classList.contains('dp-selected') && element.classList.remove('dp-selected')
      element.classList.contains('dp-current') && element.classList.remove('dp-current')
      if (selectedDate && (new Date(element.getAttribute('data-date') - 0).toDateString() === (selectedDate.toDateString()))) {
        element.classList.add('dp-selected')
        element.classList.add('dp-current')
      }
    })
  }

  render () {
    if (this.closing) {
      return
    }

    this.changeView(this.state.view)

    const picker = this.picker.render(this.state)
    this.pickerWrapper.firstChild.innerHTML = picker
    this.adjustPosition()
    if (this.hasFocus() || this.shouldFocusOnRender()) {
      this.focusCurrent()
    }
    // if (!this.input.focused) { // 选完月份年份就不应该聚焦
    //   this.focusInput()
    // }
    // emit('open')
  }

  shouldFocusOnRender () {
    return this.input !== document.activeElement
  }

  close (becauseOfBlur) {
    const dpElement = this.pickerWrapper.firstChild
    const calElement = dpElement.firstChild

    if (!this.isVisible()) {
      return
    }

    if (calElement) {
      dpElement && dpElement.removeChild(calElement)
    }

    this.closing = true

    // if (becauseOfBlur || this.shouldFocusOnBlur()) {
    //   this.focusInput()
    // }

    // When we close, the input often gains refocus, which
    // can then launch the date picker again, so we buffer
    // a bit and don't show the date picker within N ms of closing
    setTimeout(() => {
      this.closing = false
    }, 100)

    // emit('close')
  }

  changeView (view) {
    if (this.views[view]) {
      this.picker = this.views[view]
    } else {
      this.picker = (view === 'month') ? this.views.month = new MonthPicker()
        : (view === 'year') ? this.views.year = new YearPicker() : this.views.date = new DatePicker()
    }
  }

  attachContainerEvents () {
    const wrapper = this.pickerWrapper
    const calEl = wrapper.querySelector('.dp')

    // Hack to get iOS to show active CSS states
    wrapper.ontouchstart = dateUtil.noop

    // The calender fires a blur event *every* time we redraw
    // this means we need to buffer the blur event to see if
    // it still has no focus after redrawing, and only then
    // do we return focus to the input. A possible other approach
    // would be to set context.redrawing = true on redraw and
    // set it to false in the blur event.
    // 每次重绘都会触发 blur，这里节流事件的回调
    dateUtil.on('blur', calEl, dateUtil.bufferFn(150, () => {
      if (!this.hasFocus()) {
        this.close()
      }
    }))

    dateUtil.on('keydown', wrapper, event => {
      if (event.keyCode === dateUtil.KEY.enter) {
        event.preventDefault()
        event.stopPropagation()
        this.onClick(event)
      } else {
        const operations = {
          setState: this.setState
        }
        this.picker.onKeyDown(event, operations, this.state)
      }
    })

    // If the user clicks in non-focusable space, but
    // still within the date picker, we don't want to
    // hide, so we need to hack some things...
    dateUtil.on('mousedown', calEl, event => {
      event.target.focus && event.target.focus() // IE hack
      if (document.activeElement !== event.target) {
        event.preventDefault()
        this.focusCurrent(this.picker)
      }
    })

    dateUtil.on('click', wrapper, this.onClick)
  }

  attachInputEvents () {
    const bufferShow = dateUtil.bufferFn(5, () => {
      if (!this.isVisible()) {
        this.render()
      }
    })

    const off = [
      dateUtil.on('blur', this.input, dateUtil.bufferFn(150, () => {
        if (!this.hasFocus()) {
          this.close('blur of input')
        }
      })),

      dateUtil.on('mousedown', this.input, () => {
        if (this.input === document.activeElement) {
          bufferShow()
        }
      }),

      dateUtil.on('focus', this.input, bufferShow),

      dateUtil.on('input', this.input, (e) => {
        this.updateDateByInput(e)
      })
    ]

    // 取消监听句柄
    return function () {
      off.forEach(function (f) {
        f()
      })
    }
  }

  updateDateByInput (e) {
    // date 必须满足指定的 format，默认为 yyyy-mm-DD
    // 如：2019-09-08，分隔符可能是 - 或者 /，而且必须能转换成合法日期才更新 hilightedDate
    let year = null
    let month = null
    let date = null
    // let all = null
    let matchs = null
    if (this.state.format === 'yyyy-MM-dd') {
      matchs = e.target.value.match(/(\d{4})[-|/](\d{2})[-|/](\d{2})/)
      matchs && ([, year, month, date] = matchs)
    } else if (this.state.format === 'MM-dd-yyyy') {
      matchs = e.target.value.match(/(\d{2})[-|/](\d{2})[-|/](\d{4})/)
      matchs && ([, month, date, year] = matchs)
    } else if (this.state.format === 'dd-MM-yyyy') {
      matchs = e.target.value.match(/(\d{2})[-|/](\d{2})[-|/](\d{4})/)
      matchs && ([, date, month, year] = matchs)
    }
    year = year && (year - 0)
    month = month && (month - 1)
    date = date && (date - 0)
    if (year && month > -1 && month < 12 &&
      date > -1 && date < 32) {
      this.setState({
        needRender: true,
        selectedDate: new Date(year, month, date)
      })
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

  focusInput () {
    this.input.focus()
  }

  blurInput () {
    this.input.blur()
  }

  focusCurrent () {
    const current = this.pickerWrapper.querySelector('.dp-current')
    return current && current.focus()
  }

  hasFocus () {
    const focused = document.activeElement
    return (this.pickerWrapper &&
      this.pickerWrapper.contains(focused)) || focused === this.input
  }

  adjustPosition () {
    const inputPos = this.input.getBoundingClientRect()
    const win = window

    adjustCalY(this.pickerWrapper, inputPos, win)
    adjustCalX(this.pickerWrapper, inputPos, win)

    this.pickerWrapper.style.visibility = ''
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
  const belowTop = inputPos.height + 8
  const aboveTop = inputTop - calHeight - 8
  const isAbove = (aboveTop > 0 && belowTop + calHeight > scrollTop + win.innerHeight)
  const top = isAbove ? aboveTop : belowTop

  if (wrapper.classList) {
    wrapper.classList.toggle('dp-is-above', isAbove)
    wrapper.classList.toggle('dp-is-below', !isAbove)
  }
  wrapper.style.top = top + 'px'
}

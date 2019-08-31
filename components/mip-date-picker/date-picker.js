/**
 * @file single-date-picker.js 时间选择器
 * @author miya
 *
 */
import BasePicker from './base-picker'
import dateUtil from './util'

const {util, viewer} = MIP
const { error } = util.log('mip-date-picker')

export default class DatePicker extends BasePicker {
  constructor (element, options) {
    super(element, options)
    this.element = element
    this.state = options

    this.generateWrapper = this.generateWrapper.bind(this)
    this.attachContainerEvents = this.attachContainerEvents.bind(this)
    this.attachInputEvents = this.attachInputEvents.bind(this)
    this.setState = this.setState.bind(this)
    this.hasFocus = this.hasFocus.bind(this)
    this.updateDateStyle = this.updateDateStyle.bind(this)
    this.updateDateByInput = this.updateDateByInput.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.setDate = this.setDate.bind(this)
    this.selectToday = this.selectToday.bind(this)

    this.generateWrapper()
    this.attachContainerEvents()
    this.attachInputEvents()

    // 静态模式下始终显示日历，不需要等到 input 聚焦时再显示
    if (this.state.display === 'static') {
      this.render()
      this.emitActivateEvent()
    }
  }

  generateWrapper () {
    const inputs = document.querySelectorAll(this.state.inputSelector)
    if (inputs.length === 1) {
      this.input = inputs[0]
    } else {
      error('有多个重名 input 框!')
      return
    }

    // date-picker-wrapper
    this.pickerWrapper = document.createElement('section')
    this.pickerWrapper.classList.add('dp-wrapper')
    this.pickerWrapper.tabIndex = 1
    let modeClass = this.state.display === 'overlay' ? 'dp-below' : 'dp-permanent'
    this.pickerWrapper.classList.add(modeClass)
    let pickerElement = document.createElement('section')
    pickerElement.classList.add('dp')
    this.pickerWrapper.appendChild(pickerElement)

    this.input.parentNode.appendChild(this.pickerWrapper)
  }

  setState (state) {
    let needRender
    let isClear
    for (let key in state) {
      if (key === 'selectedDate') {
        this.state.hilightedDate = state[key]
        this.updateInput(state[key])
        this.emitSelectEvent({
          date: state[key]
        })
        if (this.state.openAfterSelect) {
          if ((this.state.selectedDate && this.state.selectedDate.getMonth()) !== state[key].getMonth()) {
            needRender = true
          }
          if (this.state.view === 'date') {
            this.updateDateStyle(state[key])
          }
        } else {
          this.close()
        }
      }

      this.state[key] = state[key]

      if (key === 'needRender' || key === 'view') {
        needRender = true
      }
      if (key === 'isClear') {
        this.updateInput(null)
        this.state.selectedDate = null
        isClear = true
        if (this.state.openAfterclear) {
          this.updateDateStyle(null)
        } else {
          this.close()
        }
      }
    }
    if (needRender && !isClear) {
      this.render()
    }
  }

  updateInput (value) {
    this.input.value = value
      ? dateUtil.format(this.state.format, value)
      : ''
  }

  updateDateStyle (selectedDate) {
    Array.from(this.pickerWrapper.querySelector('.dp-days').children).forEach(element => {
      const elementDate = new Date(element.getAttribute('data-date') - 0).getTime()
      element.classList.contains('dp-selected') && element.classList.remove('dp-selected')
      element.classList.contains('dp-current') && element.classList.remove('dp-current')
      if (selectedDate && (elementDate === selectedDate.getTime())) {
        element.classList.add('dp-selected')
        element.classList.add('dp-current')
      }
    })
  }

  attachContainerEvents () {
    const wrapper = this.pickerWrapper
    const calEl = wrapper.querySelector('.dp')
    // 使 iOS 显示 active 的 css 样式
    wrapper.ontouchstart = dateUtil.noop
    // 每次重绘都会触发 blur，只有在没有焦点时才关闭
    dateUtil.on('blur', wrapper, dateUtil.bufferFn(5, () => {
      if (!this.hasFocus()) {
        this.close()
      }
    }))

    // 当用户点击日历的不可聚焦的区域时，不要关闭日历
    dateUtil.on('mousedown', calEl, event => {
      event.target.focus && event.target.focus()
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
        this.emitActivateEvent()
      }
    })

    dateUtil.on('blur', this.input, dateUtil.bufferFn(5, () => {
      if (!this.hasFocus()) {
        this.close()
      }
    }))

    dateUtil.on('mousedown', this.input, () => {
      if (this.input === document.activeElement) {
        bufferShow()
      }
    })

    dateUtil.on('focus', this.input, () => {
      bufferShow()
      this.input.focus()
    })

    dateUtil.on('input', this.input, (e) => {
      this.updateDateByInput(e)
    })
  }

  updateDateByInput (e) {
    const { isvalid, year, month, date } = this.getInputValidDate(e.target.value)
    if (isvalid) {
      this.setState({
        needRender: true,
        selectedDate: new Date(year, month, date)
      })
    }
  }

  focusInput () {
    this.input.focus()
  }

  blurInput () {
    this.input.blur()
  }

  hasFocus () {
    const focused = document.activeElement
    return (this.pickerWrapper &&
      this.pickerWrapper.contains(focused)) || focused === this.input
  }

  emitSelectEvent (event) {
    viewer.eventAction.execute('select', this.element, event)
  }

  clearInput () {
    this.setState({
      needRender: true,
      isClear: true
    })
  }

  setDate (date) {
    this.setState({
      selectedDate: dateUtil.parseToDate(date)
    })
  }

  selectToday () {
    const selectedDate = new Date(this.state.selectedDate)
    const now = new Date()
    selectedDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
    this.setState({
      selectedDate: selectedDate
    })
  }
}

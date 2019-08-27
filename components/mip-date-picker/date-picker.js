/**
 * @file single-date-picker.js 时间选择器
 * @author miya
 *
 */
import BasePicker from './base-picker'
import dateUtil from './util'

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
    let modeClass = this.state.mode === 'range-picker' ? 'dp-permanent' : 'dp-below'
    this.pickerWrapper.classList.add(modeClass)
    let pickerElement = document.createElement('section')
    pickerElement.classList.add('dp')
    this.pickerWrapper.appendChild(pickerElement)

    label.appendChild(this.input)
    label.appendChild(this.pickerWrapper)
    form.appendChild(label)

    this.element.appendChild(form)
  }

  setState (state) {
    let needRender
    // let stateChanged
    for (let key in state) {
      this.state[key] = state[key]
      if (key === 'needRender' || key === 'view') {
        needRender = true
      }
      if (key === 'isClear') {
        this.state.selectedDate = null
        this.updateInput(null)
        this.updateDateStyle(null)
      }
      if (key === 'selectedDate') {
        this.state.hilightedDate = state[key]
        this.updateInput(state[key])
        if (this.state.view === 'date') {
          this.updateDateStyle(state[key])
        }
        // this.element.dispatchEvent(new CustomEvent('select', {
        //   detail: this,
        //   bubbles: true
        // }))
      }
    }
    if (needRender) {
      this.render()
    }

    // emit('statechange')
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
      }
    })

    dateUtil.on('blur', this.input, dateUtil.bufferFn(150, () => {
      if (!this.hasFocus() && this.state.mode !== 'range-picker') {
        this.close()
      }
    }))

    dateUtil.on('mousedown', this.input, () => {
      if (this.input === document.activeElement) {
        bufferShow()
      }
    })

    dateUtil.on('focus', this.input, bufferShow)

    dateUtil.on('input', this.input, (e) => {
      this.updateDateByInput(e)
    })
  }

  updateDateByInput (e) {
    const {isvalid, year, month, date} = this.getInputValidDate(e.target.value)
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
}

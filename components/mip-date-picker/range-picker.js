/**
 * @file single-date-picker.js 时间选择器
 * @author miya
 *
 */
import './range-picker.less'
import BasePicker from './base-picker'
import dateUtil from './util'

export default class RangePicker extends BasePicker {
  constructor (element, options) {
    super(element, options)
    this.element = element
    this.state = {
      ...options,
      hoverDate: null
    }

    this.generateWrapper = this.generateWrapper.bind(this)
    this.attachContainerEvents = this.attachContainerEvents.bind(this)
    this.attachInputEvents = this.attachInputEvents.bind(this)
    this.setState = this.setState.bind(this)
    this.hasFocus = this.hasFocus.bind(this)
    this.updateDateStyle = this.updateDateStyle.bind(this)
    this.updateDateByInput = this.updateDateByInput.bind(this)
    this.updateInput = this.updateInput.bind(this)
    this.watchHoverDate = this.watchHoverDate.bind(this)
    this.updateRange = this.updateRange.bind(this)

    this.generateWrapper()
    this.attachContainerEvents()
    this.attachInputEvents()
    this.watchHoverDate()
  }

  generateWrapper () {
    // mip-form
    const form = document.createElement('mip-form')
    const label = document.createElement('label')
    label.classList.add('dp-label')
    this.startInput = document.createElement('input')
    this.startInput.classList.add('dp-start-input')
    const separator = document.createElement('p')
    separator.innerText = '~'
    this.endInput = document.createElement('input')
    this.endInput.classList.add('dp-start-input')

    // date-picker-wrapper
    this.pickerWrapper = document.createElement('section')
    let modeClass = this.state.mode === 'range-picker' ? 'dp-permanent' : 'dp-below'
    this.pickerWrapper.classList.add(modeClass)
    this.pickerWrapper.classList.add('dr-cal')
    let pickerElement = document.createElement('section')
    pickerElement.classList.add('dp')
    this.pickerWrapper.appendChild(pickerElement)

    label.appendChild(this.startInput)
    label.appendChild(separator)
    label.appendChild(this.endInput)
    label.appendChild(this.pickerWrapper)
    form.appendChild(label)

    this.element.appendChild(form)
  }

  setState (state) {
    let needRender
    for (let key in state) {
      this.state[key] = state[key]
      if (key === 'isClear') {
        needRender = true
        this.state.selectedDate = null
        this.state.start = null
        this.state.end = null
        this.updateInput()
      }
      // 切换 view 默认重绘，强制重绘通过 needRender 控制
      if (key === 'needRender' || key === 'view') {
        needRender = true
      }
      // selectedDate 当前选中的日期，无法区分是 start 还是 end
      if (key === 'selectedDate') {
        this.focusCurrent()
        this.updateRange(state[key])
      }
    }

    if (needRender) {
      this.render()
    }
    if (this.state.view === 'date') {
      this.updateDateStyle()
    }

    // emit('statechange')
  }

  updateInput () {
    this.startInput.value = this.state.start ? dateUtil.format(this.state.format, this.state.start) : ''
    this.endInput.value = this.state.end ? dateUtil.format(this.state.format, this.state.end) : ''
  }

  updateRange (value) {
    if (!value) {
      return
    }
    if (!this.state.start || value.getTime() < this.state.start.getTime()) {
      this.setState({
        start: value,
        end: undefined,
        hilightedDate: value
      })
    } else {
      this.setState({
        end: value,
        hilightedDate: value
      })
    }

    this.updateInput()
  }

  updateDateStyle () {
    const days = this.pickerWrapper.querySelector('.dp-days')
    if (!days) {
      return
    }
    Array.from(days.children).forEach(element => {
      const elementDate = new Date(element.getAttribute('data-date') - 0)
      const {start, end, hoverDate} = this.state
      element.classList.contains('dp-selected') && element.classList.remove('dp-selected')
      if ((end || hoverDate) &&
        start &&
        inRange(elementDate, end || hoverDate, start)) {
        element.classList.add('dr-in-range')
      } else {
        element.classList.contains('dr-in-range') && element.classList.remove('dr-in-range')
      }

      if (dateUtil.datesEq(elementDate, start) || dateUtil.datesEq(elementDate, end)) {
        element.classList.add('dr-selected')
      } else {
        element.classList.contains('dr-selected') && element.classList.remove('dr-selected')
      }
    })
  }

  watchHoverDate () {
    // 防止 iOS 需要双击选择的问题
    if (!/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      this.pickerWrapper.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('dp-day')) {
          const dt = new Date(parseInt(e.target.dataset.date))
          const changed = !dateUtil.datesEq(dt, this.state.hoverDate)

          if (changed) {
            this.setState({
              hoverDate: dt
            })
          }
        }
      })
    }
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

    // 当用户点击日历上的不可聚焦的区域时，不要关闭日历
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
        this.updateDateStyle()
      }
    })
    const bufferClose = dateUtil.bufferFn(5, () => {
      if (!this.hasFocus()) {
        this.close()
      }
    })

    dateUtil.on('blur', this.startInput, bufferClose)
    dateUtil.on('blur', this.endInput, bufferClose)

    dateUtil.on('mousedown', this.startInput, () => {
      if (this.startInput === document.activeElement) {
        bufferShow()
      }
    })
    dateUtil.on('mousedown', this.endInput, () => {
      if (this.endInput === document.activeElement) {
        bufferShow()
      }
    })

    dateUtil.on('focus', this.startInput, (e) => {
      bufferShow()
      // render 之后会失焦
      this.startInput.focus()
    })
    dateUtil.on('focus', this.endInput, (e) => {
      bufferShow()
      this.endInput.focus()
    })

    dateUtil.on('input', this.startInput, (e) => {
      this.updateDateByInput(e)
    })
    dateUtil.on('input', this.endInput, (e) => {
      this.updateDateByInput(e)
    })
  }

  updateDateByInput (e) {
    const {isvalid, year, month, date} = this.getInputValidDate(e.target.value)
    if (isvalid) {
      if (e.target === this.startInput) {
        this.setState({
          needRender: true,
          start: new Date(year, month, date)
        })
      } else if (e.target === this.endInput) {
        this.setState({
          needRender: true,
          end: new Date(year, month, date)
        })
      }
    }
  }

  hasFocus () {
    const focused = document.activeElement
    return (this.pickerWrapper &&
      this.pickerWrapper.contains(focused)) ||
      focused === this.startInput ||
      focused === this.endInput
  }
}

function inRange (dt, start, end) {
  return (dt < end && dt >= start) || (dt <= start && dt > end)
}

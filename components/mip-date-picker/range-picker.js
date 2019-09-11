/**
 * @file range-picker.js 时间选择器
 * @author miya
 *
 */
import './range-picker.less'
import BasePicker from './base-picker'
import dateUtil from './util'

const {util, viewer} = MIP
const { error } = util.log('mip-date-picker')

export default class RangePicker extends BasePicker {
  constructor (element, options) {
    super(element, options)
    this.element = element
    this.state = {
      ...options,
      hoverDate: null
    }

    this.setState = this.setState.bind(this)
    this.updateBlurStatus = this.updateBlurStatus.bind(this)

    this.generateWrapper()
    this.attachContainerEvents()
    this.attachInputEvents()
    this.watchHoverDate()
    this.updateBlurStatus()

    // 静态模式下始终显示日历，不需要等到 input 聚焦时再显示
    if (this.state.display === 'static') {
      this.render()
      this.emitActivateEvent()
    }
  }

  generateWrapper () {
    const startInputs = document.querySelectorAll(this.state.startInputSelector)
    if (startInputs.length === 1) {
      this.startInput = startInputs[0]
    } else {
      error('有多个重名 startInput 框!')
      return
    }

    const endInputs = document.querySelectorAll(this.state.endInputSelector)
    if (endInputs.length === 1) {
      this.endInput = endInputs[0]
    } else {
      error('有多个重名 endInputs 框!')
      return
    }

    // date-picker-wrapper
    this.pickerWrapper = document.createElement('section')
    let modeClass = this.state.display === 'overlay' ? 'dp-below' : 'dp-permanent'
    this.pickerWrapper.tabIndex = 1
    this.pickerWrapper.classList.add(modeClass)
    this.pickerWrapper.classList.add('dr-cal')
    let pickerElement = document.createElement('section')
    pickerElement.classList.add('dp')
    this.pickerWrapper.appendChild(pickerElement)

    this.startInput.parentNode.appendChild(this.pickerWrapper)
  }

  setState (state) {
    let needRender
    let isClear
    for (let key in state) {
      this.state[key] = state[key]

      // 切换 view 默认重绘，强制重绘通过 needRender 控制
      if (key === 'needRender' || key === 'view') {
        needRender = true
      }
      if (key === 'isClear') {
        needRender = true
        isClear = true
        this.state.selectedDate = null
        this.state.start = null
        this.state.end = null
        this.state.hoverDate = null
        this.updateInput()
        if (this.state.openAfterclear) {
          this.updateDateStyle()
        } else {
          this.close()
        }
      }
      // selectedDate 当前选中的日期，无法区分是 start 还是 end
      if (key === 'selectedDate') {
        this.state.hilightedDate = state[key]
        this.state.hoverDate = null
        this.focusCurrent()
        this.updateRange(state[key])

        const isBothSelected = this.state.start && this.state.end
        if (isBothSelected) {
          this.emitSelectEvent({
            selectedDate: state[key],
            start: this.state.start,
            end: this.state.end
          })
        }
        if (!this.state.openAfterSelect && isBothSelected && this.state.display !== 'static') {
          this.close()
        }
      }
    }

    if (this.isVisible() && needRender && !isClear) {
      this.render()
    }

    if (this.state.view === 'date') {
      this.updateDateStyle()
    }
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
      const { start, end, hoverDate } = this.state
      element.classList.contains('dp-selected') && element.classList.remove('dp-selected')
      if ((end || hoverDate) &&
        start &&
        dateUtil.inRange(elementDate, start, end || hoverDate)) {
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

  // iOS 下点击选择器外围不会触发 blur 事件，这里更新 activeElement
  updateBlurStatus () {
    document.addEventListener('touchstart', (e) => {
      if (this.pickerWrapper &&
        !this.pickerWrapper.contains(e.target) &&
        e.target !== this.startInput &&
        e.target !== this.endInput) {
        this.pickerWrapper.blur()
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

    // 当用户点击日历上的不可聚焦的区域时，不要关闭日历
    dateUtil.on('mousedown', calEl, event => {
      event.target.focus && event.target.focus()
      if (document.activeElement !== event.target) {
        event.preventDefault()
        this.focusCurrent()
      }
    })

    dateUtil.on('click', wrapper, this.onClick)
  }

  attachInputEvents () {
    const bufferShow = dateUtil.bufferFn(5, () => {
      if (!this.isVisible()) {
        this.render()
        this.updateDateStyle()
        this.emitActivateEvent()
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
    const { isvalid, year, month, date } = this.getInputValidDate(e.target.value)
    if (isvalid) {
      if (e.target === this.startInput) {
        this.setState({
          needRender: true,
          selectedDate: new Date(year, month, date),
          start: new Date(year, month, date)
        })
      } else if (e.target === this.endInput) {
        this.setState({
          needRender: true,
          selectedDate: new Date(year, month, date),
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

  emitSelectEvent (event) {
    viewer.eventAction.execute('select', this.element, event)
  }

  clearInput () {
    this.setState({
      needRender: true,
      isClear: true
    })
  }

  setDates (date) {
    // 先清空再设置，根据 updateRange 的逻辑防止用户选了 start 之后更新的全是 end
    this.setState({
      isClear: true
    })
    this.setState({
      selectedDate: dateUtil.parseToDate(date.start)
    })
    this.setState({
      selectedDate: dateUtil.parseToDate(date.end)
    })
  }
}

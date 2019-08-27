/**
 * @file day-picker.js 日期选择器
 * @author miya
 *
 */

import { CALENDAR } from '../constants'
import dateUtil from '../util'

export default class DayPicker {
  constructor () {
    this.onClick = {
      'dp-day': this.selectDay,
      'dp-next': this.gotoNextMonth,
      'dp-prev': this.gotoPrevMonth,
      'dp-today': this.selectToday,
      'dp-clear': this.clear,
      'dp-close': this.close,
      'dp-cal-month': this.showMonthPicker,
      'dp-cal-year': this.showYearPicker
    }

    this.render = this.render.bind(this)
    this.mapDays = this.mapDays.bind(this)
    this.inRange = this.inRange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  render (opts) {
    const dayNames = CALENDAR.days
    const selectedDate = opts.selectedDate
    const hilightedDate = opts.hilightedDate
    const hilightedMonth = hilightedDate && hilightedDate.getMonth()
    const dayOffset = opts.dayOffset
    const minDate = opts.minDate
    const maxDate = opts.maxDate
    const today = dateUtil.pureDate().getTime()

    return (
      '<section class="dp-cal">' +
        '<header class="dp-cal-header">' +
          '<button tabindex="-1" type="button" class="dp-prev">Prev</button>' +
          '<button tabindex="-1" type="button" class="dp-cal-month">' +
            CALENDAR.months[hilightedMonth] +
          '</button>' +
          '<button tabindex="-1" type="button" class="dp-cal-year">' +
            hilightedDate.getFullYear() +
          '</button>' +
          '<button tabindex="-1" type="button" class="dp-next">Next</button>' +
        '</header>' +
        '<section class="dp-days">' +
          dayNames.map((name, index) => {
            return (
              '<span class="dp-col-header">' + dayNames[(index + dayOffset) % dayNames.length] + '</span>'
            )
          }).join('') +
          this.mapDays(hilightedDate, dayOffset, date => {
            const isNotInMonth = date.getMonth() !== hilightedMonth
            const isDisabled = !this.inRange(date, minDate, maxDate)
            const pureDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const isToday = pureDate.getTime() === today
            let className = 'dp-day'
            className += (isNotInMonth ? ' dp-edge-day' : '')
            className += (dateUtil.datesEq(date, hilightedDate) ? ' dp-current' : '')
            className += (dateUtil.datesEq(date, selectedDate) ? ' dp-selected' : '')
            className += (isDisabled ? ' dp-day-disabled' : '')
            className += (isToday ? ' dp-day-today' : '')

            return (
              '<button tabindex="-1" type="button" class="' + className + '" data-date="' + date.getTime() + '">' +
                date.getDate() +
              '</button>'
            )
          }) +
        '</section>' +
        '<footer class="dp-cal-footer">' +
          '<button tabindex="-1" type="button" class="dp-today">' + CALENDAR.today + '</button>' +
          '<button tabindex="-1" type="button" class="dp-clear">' + CALENDAR.clear + '</button>' +
          '<button tabindex="-1" type="button" class="dp-close">' + CALENDAR.close + '</button>' +
        '</footer>' +
      '</section>'
    )
  }

  mapDays (currentDate, dayOffset, cb) {
    let result = ''
    let iter = new Date(currentDate)
    // 根据当前月份的 1 号是周几确定日历的第一个日期是几号
    iter.setDate(1)
    iter.setDate(1 - iter.getDay() + dayOffset)

    // 当把周一设置为日历的第一天时：
    // 若果当前月份的周一是 2 号，也就是当前月的 1 号是周日，在现在的计算方式下 1 号会被顶"上去"无法显示
    // 这里再向前偏移一周，使得上述情况 1 号可以位于日历中
    if (dayOffset && iter.getDate() === dayOffset + 1) {
      iter.setDate(dayOffset - 6)
    }

    // 为美观，每页日历显示 6 周
    for (let day = 0; day < (6 * 7); ++day) {
      result += cb(iter)
      iter.setDate(iter.getDate() + 1)
    }

    return result
  }

  inRange (date, minDate, maxDate) {
    return minDate.getTime() <= date.getTime() && maxDate.getTime() >= date.getTime()
  }

  selectDay (event, operations) {
    operations.setState({
      selectedDate: new Date(parseInt(event.target.getAttribute('data-date')))
    })
  }

  onKeyDown (e, operations, state) {
    let key = e.keyCode
    let shiftBy = (key === dateUtil.KEY.left) ? -1
      : (key === dateUtil.KEY.right) ? 1
        : (key === dateUtil.KEY.up) ? -7
          : (key === dateUtil.KEY.down) ? 7
            : 0

    if (key === dateUtil.KEY.esc) {
      operations.close()
    } else if (shiftBy) {
      e.preventDefault()
      operations.setState({
        needRender: true,
        hilightedDate: dateUtil.shiftDay(state.hilightedDate, shiftBy)
      })
    }
  }

  selectToday (e, operations, state) {
    const selectedDate = new Date(state.selectedDate)
    const now = new Date()
    selectedDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate())
    operations.setState({
      selectedDate: selectedDate
    })
  }

  clear (e, operations) {
    operations.setState({
      isClear: true
    })
  }

  close (e, operations) {
    const bufferClose = dateUtil.bufferFn(5, () => {
      operations.close()
    })
    bufferClose()
  }

  showMonthPicker (e, operations) {
    operations.setState({
      view: 'month'
    })
  }

  showYearPicker (e, operations) {
    operations.setState({
      view: 'year'
    })
  }

  gotoNextMonth (e, operations, state) {
    let hilightedDate = state.hilightedDate
    operations.setState({
      needRender: true,
      hilightedDate: dateUtil.shiftMonth(hilightedDate, 1)
    })
  }

  gotoPrevMonth (e, operations, state) {
    let hilightedDate = state.hilightedDate
    operations.setState({
      needRender: true,
      hilightedDate: dateUtil.shiftMonth(hilightedDate, -1)
    })
  }
}

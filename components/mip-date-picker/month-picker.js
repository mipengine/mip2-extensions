/**
 * @file mip-date-picker.js 月份选择器
 * @author miya
 *
 */

import { CALENDAR } from './constants'
import dateUtil from './util'

export default class MonthPicker {
  constructor () {
    this.onClick = {
      'dp-month': this.onChooseMonth
    }

    this.render = this.render.bind(this)
    this.onChooseMonth = this.onChooseMonth.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  render (opts) {
    const months = CALENDAR.months
    const currentDate = opts.hilightedDate
    const currentMonth = currentDate.getMonth()

    return (
      '<section class="dp-months">' +
        months.map(function (month, i) {
          let className = 'dp-month'
          className += (currentMonth === i ? ' dp-current' : '')

          return (
            '<button tabindex="-1" type="button" class="' + className + '" data-month="' + i + '">' +
              month +
            '</button>'
          )
        }).join('') +
      '</section>'
    )
  }

  onChooseMonth (e, operations, state) {
    operations.setState({
      hilightedDate: dateUtil.setMonth(state.hilightedDate, parseInt(e.target.getAttribute('data-month'))),
      view: 'date'
    })
  }

  onKeyDown (e, operations, state) {
    const key = e.keyCode
    const shiftBy = (key === dateUtil.KEY.left) ? -1
      : (key === dateUtil.KEY.right) ? 1
        : (key === dateUtil.KEY.up) ? -3
          : (key === dateUtil.KEY.down) ? 3
            : 0

    if (key === dateUtil.KEY.esc) {
      operations.setState({
        view: 'date'
      })
    } else if (shiftBy) {
      e.preventDefault()
      operations.setState({
        hilightedDate: dateUtil.shiftMonth(state.hilightedDate, shiftBy, true)
      })
    }
  }
}

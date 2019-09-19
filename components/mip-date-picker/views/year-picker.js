/**
 * @file year-picker.js 年份选择器
 * @author miya
 *
 */

import dateUtil from '../util'

export default class YearPicker {
  constructor () {
    this.onClick = {
      'dp-year': this.onChooseYear
    }

    this.render = this.render.bind(this)
    this.mapYears = this.mapYears.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  render (opts) {
    const minDate = opts.minDate
    const maxDate = opts.maxDate
    const currentYear = opts.hilightedDate.getFullYear()

    return (
      '<section class="dp-years">' +
        this.mapYears(minDate, maxDate, function (year) {
          let className = 'dp-year'
          className += (year === currentYear ? ' dp-current dp-selected' : '')

          return (
            '<button tabindex="-1" type="button" class="' + className + '" data-year="' + year + '">' +
              year +
            '</button>'
          )
        }) +
      '</section>'
    )
  }

  onKeyDown (e, operations, state) {
    const key = e.keyCode
    const shiftBy = (key === dateUtil.KEY.left || key === dateUtil.KEY.up) ? 1
      : (key === dateUtil.KEY.right || key === dateUtil.KEY.down) ? -1
        : 0

    if (key === dateUtil.KEY.esc) {
      operations.setState({
        needRender: true,
        view: 'date'
      })
    } else if (shiftBy) {
      e.preventDefault()
      const shiftedYear = dateUtil.shiftYear(state.hilightedDate, shiftBy)

      operations.setState({
        needRender: true,
        hilightedDate: dateUtil.constrainDate(shiftedYear, state.minDate, state.maxDate)
      })
    }
  }

  onChooseYear (e, operations, state) {
    operations.setState({
      needRender: true,
      hilightedDate: dateUtil.setYear(state.hilightedDate, parseInt(e.target.getAttribute('data-year'))),
      view: 'date'
    })
  }

  mapYears (minDate, maxDate, fn) {
    let result = ''
    const max = maxDate.getFullYear()

    for (let i = max; i >= minDate.getFullYear(); --i) {
      result += fn(i)
    }

    return result
  }
}

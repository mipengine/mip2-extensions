/**
 * @file mip-date-display.js 日期显示组件
 * @author panwenshuang
 *
 */

let {
  CustomElement,
  templates
} = MIP

/** @const {string} */
const DEFAULT_LOCALE = 'zh-cn'

/** @const {number} */
const DEFAULT_OFFSET_SECONDS = 0

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
}} */
let VariablesDef

/** @typedef {{
  year: number,
  month: number,
  monthName: string,
  monthNameShort: string,
  day: number,
  dayName: string,
  dayNameShort: string,
  hour: number,
  minute: number,
  second: number,
  iso: string,
  yearTwoDigit: string,
  monthTwoDigit: string,
  dayTwoDigit: string,
  hourTwoDigit: string,
  hour12: string,
  hour12TwoDigit: string,
  minuteTwoDigit: string,
  secondTwoDigit: string,
  dayPeriod: string,
 }} */
let EnhancedVariablesDef

export default class MIPDateDisplay extends CustomElement {
  build () {
    this.container = this.element.ownerDocument.createElement('div')
    this.element.appendChild(this.container)
    // Note: One of datetime, timestamp-ms, timestamp-seconds is required.
    this.datetime = this.element.getAttribute('datetime') || ''
    this.timestampSeconds = Number(this.element.getAttribute('timestamp-seconds'))
    this.timestampMiliseconds = Number(this.element.getAttribute('timestamp-ms'))
    this.displayIn = this.element.getAttribute('display-in') || ''
    this.offsetSeconds =
      Number(this.element.getAttribute('offset-seconds')) ||
      DEFAULT_OFFSET_SECONDS
    this.locale = this.element.getAttribute('locale') || DEFAULT_LOCALE
    const data = this.getDataForTemplate()
    this.renderTemplate(data)
  }

  /**
   * renderTemplate 获取模版
   *
   * @param {Object} data 渲染数据
   */
  renderTemplate (data) {
    if (data) {
      templates.render(this.element, data).then(render.bind(this))
    } else {
      console.error('数据不符合规范')
    }
  }

  /**
   * get data for template 获取模板数据
   *
   * @returns {!EnhancedVariablesDef}
   */
  getDataForTemplate () {
    const targetTime = this.getTargetTime()
    const offset = this.offsetSeconds * 1000
    const date = new Date(targetTime + offset)
    const inUTC = this.displayIn.toLowerCase() === 'utc'
    const basicData = inUTC
      ? this.getVariablesInUTC(date, this.locale)
      : this.getVariablesInLocal(date, this.locale)

    return this.enhanceBasicVariables(basicData)
  }

  /**
   * getTargetTime 获取目标时间
   *
   * @returns {number|undefined}
   * @private
   */
  getTargetTime () {
    let targetTime

    if (this.datetime.toLowerCase() === 'now') {
      targetTime = Date.now()
    } else if (this.datetime) {
      targetTime = Date.parse(this.datetime)
    } else if (this.timestampMiliseconds) {
      targetTime = +this.timestampMiliseconds
    } else if (this.timestampSeconds) {
      targetTime = this.timestampSeconds * 1000
    }

    if (targetTime === undefined) {
      console.log('One of datetime, timestamp-ms, or timestamp-seconds is required')
    }

    return targetTime
  }

  /**
   * get variables in utc 获取utc下的时间数据
   *
   * @param {!Date} date 目标时间
   * @param {string} locale 语言
   * @returns {!VariablesDef} 返回值需遵循 VariablesDef 的类型
   * @private
   */
  getVariablesInUTC (date, locale) {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      monthName: date.toLocaleDateString(locale, {
        month: 'long',
        timeZone: 'UTC'
      }),
      monthNameShort: date.toLocaleDateString(locale, {
        month: 'short',
        timeZone: 'UTC'
      }),
      day: date.getUTCDate(),
      dayName: date.toLocaleDateString(locale, {
        weekday: 'long',
        timeZone: 'UTC'
      }),
      dayNameShort: date.toLocaleDateString(locale, {
        weekday: 'short',
        timeZone: 'UTC'
      }),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
      iso: date.toISOString()
    }
  }

  /**
   * get variables in local 获取本地区时间数据
   *
   * @param {!Date} date
   * @param {string} locale
   * @returns {!VariablesDef}
   * @private
   */
  getVariablesInLocal (date, locale) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      monthName: date.toLocaleDateString(locale, {month: 'long'}),
      monthNameShort: date.toLocaleDateString(locale, {
        month: 'short'
      }),
      day: date.getDate(),
      dayName: date.toLocaleDateString(locale, {weekday: 'long'}),
      dayNameShort: date.toLocaleDateString(locale, {
        weekday: 'short'
      }),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      iso: date.toISOString()
    }
  }

  /**
   * 获取附加时间数据，如12小时制下是时间等
   *
   * @param {!VariablesDef} data
   * @returns {!EnhancedVariablesDef}
   * @private
   */
  enhanceBasicVariables (data) {
    const hour12 = data.hour % 12 || 12

    return /** @type {!EnhancedVariablesDef} */(
      Object.assign({}, data, {
        yearTwoDigit: this.padStart(data.year % 100),
        monthTwoDigit: this.padStart(data.month),
        dayTwoDigit: this.padStart(data.day),
        hourTwoDigit: this.padStart(data.hour),
        hour12,
        hour12TwoDigit: this.padStart(hour12),
        minuteTwoDigit: this.padStart(data.minute),
        secondTwoDigit: this.padStart(data.second),
        dayPeriod: data.hour < 12 ? 'am' : 'pm'
      }))
  }

  /**
   * pad start
   *
   * @param {number} input input
   * @returns {string} pad string
   * @private
   */
  padStart (input) {
    if (input > 9) {
      return input.toString()
    }

    return '0' + input
  }
}

/**
 * render dom 渲染函数
 *
 * @param {Array} htmls html对象数组
 */
function render (htmls) {
  removeChildren(this.container)
  let node = document.createElement('div')
  node.innerHTML = htmls
  this.container.appendChild(node)
}

/**
 * remove children 删除子元素
 *
 * @param {!Element} element html元素
 */
function removeChildren (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

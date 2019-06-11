/**
 * @file mip-date-display.js 日期显示组件
 * @author panwenshuang
 *
 */

/// <reference types="../.." />

const {
  CustomElement,
  templates,
  util
} = MIP

const {error, log} = util.log('mip-date-display')

const DEFAULT_LOCALE: string = 'zh-cn'

const DEFAULT_OFFSET_SECONDS: number = 0

interface VariablesDef {
  year: number;
  month: number;
  monthName: string;
  monthNameShort: string;
  day: number;
  dayName: string;
  dayNameShort: string;
  hour: number;
  minute: number;
  second: number;
  iso: string;
}

interface EnhancedVariablesDef {
  year: number;
  month: number;
  monthName: string;
  monthNameShort: string;
  day: number;
  dayName: string;
  dayNameShort: string;
  hour: number;
  minute: number;
  second: number;
  iso: string;
  yearTwoDigit: string;
  monthTwoDigit: string;
  dayTwoDigit: string;
  hourTwoDigit: string;
  hour12: string;
  hour12TwoDigit: string;
  minuteTwoDigit: string;
  secondTwoDigit: string;
  dayPeriod: string;
}

export default class MIPDateDisplay extends CustomElement {
  private container: HTMLElement | null = null
  public datetime: string = ''
  public timestampSeconds: number = 0
  public timestampMiliseconds: number = 0
  public displayIn: string = ''
  public offsetSeconds: number = 0
  public locale: string = ''


  public constructor (private element: HTMLElement) {
    super(element)
    this.render = this.render.bind(this)
  }

  public build () {
    if(!this.element.ownerDocument) {
      return
    }
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
    const data: EnhancedVariablesDef = this.getDataForTemplate()
    this.renderTemplate(data)
  }

  /**
   * renderTemplate 获取模版
   */
  private renderTemplate (data: EnhancedVariablesDef) {
    if (data) {
      templates.render(this.element, data).then(this.render)
    } else {
      error(this.element, data, '数据不符合规范')
    }
  }

  /**
   * get data for template 获取模板数据
   */
  private getDataForTemplate (): EnhancedVariablesDef {
    const targetTime: number = this.getTargetTime()
    const offset: number = this.offsetSeconds * 1000
    const date: Date = new Date(targetTime + offset)
    const inUTC: boolean = this.displayIn.toLowerCase() === 'utc'
    const basicData: VariablesDef = inUTC
      ? this.getVariablesInUTC(date, this.locale)
      : this.getVariablesInLocal(date, this.locale)

    return this.enhanceBasicVariables(basicData)
  }

  /**
   * 获取目标时间
   */
  private getTargetTime (): number {
    // 若时间都未声明，则默认为1970.01.01
    let targetTime: number = 0
    if (this.datetime.toLowerCase() === 'now') {
      targetTime = Date.now()
    } else if (this.datetime) {
      targetTime = Date.parse(this.datetime)
    } else if (this.timestampMiliseconds) {
      targetTime = this.timestampMiliseconds
    } else if (this.timestampSeconds) {
      targetTime = this.timestampSeconds * 1000
    }

    if (targetTime === 0) {
      error('One of datetime, timestamp-ms, or timestamp-seconds is required')
    }

    return targetTime
  }

  /**
   * get variables in utc 获取utc下的时间数据
   *
   * @param {!Date} date 目标时间
   * @param {string} locale 语言
   * @returns {!VariablesDef} VariablesDef 的类型
   */
  private getVariablesInUTC (date: Date, locale: string): VariablesDef {
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
   */
  private getVariablesInLocal (date: Date, locale: string): VariablesDef {
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
   */
  private enhanceBasicVariables (data: VariablesDef): EnhancedVariablesDef {
    const hour12: number = data.hour % 12 || 12

    return Object.assign({}, data, {
        yearTwoDigit: this.padStart(data.year % 100),
        monthTwoDigit: this.padStart(data.month),
        dayTwoDigit: this.padStart(data.day),
        hourTwoDigit: this.padStart(data.hour),
        hour12: hour12 + '',
        hour12TwoDigit: this.padStart(hour12),
        minuteTwoDigit: this.padStart(data.minute),
        secondTwoDigit: this.padStart(data.second),
        dayPeriod: data.hour < 12 ? 'am' : 'pm'
      })
  }

  /**
   * pad start
   */
  private padStart (input: number): string {
    if (input > 9) {
      return input.toString()
    }

    return '0' + input
  }

  /**
   * render dom 渲染函数
   */
  private render (htmls: string) {
    let node: HTMLElement = document.createElement('div')
    node.innerHTML = htmls
    if (!this.container) {
      return
    }
    this.container.appendChild(node)
  }
}

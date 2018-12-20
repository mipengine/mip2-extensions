let {
  CustomElement,
  templates,
  viewer
} = MIP

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000
const MILLISECONDS_IN_HOUR = 60 * 60 * 1000
const MILLISECONDS_IN_MINUTE = 60 * 1000
const MILLISECONDS_IN_SECOND = 1000

const LOCALE_WORD = {
  'de': ['Jahren', 'Monaten', 'Tagen', 'Stunden', 'Minuten', 'Sekunden'],
  'en': ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'],
  'es': ['años', 'meses', 'días', 'horas', 'minutos', 'segundos'],
  'fr': ['ans', 'mois', 'jours', 'heures', 'minutes', 'secondes'],
  'id': ['tahun', 'bulan', 'hari', 'jam', 'menit', 'detik'],
  'it': ['anni', 'mesi', 'giorni', 'ore', 'minuti', 'secondi'],
  'ja': ['年', 'ヶ月', '日', '時間', '分', '秒'],
  'ko': ['년', '달', '일', '시간', '분', '초'],
  'nl': ['jaar', 'maanden', 'dagen', 'uur', 'minuten', 'seconden'],
  'pt': ['anos', 'meses', 'dias', 'horas', 'minutos', 'segundos'],
  'ru': ['год', 'месяц', 'день', 'час', 'минута', 'секунда'],
  'th': ['ปี', 'เดือน', 'วัน', 'ชั่วโมง', 'นาที', 'วินาที'],
  'tr': ['yıl', 'ay', 'gün', 'saat', 'dakika', 'saniye'],
  'vi': ['năm', 'tháng', 'ngày', 'giờ', 'phút', 'giây'],
  'zh-cn': ['年', '月', '天', '小时', '分钟', '秒'],
  'zh-tw': ['年', '月', '天', '小時', '分鐘', '秒']
}

export default class MIPDateCountDown extends CustomElement {
  build () {
    this.endDate = this.element.getAttribute('end-date')
    this.timeleftMs = +this.element.getAttribute('timeleft-ms')
    this.timestampMs = this.element.getAttribute('timestamp-ms')
    this.timestampSeconds = this.element.getAttribute('timestamp-seconds')
    this.offsetSeconds = this.element.getAttribute('offset-seconds') || 0
    this.locale = this.element.getAttribute('locale') || 'zh-cn'
    this.whenEnded = this.element.getAttribute('when-ended') || 'stop'
    this.biggestUnit = (this.element.getAttribute('biggest-unit') || 'days').toUpperCase()
    this.localeWordList = this.getLocaleWord(this.locale)
    this.wrapper = document.createElement('div')
    this.wrapper.className = 'mip-date-countdown-wrapper'
    this.element.appendChild(this.wrapper)

    let tarTime = this.getTargetTime() + this.offsetSeconds * 1000
    let between = new Date(tarTime) - new Date() - 1000

    this.countDownTimer = setInterval(() => {
      this.tick(between)
      between -= 1000
    }, 1000)
  }

  disconnectedCallback () {
    clearInterval(this.countDownTimer)
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

  tick (between) {
    let diff = this.getYDHMSFromMs(between) || {}

    if (this.whenEnded === 'stop' && between < 1000) {
      // stop count down and trigger event
      viewer.eventAction.execute('timeout', this.element, {})
      clearInterval(this.countDownTimer)
    }

    let data = Object.assign(diff, this.localeWordList)

    this.renderTemplate(data)
  }

  getTargetTime () {
    let targetTime

    if (this.endDate) {
      targetTime = Date.parse(this.endDate)
    } else if (this.timeleftMs) {
      targetTime = Number(new Date()) + this.timeleftMs
    } else if (this.timestampMs) {
      targetTime = +this.timestampMs
    } else if (this.timestampSeconds) {
      targetTime = this.timestampSeconds * 1000
    }

    if (isNaN(targetTime)) {
      console.log('One of end-date, timeleft-ms, timestamp-ms, timestamp-seconds is required')
    }

    return targetTime
  }

  /**
   * get YDHMS From Ms
   *
   * @param {number} ms time(ms)
   * @returns {Object} date object
   */
  getYDHMSFromMs (ms) {
    const TimeUnit = {
      DAYS: 1,
      HOURS: 2,
      MINUTES: 3,
      SECONDS: 4
    }
    // Math.trunc is used instead of Math.floor to support negative past date
    const d = TimeUnit[this.biggestUnit] === TimeUnit.DAYS
      ? this.supportBackDate(Math.floor((ms) / MILLISECONDS_IN_DAY))
      : 0
    const h = TimeUnit[this.biggestUnit] === TimeUnit.HOURS
      ? this.supportBackDate(Math.floor((ms) / MILLISECONDS_IN_HOUR))
      : TimeUnit[this.biggestUnit] < TimeUnit.HOURS
        ? this.supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_DAY) / MILLISECONDS_IN_HOUR))
        : 0
    const m = TimeUnit[this.biggestUnit] === TimeUnit.MINUTES
      ? this.supportBackDate(Math.floor((ms) / MILLISECONDS_IN_MINUTE))
      : TimeUnit[this.biggestUnit] < TimeUnit.MINUTES
        ? this.supportBackDate(
          Math.floor((ms % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE))
        : 0
    const s = TimeUnit[this.biggestUnit] === TimeUnit.SECONDS
      ? this.supportBackDate(Math.floor((ms) / MILLISECONDS_IN_SECOND))
      : this.supportBackDate(
        Math.floor((ms % MILLISECONDS_IN_MINUTE) / MILLISECONDS_IN_SECOND))

    return {
      d,
      dd: this.padStart(d),
      h,
      hh: this.padStart(h),
      m,
      mm: this.padStart(m),
      s,
      ss: this.padStart(s)
    }
  }

  /**
   * pad start
   *
   * @param {number} input input
   * @returns {string} pad string
   * @private
   */
  padStart (input) {
    if (input < -9 || input > 9) {
      return String(input)
    }
    if (input >= -9 && input < 0) {
      return '-0' + Math.abs(input)
    }

    return '0' + input
  }

  /**
   * support back date
   *
   * @param {number} input input
   * @returns {number} dealed input
   * @private
   */
  supportBackDate (input) {
    if (input < 0) {
      return input + 1
    }

    return input
  }

  getLocaleWord (locale) {
    if (LOCALE_WORD[locale]) {
      const localeWordList = LOCALE_WORD[locale]
      return {
        'years': localeWordList[0],
        'months': localeWordList[1],
        'days': localeWordList[2],
        'hours': localeWordList[3],
        'minutes': localeWordList[4],
        'seconds': localeWordList[5]
      }
    } else {
      console.error(`Invalid locale '${locale}', return empty locale word`)
      return {}
    }
  }
}

/**
 * render dom渲染函数
 *
 * @param {Array} htmls html对象数组
 */
function render (htmls) {
  removeChildren(this.wrapper)
  let node = document.createElement('div')
  node.innerHTML = htmls
  this.wrapper.appendChild(node)
}

function removeChildren (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

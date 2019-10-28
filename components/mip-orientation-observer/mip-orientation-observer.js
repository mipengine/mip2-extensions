
const {CustomElement, util, viewer} = MIP
const {warn} = util.log('mip-orientation-observer')
const {raf} = util.fn

export default class MIPOrientationOberver extends CustomElement {
  constructor (element) {
    super(element)
    this.alphaRange = undefined
    this.betaRange = undefined
    this.gammaRange = undefined
  }

  firstInviewCallback () {
    if (!window.DeviceOrientationEvent) {
      warn('当前浏览器不支持 window.DeviceOrientationEvent')
      return
    }

    this.alphaRange = this.parseAttributes('alpha-range', this.alphaRange)
    this.betaRange = this.parseAttributes('beta-range', this.betaRange)
    this.gammaRange = this.parseAttributes('gamma-range', this.gammaRange)
    this.duration = this.element.getAttribute('duration') || 0
    window.addEventListener('deviceorientation', event => {
      raf(() => {
        this.deviceOrientationHandler(event)
      })
    }, true)
  }

  parseAttributes (rangeName, originalRange) {
    const providedRange = this.element.getAttribute(rangeName)
    if (providedRange) {
      const rangeArray = providedRange.trim().split(' ')
      return [parseInt(rangeArray[0], 10), parseInt(rangeArray[1], 10)]
    }
    return originalRange
  }

  deviceOrientationHandler (event) {
    if (event instanceof DeviceOrientationEvent) {
      const canTirggerAlpha = this.canTirgger('alpha', event.alpha)
      if (canTirggerAlpha) {
        this.triggerEvent('alpha', event.alpha, this.alphaRange)
      }
      const canTirggerBeta = this.canTirgger('beta', event.beta)
      if (canTirggerBeta) {
        this.triggerEvent('beta', event.beta, this.betaRange)
      }
      const canTirggerGamma = this.canTirgger('gamma', event.gamma)
      if (canTirggerGamma) {
        this.triggerEvent('gamma', event.gamma, this.gammaRange)
      }
    }
  }

  canTirgger (name, value) {
    let range = this[`${name}Range`]
    return range && (range[0] < range[1]
      ? value > range[0] && value < range[1]
      : value > range[0] || value < range[1])
  }

  triggerEvent (eventName, eventValue, eventRange) {
    // alpha 旋转角度取值范围为 [0, 360]，beta 取值范围为 [-180, 180]，gamma 旋转角度取值范围为 [-90, 90]
    // 处理触发弧正常情况：alpha 不跨越 0 度和 360 重合点，beta 不跨越 -180 度和 180 度重合点
    // gamma 本身仅支持顺时针 [-90, 90] 的情况，不存在 0 或者 -180 度这样的跳跃点，不用特殊处理
    // 度数定义见 README 或者 html deviceorientation官方文档
    let arcLen = eventRange[1] - eventRange[0]
    let percentValue = eventValue - eventRange[0]
    let percent = percentValue / arcLen
    let orientData = {
      'angle': Math.round(eventValue),
      'percent': percent,
      'seekToTime': Math.floor(percent * this.duration)
    }

    // 处理触发弧包含跳跃点的情况，比如
    // alpha-range = "330 30" 或者 beta-range = "120 -120"
    if (eventRange[0] > eventRange[1]) {
      arcLen = eventRange[1] - eventRange[0] + 360
      if (eventName === 'alpha') {
        percentValue = eventValue > eventRange[1]
          // 当前角度在 330 度顺时针到 0 度时
          ? eventValue - eventRange[0]
          // 当前角度在 0 度顺时针到 30 度时
          : eventValue + (360 - eventRange[0])
      }
      if (eventName === 'beta') {
        percentValue = eventValue < eventRange[1]
          // 当前角度在 -180 度顺时针到 -120 度这样的范围时
          ? eventValue + (360 - eventRange[0])
          // 当前角度在 120 度顺时针到 -180 度时
          : eventValue - eventRange[0]
      }
      percent = percentValue / arcLen
      orientData = {
        'angle': Math.round(eventValue),
        'percent': percent,
        'seekToTime': Math.floor(percent * this.duration)
      }
    }
    viewer.eventAction.execute(eventName, this.element, orientData)
  }
}

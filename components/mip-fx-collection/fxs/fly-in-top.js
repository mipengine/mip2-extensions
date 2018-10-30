
import FlyInBottom from './fly-in-bottom'
import { convertEasingToValue, convertPercentageToNumber, setTransformStyle } from './utils'
const rect = MIP.util.rect

export default class FlyInTop extends FlyInBottom {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fly-in-top'
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    let distance = convertPercentageToNumber(this.distance)
    if (!top ||
      top + (viewportHeight * distance) > (1 - this.marginStart) * viewportHeight
    ) {
      return
    }

    if (!this.triggered) {
      MIP.util.css(this.element, {
        'top': `calc(0px - ${this.distance}vh)`,
        'visibility': 'visible'
      })
      this.triggered = true
    }

    MIP.util.css(this.element, {
      'transition-duration': this.duration + 'ms',
      'transition-timing-function': convertEasingToValue(this.easing)
    })
    setTransformStyle(this.element, `translateY(${this.distance}vh)`)
  }
}

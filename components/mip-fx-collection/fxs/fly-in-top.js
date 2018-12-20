
import FlyInBottom from './fly-in-bottom'
import { convertPercentageToNumber, setTransformStyle } from './utils'
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
    if (!top ||
      top + (viewportHeight * convertPercentageToNumber(this.distance)) > (1 - this.marginStart) * viewportHeight
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

    setTimeout(() => {
      MIP.util.css(this.element, {
        'transition-duration': this.duration + 'ms',
        'transition-timing-function': this.easing
      })
      setTransformStyle(this.element, `translateY(${this.distance}vh)`)
    })
  }
}

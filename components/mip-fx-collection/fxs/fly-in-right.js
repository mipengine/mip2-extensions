
import FlyInBottom from './fly-in-bottom'
import { setTransformStyle } from './utils'

const rect = MIP.util.rect

export default class FlyInRight extends FlyInBottom {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fly-in-right'
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    if (!top ||
      top > (1 - this.marginStart) * viewportHeight
    ) {
      return
    }

    if (!this.triggered) {
      MIP.util.css(this.element, {
        'left': `calc(${this.distance}vw)`,
        'visibility': 'visible'
      })
      this.triggered = true
    }

    setTimeout(() => {
      MIP.util.css(this.element, {
        'transition-duration': this.duration + 'ms',
        'transition-timing-function': this.easing
      })
      setTransformStyle(this.element, `translateX(-${this.distance}vw)`)
    })
  }
}

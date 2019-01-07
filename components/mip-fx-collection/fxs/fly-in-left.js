
import FlyInBottom from './fly-in-bottom'
import { setTransformStyle } from './utils'

const rect = MIP.util.rect

export default class FlyInLeft extends FlyInBottom {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fly-in-left'

    MIP.util.css(this.element, {
      '-webkit-backface-visibility': 'hidden',
      '-webkit-perspective': 1000
    })
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
        'left': `calc(0px - ${this.distance}vw)`,
        'visibility': 'visible'
      })
      this.triggered = true
    }
    setTimeout(() => {
      MIP.util.css(this.element, {
        'transition-duration': this.duration + 'ms',
        'transition-timing-function': this.easing
      })
      setTransformStyle(this.element, `translateX(${this.distance}vw)`)
    })
  }
}

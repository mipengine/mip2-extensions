
import Fx from './fx'
import { getDefaultDuration, getDefaultDistance, getDefaultEasing, getDefaultMargin } from './default-values'
import { convertPercentageToNumber, convertEasingToValue, setTransformStyle } from './utils'
const rect = MIP.util.rect

export default class FlyInBottom extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fly-in-bottom'

    /**
     * duration of animation, the unit is milliseconds
     *
     * @type {number}
     * @property
     */
    this.duration = parseFloat(this.element.getAttribute('data-duration'))
    /**
     * a percentage number of element moving distance
     *
     * @type {number}
     * @property
     */
    this.distance = this.element.getAttribute('data-fly-in-distance')
    /**
     * easing type, linear, ease-in-out, ease-in, ease-out or a cubic-bezier notation
     *
     * @type {string}
     * @property
     */
    this.easing = this.element.getAttribute('data-easing')
    /**
     * the number determines when to trigger the timed animation.
     *
     * @type {number}
     * @property
     */
    this.marginStart = convertPercentageToNumber(this.element.getAttribute('data-margin-start'))
  }

  /** @override */
  assert () {
    if (!this.duration) {
      this.duration = getDefaultDuration(this.type)
    }
    if (!this.distance) {
      this.distance = getDefaultDistance(this.type)
    }
    if (!this.easing) {
      this.easing = getDefaultEasing(this.type)
    }
    if (!this.marginStart) {
      this.marginStart = getDefaultMargin(this.type).start
    }
    if (this.marginStart < 0 || this.marginStart > 1) {
      console.warn(
        this.element,
        'data-margin-start must be a percentage value,' +
        'greater than 0% and less than 100%'
      )
    }
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    let distance = convertPercentageToNumber(this.distance)
    if (!top ||
      top - (viewportHeight * distance) > (1 - this.marginStart) * viewportHeight
    ) {
      return
    }

    if (!this.triggered) {
      MIP.util.css(this.element, {
        'top': `calc(0px + ${this.distance}vh)`,
        'visibility': 'visible'
      })
      this.triggered = true
    }

    MIP.util.css(this.element, {
      'transition-duration': this.duration + 'ms',
      'transition-timing-function': convertEasingToValue(this.easing)
    })
    setTransformStyle(this.element, `translateY(-${this.distance}vh)`)
  }
}


import Fx from './fx'
import { getDefaultDuration, getDefaultDistance, getDefaultEasing, getDefaultMargin } from './default-values'
import { assert, convertPercentageToNumber, convertEasingToValue, setTransformStyle } from './utils'
const rect = MIP.util.rect

export default class FlyInBottom extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fly-in-bottom'
  }

  /** @override */
  assert () {
    let marginStart = parseFloat(this.attr('data-margin-start'))

    if (!marginStart) {
      return
    }

    assert(
      marginStart >= 0 && marginStart <= 100,
      this.element,
      'data-margin-start must be a percentage value, greater than 0% and less than 100%'
    )
  }

  /** @override */
  sanitize () {
    /**
     * duration of animation, the unit is milliseconds
     *
     * @type {number}
     * @property
     */
    this.duration = this.hasAttr('data-duration')
      ? parseFloat(this.attr('data-duration'))
      : getDefaultDuration(this.type)

    /**
     * a percentage number of element moving distance
     *
     * @type {number}
     * @property
     */
    this.distance = this.hasAttr('data-fly-in-distance')
      ? parseFloat(this.attr('data-fly-in-distance'))
      : getDefaultDistance(this.type)

    /**
     * easing type, linear, ease-in-out, ease-in, ease-out or a cubic-bezier notation
     *
     * @type {string}
     * @property
     */
    this.easing = convertEasingToValue(
      this.hasAttr('data-easing')
        ? this.attr('data-easing')
        : getDefaultEasing(this.type)
    )

    /**
     * the number determines when to trigger the timed animation.
     *
     * @type {number}
     * @property
     */
    this.marginStart = this.hasAttr('data-margin-start')
      ? convertPercentageToNumber(this.attr('data-margin-start'))
      : getDefaultMargin(this.type).start
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    if (!top ||
      top - (viewportHeight * convertPercentageToNumber(this.distance)) > (1 - this.marginStart) * viewportHeight
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

    setTimeout(() => {
      MIP.util.css(this.element, {
        'transition-duration': this.duration + 'ms',
        'transition-timing-function': this.easing
      })
      setTransformStyle(this.element, `translateY(-${this.distance}vh)`)
    })
  }
}

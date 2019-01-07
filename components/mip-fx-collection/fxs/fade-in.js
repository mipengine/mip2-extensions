
import Fx from './fx'
import { getDefaultDuration, getDefaultEasing, getDefaultMargin } from './default-values'
import { assert, convertEasingToValue, convertPercentageToNumber } from './utils'
const rect = MIP.util.rect

export default class FadeIn extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fade-in'

    // hide the element
    MIP.util.css(this.element, 'opacity', 0)
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
    this.duration = this.hasAttr('data-duration')
      ? this.attr('data-duration')
      : getDefaultDuration(this.type)
    this.easing = convertEasingToValue(
      this.hasAttr('data-easing')
        ? this.attr('data-easing')
        : getDefaultEasing(this.type)
    )
    this.marginStart = this.hasAttr('data-margin-start')
      ? convertPercentageToNumber(this.attr('data-margin-start'))
      : getDefaultMargin(this.type).start
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    if (!top || top > (1 - this.marginStart) * viewportHeight) {
      return
    }

    MIP.util.css(this.element, {
      'opacity': 1,
      'transition-duration': this.duration + 'ms',
      'transition-timing-function': this.easing
    })
  }
}

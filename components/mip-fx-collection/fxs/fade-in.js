
import Fx from './fx'
import { getDefaultDuration, getDefaultEasing, getDefaultMargin } from './default-values'
import { convertEasingToValue } from './utils'
const rect = MIP.util.rect

export default class FadeIn extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fade-in'

    this.duration = this.element.getAttribute('data-duration')
    this.easing = this.element.getAttribute('data-easing')
    this.marginStart = this.element.getAttribute('data-margin-start')

    // hide the element
    MIP.util.css(this.element, 'opacity', 0)
  }

  /** @override */
  assert () {
    if (!this.duration) {
      this.duration = getDefaultDuration(this.type)
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
    if (!top || top > (1 - this.marginStart) * viewportHeight) {
      return
    }

    MIP.util.css(this.element, {
      'opacity': 1,
      'transition-duration': this.duration + 'ms',
      'transition-timing-function': convertEasingToValue(this.easing)
    })
  }
}


import Fx from './fx'
import { getDefaultMargin } from './default-values'
import { assert, convertPercentageToNumber } from './utils'
const rect = MIP.util.rect

export default class FadeInScroll extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fade-in-scroll'
    this.offset = 0

    // hide the element
    MIP.util.css(this.element, 'opacity', 0)
  }

  /** @override */
  assert () {
    let marginStart = parseFloat(this.attr('data-margin-start'))
    let marginEnd = parseFloat(this.attr('data-margin-end'))

    if (!marginStart && !marginEnd) {
      return
    }

    assert(
      marginStart >= 0 && marginStart <= 100,
      this.element,
      'data-margin-start must be a percentage value, greater than 0% and less than 100%'
    )

    assert(
      marginEnd >= 0 && marginEnd <= 100,
      this.element,
      'data-margin-end must be a percentage value, greater than 0% and less than 100%'
    )

    assert(
      marginEnd > marginStart,
      this.element,
      'data-margin-start must be greater than data-margin-end'
    )
  }

  /** @override */
  sanitize () {
    this.marginStart = this.hasAttr('data-margin-start')
      ? convertPercentageToNumber(this.attr('data-margin-start'))
      : getDefaultMargin(this.type).start
    this.marginEnd = this.hasAttr('data-margin-end')
      ? convertPercentageToNumber(this.attr('data-margin-end'))
      : getDefaultMargin(this.type).end
    this.repeat = this.hasAttr('data-repeat')
  }

  /** @override */
  update () {
    let top = rect.getElementRect(this.element).top - MIP.viewport.getScrollTop()
    let viewportHeight = MIP.viewport.getHeight()
    if (!top || top > (1 - this.marginStart) * viewportHeight) {
      return
    }

    // if no data-repeat attribute, and the elment has completely shown, don't animate again
    if (!this.repeat && this.offset >= 1) {
      return
    }

    let offset = 1 * (viewportHeight - top - this.marginStart * viewportHeight) /
      ((this.marginEnd - this.marginStart) * viewportHeight)
    this.offset = offset

    MIP.util.css(this.element, 'opacity', offset)
  }
}

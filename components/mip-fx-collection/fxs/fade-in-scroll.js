
import Fx from './fx'
import { getDefaultMargin } from './default-values'
const rect = MIP.util.rect

export default class FadeInScroll extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'fade-in-scroll'

    this.offset = 0
    this.marginStart = this.element.getAttribute('data-margin-start')
    this.marginEnd = this.element.getAttribute('data-margin-end')
    this.repeat = this.element.hasAttribute('data-repeat')

    // hide the element
    MIP.util.css(this.element, 'opacity', 0)
  }

  /** @override */
  assert () {
    if (!this.marginStart) {
      this.marginStart = getDefaultMargin(this.type).start
    }
    if (this.marginStart < 0 || this.marginStart > 1) {
      console.warn(
        this.element,
        'data-margin-start must be a percentage value, ' +
        'greater than 0% and less than 100%'
      )
    }

    if (!this.marginEnd) {
      this.marginEnd = getDefaultMargin(this.type).end
    }
    if (this.marginEnd < 0 || this.marginEnd > 1) {
      console.warn(
        this.element,
        'data-margin-end must be a percentage value, ' +
        'greater than 0% and less than 100%'
      )
    }
    if (this.marginStart >= this.marginEnd) {
      console.warn(
        this.element,
        'data-margin-start must be greater than data-margin-end'
      )
      this.marginStart = getDefaultMargin(this.type).start
      this.marginEnd = getDefaultMargin(this.type).end
    }
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

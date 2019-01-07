
import Fx from './fx'
import { assert, setTransformStyle } from './utils'
const rect = MIP.util.rect

export default class Parallax extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'parallax'
  }

  /** @override */
  assert () {
    let factor = this.attr('data-parallax-factor')
    assert(
      factor && parseFloat(factor) > 0,
      this.element,
      'data-parallax-factor attribute can\'t be empty, it must be a number and greater than 0'
    )
  }

  /** @override */
  sanitize () {
    this.factor = parseFloat(this.attr('data-parallax-factor'))
  }

  /** @override */
  update () {
    let elementRect = rect.getElementRect(this.element)
    let viewportRect = MIP.viewport.getRect()
    // element didn't appear in the viewport, directed return
    if (!elementRect.top || !rect.overlapping(elementRect, viewportRect)) {
      return
    }

    let factor = -(this.factor - 1)
    let offset = (viewportRect.bottom - elementRect.top) * factor
    setTransformStyle(this.element, `translateY(${offset}px)`)
  }
}

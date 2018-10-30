
import Fx from './fx'
import { setTransformStyle } from './utils'
const rect = MIP.util.rect

export default class Parallax extends Fx {
  constructor (...args) {
    super(...args)

    /** @override */
    this.type = 'parallax'

    this.factor = parseFloat(this.element.getAttribute('data-parallax-factor'))
  }

  /** @override */
  assert () {
    if (!this.factor || this.factor <= 0) {
      console.warn(
        this.element,
        this.type,
        `data-parallax-factor attribute can't be empty, it must be a number and greater than 0`
      )
      this.assert_ = false
    }
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

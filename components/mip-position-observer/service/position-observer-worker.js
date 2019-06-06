const {viewport, util} = MIP
const rect = util.rect

/** @enum {number} */
export const PositionObserverFidelity = {
  HIGH: 1,
  LOW: 0
}

/** @const @private */
const LOW_FIDELITY_FRAME_COUNT = 4

/**
 * @typedef {{
 *  positionRect: ?../../layout-rect.LayoutRectDef,
 *  viewportRect: !../../layout-rect.LayoutRectDef,
 *  relativePos: string,
 * }}
 */
export let PositionInViewportEntryDef

/**
* 描述一个元素相对于另一个元素的位置关系
*
* @enum {string}
*/
export const RelativePositions = {
  INSIDE: 'inside',
  TOP: 'top',
  BOTTOM: 'bottom'
}

/**
 * @typedef {{
  *   top: number,
  *   bottom: number,
  *   left: number,
  *   right: number,
  *   width: number,
  *   height: number,
  *   x: number,
  *   y: number
  * }}
  */
let LayoutRectDef

/**
 * 返回 r1 相对于 r2 的位置
 *
 * @param {!LayoutRectDef} r1 rect1
 * @param {!LayoutRectDef} r2 rect2
 * @returns {RelativePositions} 位置关系
 */
export function layoutRectsRelativePos (r1, r2) {
  if (r1.top < r2.top) {
    return RelativePositions.TOP
  } else if (r1.bottom > r2.bottom) {
    return RelativePositions.BOTTOM
  } else {
    return RelativePositions.INSIDE
  }
}

/**
 * 计算元素位置的变化，触发传入的回调
 */
export class PositionObserverWorker {
  constructor (element, fidelity, handler) {
    this.element = element
    this.handler = handler
    this.fidelity = fidelity
    this.turn = (fidelity === PositionObserverFidelity.LOW)
      ? Math.floor(Math.random() * LOW_FIDELITY_FRAME_COUNT) : 0
    this.prevPosition = null
  }

  trigger (position) {
    const prevPos = this.prevPosition
    if (prevPos &&
      this.layoutRectEquals(prevPos.positionRect, position.positionRect) &&
      this.layoutRectEquals(prevPos.viewportRect, position.viewportRect)) {
      // 位置没变什么也不做
      return
    }

    position.relativePos = layoutRectsRelativePos(position.positionRect, position.viewportRect)

    if (rect.overlapping(position.positionRect, position.viewportRect)) {
      this.prevPosition = position
      this.handler(position)
    } else if (this.prevPosition) {
      this.prevPosition = null
      position.positionRect = null
      this.handler(position)
    }
  }

  layoutRectEquals (r1, r2) {
    if (!r1 || !r2) {
      return false
    }
    return r1.left === r2.left && r1.top === r2.top &&
        r1.width === r2.width && r1.height === r2.height
  }

  /**
   * 更新元素的位置信息
   * 被 position-observer-service 的 updateAllEntries 调用
   * 或元素第一次被监听时调用
   *
   * @param {boolean=} optForce 选项
   */
  update (optForce) {
    if (!optForce) {
      if (this.turn !== 0) {
        this.turn--
        return
      }

      if (this.fidelity === PositionObserverFidelity.LOW) {
        this.turn = LOW_FIDELITY_FRAME_COUNT
      }
    }

    const viewportBox = viewport.getRect()
    const elementBox = rect.getElementRect(this.element)
    this.trigger({
      positionRect: elementBox,
      viewportRect: viewportBox,
      relativePos: ''
    })
  }
}

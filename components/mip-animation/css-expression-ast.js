/**
 * @file css-expression-ast.js
 * @author chenyongle (chenyongle@baidu.com)
 */
const {util, viewport} = MIP
const NORM_RE = /\d(%|px|em|rem|vw|vh|vmin|vmax|s|ms|deg|grad|turn|rad)/i
const INFINITY_RE = /^(infinity|infinite)$/i
const DEG_TO_RAD = 2 * Math.PI / 360
const GRAD_TO_RAD = Math.PI / 200
const TURN_TO_RAD = Math.PI

export class NumericNode {
  constructor (type, num, unit) {
    this.type = type
    this.num = num
    this.unit = unit
  }

  css () {}

  resolve () {}
}

export class NumberNode extends NumericNode {
  constructor (num, unit) {
    super('CONSTANT', num, unit)
  }
  css () {
    return `${this.num}${this.unit}`
  }
  resolve () {
    return this
  }
}

export class PercentNode extends NumericNode {
  constructor (num, unit) {
    super('PERCENT', num, unit)
  }
  resolve ({ dom, dim }) {
    if (dim !== 'width' && dim !== 'height') {
      return new NumberNode('0', 'px')
    }
    let num = util.rect.getElementOffset(dom)[dim] * this.num / 100
    return new NumberNode(num, 'px')
  }
}

export class EmNode extends NumericNode {
  constructor (num, unit) {
    super('EM', num, unit)
  }
  resolve ({ dom, options }) {
    let num
    if (this.unit === 'rem') {
      num = parseFloat(getComputedStyle(document.documentElement, options, 'font-size')) * this.num
      return new NumberNode(num, 'px')
    }
    num = parseFloat(getComputedStyle(dom, options, 'font-size')) * this.num
    return new NumberNode(num, 'px')
  }
}

export class VwNode extends NumericNode {
  constructor (num, unit) {
    super('VW', num, unit)
  }
  resolve () {
    const rect = viewport.getRect()
    const vw = rect.width * this.num / 100
    const vh = rect.height * this.num / 100
    if (this.unit === 'vw') {
      return new NumberNode(vw, 'px')
    }
    if (this.unit === 'vh') {
      return new NumberNode(vh, 'px')
    }
    if (this.unit === 'vmin') {
      return new NumberNode(Math.min(vw, vh), 'px')
    }
    if (this.unit === 'vmax') {
      return new NumberNode(Math.max(vw, vh), 'px')
    }
    // unit === 'px'
    return new NumberNode(this.num, 'px')
  }
}

export class DegNode extends NumericNode {
  constructor (num, unit) {
    super('DEG', num, unit)
  }
  // NumberNode can be changed to DegNode
  resolve () {
    if (this.unit === 'deg') {
      return new NumberNode(this.num * DEG_TO_RAD, 'rad')
    }
    if (this.unit === 'grad') {
      return new NumberNode(this.num * GRAD_TO_RAD, 'rad')
    }
    if (this.unit === 'turn') {
      return new NumberNode(this.num * TURN_TO_RAD, 'rad')
    }
    // rad
    return new NumberNode(this.num, 'rad')
  }
}

export class TimeNode extends NumericNode {
  constructor (num, unit) {
    super('TIME', num, unit)
  }
  resolve () {
    if (this.unit === 'ms') {
      return new NumberNode(this.num, 's')
    }
    return new NumberNode(this.num, 's')
  }
}

export function constantNode (css) {
  let result = css.match(NORM_RE) || []
  let num = parseFloat(css)
  switch (result[1]) {
    case '%':
      return new PercentNode(num, '%')
    case 'em':
      return new EmNode(num, 'em')
    case 'rem':
      return new EmNode(num, 'rem')
    case 'vw':
      return new VwNode(num, 'vw')
    case 'vh':
      return new VwNode(num, 'vh')
    case 'vmin':
      return new VwNode(num, 'vmin')
    case 'vmax':
      return new VwNode(num, 'vmax')
    case 'px':
      return new VwNode(num, 'px')
    case 'deg':
      return new DegNode(num, 'deg')
    case 'grad':
      return new DegNode(num, 'grad')
    case 'turn':
      return new DegNode(num, 'turn')
    case 'rad':
      return new DegNode(num, 'rad')
    case 's':
      return new TimeNode(num, 's')
    case 'ms':
      return new TimeNode(num, 'ms')
    default:
      num = +css
      if (/e/i.test(css)) {
        let arr = css.split('e')
        num = +arr[0] * Math.pow(10, +arr[1])
      }
      if (INFINITY_RE.test(css)) {
        num = Infinity
      }
      // maybe undefined can occur
      return new NumberNode(num, '')
  }
}

export function getComputedStyle (dom, options, prop) {
  if (!options.cache_) {
    options.cache_ = window.getComputedStyle(dom)
  }
  return options.cache_[prop]
}

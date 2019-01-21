/**
 * @file css-expression.js
 * @author clark-t (clarktanglei@163.com) chenyongle (chenyongle@baidu.com)
 * @description 手动解析 keyframes 下的 transform opacity visibility 和 offsetDistance
 *   其中 css extension 支持 width height num index rand 和 calc，css expression 需要使用 calc()，
 *   而且需要符合 calc 规范，例如加减号作为运算符必须被空格包围。
 */
import {
  NumberNode,
  constantNode
} from './css-expression-ast'

const VAR_RE = /(calc|var|url|rand|index|width|height|num)\(/i
const OPERATE_RE = /(\+|-|\/|\*)/i
const {util} = MIP

function isVar (string) {
  return VAR_RE.test(string)
}
function isOperate (string) {
  return OPERATE_RE.test(string)
}
function startsWith (str, search, pos = 0) {
  return str.substring(pos, pos + search.length) === search
}
function closest (dom, selector) {
  if (dom.closest) {
    return dom.closest(selector)
  }
  // ployfill for closest
  if (!document.documentElement.contains(dom)) {
    return null
  }
  while (dom !== null && dom.nodeType === 1) {
    if (match(dom, selector)) {
      return dom
    }
    dom = dom.parentElement || dom.parentNode
  }
  return null
}
function match (dom, selector) {
  let matcher = dom.matches ||
    dom.matchesSelector ||
    dom.webkitMatchesSelector ||
    dom.mozMatchesSelector ||
    dom.msMatchesSelector ||
    dom.oMatchesSelector

  return (matcher && matcher.call(dom, selector)) || false
}
function parseCss (cssString, dom, options) {
  // the first thing is to test whether it need to be parsed
  if (!isVar(cssString) && !isOperate(cssString)) {
    return cssString
  }
  // 这里的解析主要针对这种形式 `rand(1, 3)`，所以在最外层套了一层 `root()` 方便解析，然后再取出其内的内容进行计算返回
  let tree = parseToTree(cssString)
  return calculate(tree, {dom, options})
}
/**
 * 解析 CSS 字符串
 *
 * @param {string} css 需要解析的 CSS 字符串
 * @returns {string} 解析后的字符串
 */
function parseToTree (css) {
  // 针对 media 的参数可以直接有括号，所以 result 加了 parent，不过在 web-animation.js 里的 getDomConfigList 做了过滤，所以这里就去掉了
  let str = ''
  let result = {
    name: 'root',
    params: [[]]
  }

  // pointer 永远指向参数
  let pointer = result.params
  // 参数
  let arg = result.params[0]
  let stack = [result]

  for (let i = 0; i < css.length; i++) {
    if (css[i] === ',') {
      arg.push(str)
      str = ''
      arg = []
      pointer.push(arg)
      continue
    }
    str += css[i]
    let startMatch = str.match(/(\w+)?\($/)
    if (startMatch && startMatch[1]) {
      // rest 例如 10px + width() 的 10px +
      let rest = str.slice(0, startMatch.index)
      rest && arg.push(rest)
      str = ''
      let obj = {
        name: startMatch[1],
        params: [[]]
      }
      arg.push(obj)
      // pointer 永远指向参数
      pointer = obj.params
      arg = obj.params[0]
      stack.push(obj)
      continue
    }
    let endMatch = str.match(/\)$/)
    if (endMatch) {
      let rest = str.slice(0, -1)
      rest && arg.push(rest)
      str = ''

      stack.pop()
      if (stack.length === 0) {
        throw new Error('括号数不匹配')
      }
      pointer = stack[stack.length - 1].params
      arg = pointer[pointer.length - 1]
      continue
    }
  }
  if (str !== '') {
    arg.push(str)
  }
  return result.params[0]
}
/**
 * 对参数进行计算
 *
 * @param {Array} css 参数数组
 * @param {Object} obj 包含 dom 和 options 的对象
 * @param {string} dim 'width' || 'height' || 'z'
 */
function calculate (css, obj, dim) {
  for (let i = 0; i < css.length; i++) {
    let val = css[i]
    if (typeof val !== 'string') {
      let strArr = []
      // 遍历参数 params 进行计算
      for (let index = 0; index < val.params.length; index++) {
        if (index === 0) {
          if (val.name === 'translateY') {
            strArr.push(calculate(val.params[index], obj, 'height'))
          } else {
            strArr.push(calculate(val.params[index], obj, 'width'))
          }
          continue
        }
        if (index === 1) {
          strArr.push(calculate(val.params[index], obj, 'height'))
          continue
        }
        strArr.push(calculate(val.params[index], obj, 'z'))
      }
      // 直接传一个参数数组进去
      if (funcNode[val.name]) {
        css[i] = funcNode[val.name](strArr, dim, obj)
      } else {
        // 这里是 transform 的各个属性，如 translate，rotate 等，可直接返回结果。
        css[i] = val.name + '(' + strArr.join(',') + ')'
      }
    }
  }
  return css.join('').trim()
}
const funcNode = {
  width: (strArr, dim, {dom, options}) => {
    return dimNode('width', dom, ...strArr)
  },
  height: (strArr, dim, {dom, options}) => {
    return dimNode('height', dom, ...strArr)
  },
  calc: (strArr, dim, {dom, options}) => {
    return calcNode({dim, dom, options}, ...strArr)
  },
  num: (strArr, dim, {dom, options}) => {
    return numNode(...strArr)
  },
  var: (strArr, dim, {dom, options}) => {
    return varNode(strArr, {dom, options})
  },
  rand: (strArr, dim, {dom, options}) => {
    return randNode(strArr, {dom, dim, options})
  }
}

function randNode (cssArr, obj) {
  // maybe [0] -> ''.slice(0, -1) == ""
  let len = cssArr.length
  if (len === 0) {
    return Math.random()
  }
  if (len === 1 && cssArr[0] === '') {
    return Math.random()
  }
  if (len === 2) {
    let min = constantNode(cssArr[0])
    let max = constantNode(cssArr[1])
    min = min.resolve(obj)
    max = max.resolve(obj)
    if (min.unit !== max.unit) {
      throw new SyntaxError('two parameters should be the same kind type')
    }
    let min_ = Math.min(min.num, max.num)
    let max_ = Math.max(min.num, max.num)
    let rand = Math.random()
    return min_ + (max_ - min_) * rand + min.unit
  }
  throw new Error('number of parameters is illegal!')
}
function varNode (cssArr, {dom, options}) {
  // 按照 mdn 规范，第一个逗号后面的所有内容都是 default value
  let len = cssArr.length
  let key, defaultVal
  if (len === 0) {
    throw new Error('invalid parameters!')
  }
  // len >= 1
  key = cssArr[0].trim()
  if (!startsWith(key, '--')) {
    throw new Error('variable is illegal')
  }
  if (len > 1) {
    defaultVal = cssArr.slice(1).join('')
  }

  let val = parseCss(options[key], dom, options)
  if (val) {
    return val
  }
  return defaultVal
}
// width()，width('.inner-01')，height(closest('.inner-02'))
function dimNode (dim, dom, css) {
  css = css.replace(/\s/g, '')
  if (!css) {
    return util.rect.getElementOffset(dom)[dim] + 'px'
  }
  let selector
  if (startsWith(css, 'closest(')) {
    selector = css.substring(9, css.length - 2)
    if (selector) {
      return util.rect.getElementOffset(closest(dom, selector))[dim] + 'px'
    }
    throw new SyntaxError('closest should hava a parameter')
  }
  selector = css.substring(1, css.length - 1)
  return util.rect.getElementOffset(document.querySelector(selector))[dim] + 'px'
}
function getOperator (str, operators) {
  for (let i = 0; i < operators.length; i++) {
    let operator = operators[i]
    if (operator === str.slice(-operator.length)) {
      return operator
    }
  }
}
function calcNode (obj, str) {
  if (/^\s+/.test(str) || /\s+$/.test(str)) {
    throw new Error(`calc(${str}) arguments is invalid`)
  }
  if (/[(||)]/.test(str)) {
    throw new Error(`css calc() doesn't support bracket operation`)
  }
  // 采用后缀表达式计算结果
  let operators = {
    ' + ': 0,
    ' - ': 0,
    '/': 1,
    '*': 1
  }
  let op = Object.keys(operators)
  let oStack = []
  let stack = []
  let tmp = ''
  for (let i = 0; i < str.length; i++) {
    tmp += str[i]
    let operator = getOperator(tmp, op)
    if (!operator) {
      continue
    }
    stack.push(constantNode(tmp.slice(0, -operator.length).trim()))
    tmp = ''

    while (oStack.length && operators[operator] <= operators[oStack[oStack.length - 1]]) {
      let arg2 = stack.pop()
      let arg1 = stack.pop()
      let op = oStack.pop()
      let result = compute(op, arg1, arg2, obj)
      stack.push(result)
    }
    oStack.push(operator)
  }
  if (tmp !== '') {
    stack.push(constantNode(tmp.trim()))
  }
  for (let i = 0, max = oStack.length; i < max; i++) {
    let arg2 = stack.pop()
    let arg1 = stack.pop()
    let op = oStack.pop()
    let result = compute(op, arg1, arg2, obj)
    stack.push(result)
  }
  return stack[0].resolve(obj).css()
}
function numNode (css) {
  return parseFloat(css)
}

function compute (op, left, right, { dom, dim, options }) {
  if (left.type !== 'CONSTANT') {
    left = left.resolve({dom, dim, options})
  }
  if (right.type !== 'CONSTANT') {
    right = right.resolve({dom, dim, options})
  }
  if (op === '/') {
    if (right.unit) throw new SyntaxError('denominator should be a number ')
    return new NumberNode(left.num / right.num, left.unit)
  }
  if (op === '*') {
    if (!!left.unit !== !!right.unit) {
      return new NumberNode(left.num * right.num, left.unit ? left.unit : right.unit)
    }
    throw new SyntaxError('one side in multiplication should be a number without any unit')
  }
  if (op === ' + ' || op === ' - ') {
    // 可以是没有单位的常数
    if (left.unit !== right.unit) {
      throw new SyntaxError('both sides should be the same type')
    }
    let operator = op === ' + ' ? 1 : -1
    return new NumberNode(left.num + operator * right.num, left.unit)
  }
}
export default parseCss

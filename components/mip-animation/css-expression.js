/**
 * @file css-expression.js
 * @author clark-t (clarktanglei@163.com) chenyongle (chenyongle@baidu.com)
 * @description 手动解析 keyframes 下的 transform opacity visibility 和 offsetDistance
 *   其中 css extension 支持 width height num index rand 和 calc，css expression 需要使用 calc()，
 *   而且需要符合 calc 规范，例如加减号作为运算符必须被空格包围。
 */
import {
  NumberNode,
  OperatorNode,
  constantNode
} from './css-expression-ast'

const VAR_RE = /(calc|var|url|rand|index|width|height|num)\(/i
const OPERATE_RE = /(\+|-|\/|\*)/i
const { util } = MIP

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
  if (!document.documentElement.contains(dom)) return null
  while (dom !== null && dom.nodeType === 1) {
    if (match(dom, selector)) return dom
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
  if (!isVar(cssString) && !isOperate(cssString)) return cssString
  let tree = parseToTree('root(' + cssString + ')')
  return calculate(tree[0].params[0], { dom, options })
}

function parseToTree (css) {
  let str = ''
  let result = []
  let stack = [result]
  let pointer = result
  // 括号标志位
  let parenthese = 0
  // 不去除正常四则运算的括号
  let parentheseMap = {}
  // 参数
  let arg
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
    if (startMatch) {
      parenthese++
      if (startMatch[1]) {
        // rest 例如 10px + width() 的 10px +
        let rest = str.slice(0, startMatch.index)
        rest && arg.push(rest)
        str = ''
        let obj = {
          name: startMatch[1],
          params: [[]]
        }
        if (!arg) {
          pointer.push(obj)
        } else {
          arg.push(obj)
        }
        // pointer 永远指向参数
        pointer = obj.params
        arg = obj.params[0]
        stack.push(pointer)
        parentheseMap[parenthese] = false
      } else {
        parentheseMap[parenthese] = true
      }
      continue
    }
    let endMatch = str.match(/\)$/)
    if (endMatch) {
      if (!parentheseMap[parenthese]) {
        let rest = str.slice(0, -1)
        rest && arg.push(rest)
        str = ''
        stack.pop()
        pointer = stack[stack.length - 1]
        arg = pointer[pointer.length - 1]
      }
      parenthese--
      continue
    }
  }
  if (parenthese !== 0) throw new Error('括号数不匹配！')
  if (str !== '') {
    pointer.push(str)
  }
  return result
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
      let len = val.params.length
      for (let index = 0; index < len; index++) {
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

      css[i] = funcNode(val.name, strArr.join(','), dim, obj)
    }
  }
  return css.join(' ').trim()
}
function funcNode (name, str, dim, { dom, options }) {
  switch (name) {
    case 'width':
      return dimNode(str, 'width', dom)
    case 'height':
      return dimNode(str, 'height', dom)
    case 'index':
      return indexNode({ dom, options })
    case 'calc':
      return calcNode(str, dim, dom)
    case 'num':
      return numNode(str)
    case 'var':
      return varNode(str, options)
    case 'rand':
      return randNode(str)
    default:
      // 这里是 transform 的各个属性，如 translate，可直接返回结果。
      return name + '(' + str + ')'
  }
}
function randNode (css) {
  if (!css) return Math.random()
  let arr = css.split(',')
  let min = constantNode(arr[0])
  let max = constantNode(arr[1])
  min = min.resolve()
  max = max.resolve()
  if (min.unit !== max.unit) throw new SyntaxError('two parameters should be the same kind type')
  let min_ = Math.min(min.num, max.num)
  let max_ = Math.max(min.num, max.num)
  let rand = Math.random()
  return min_ + (max_ - min_) * rand + min.unit
}
function varNode (css, options) {
  // 按照 mdn 规范，第一个逗号后面的所有内容都是 default value
  css = css.replace(/\s/g, '')
  let index = css.indexOf(',')
  let key, defaultVal
  if (index !== -1) {
    key = css.substring(0, index)
    defaultVal = css.substring(index + 1, css.length)
  } else {
    key = css
  }
  if (!startsWith(key, '--')) throw new Error('variable is illegal')
  let val = options[key]
  if (val) {
    return val
  }
  return defaultVal
}
function dimNode (css, dim, dom) {
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
  selector = selector = css.substring(1, css.length - 2)
  return util.rect.getElementOffset(document.querySelector(selector))[dim] + 'px'
}
function indexNode ({ dom, options }) {
  return [...document.querySelectorAll(options.selector)].indexOf(dom)
}
function calcNode (css, dim, dom) {
  return compute(strToTree(css, 0, css.length - 1), dim, dom).css()
}
function numNode (css) {
  return parseFloat(css)
}
function skipBlankspace (str, i, forward) {
  while (str[i] && str[i] === ' ') {
    forward ? (i++) : (i--)
  }
  return i
}
/**
 * 这个函数的作用是：1、如果最外层是括号，校验能否去除括号；2、最外层不是括号，返回最后的运算符位置
 *
 * @param {string} str 表达式
 * @param {number} i 起始位置
 * @param {number} j 结束位置
 * @returns {Array} 返回校验的结果，array[0] 表示 str 是否为数字，array[1] 表示括号是否可以去除，array[2] 表示最后的运算符
 */
function checkParenthese (str, i, j) {
  let lastPlusOrMinus = -1
  let lastDevideOrMultiply = -1
  let parenthese = 0
  let isNum = true
  for (let k = i; k <= j; k++) {
    if (str[k] === '(') {
      isNum = false
      parenthese++
      continue
    }
    if (str[k] === ')') {
      isNum = false
      parenthese--
      continue
    }
    // 排除 var(--x) 的情况；由于这个特例代码也不好用 switch 来写
    if (str[k] === '-' && (str[k - 1] === '-' || str[k + 1] === '-')) {
      isNum = false
      continue
    }
    // 查找括号外的加减 The + and - operators must be surrounded by whitespace
    if (!parenthese && (str[k] === '+' || str[k] === '-') && str[k - 1] === ' ' && str[k + 1] === ' ') {
      isNum = false
      lastPlusOrMinus = k
      continue
    }
    // 查找括号外的乘除
    if (!parenthese && (str[k] === '/' || str[k] === '*')) {
      isNum = false
      lastDevideOrMultiply = k
      continue
    }
  }
  if (lastPlusOrMinus === -1) lastPlusOrMinus = lastDevideOrMultiply
  if (lastPlusOrMinus === -1) return [isNum, true]
  return [isNum, false, lastPlusOrMinus]
}
function strToTree (str, i, j) {
  if (i > j) return
  i = skipBlankspace(str, i, true)
  j = skipBlankspace(str, j, false)
  let result = checkParenthese(str, i, j)
  if (result[0]) {
    return constantNode(str.substring(i, j + 1))
  }
  if (result[1]) {
    return strToTree(str, ++i, --j)
  }
  let newNode = new OperatorNode(str[result[2]])
  newNode.left = strToTree(str, i, result[2] - 1)
  newNode.right = strToTree(str, result[2] + 1, j)
  return newNode
}
function compute (tree, dim, dom) {
  if (tree.type === 'CONSTANT') return tree
  if (tree.type === 'OPERATE') {
    let left = tree.left
    let right = tree.right
    if (left.type !== 'CONSTANT') {
      left = compute(left, dim, dom)
    }
    if (right.type !== 'CONSTANT') {
      right = compute(right, dim, dom)
    }
    if (tree.op === '/') {
      if (right.unit) throw new SyntaxError('denominator should be a number ')
      return new NumberNode(left.num / right.num, left.unit)
    }
    if (tree.op === '*') {
      if (!!left.unit !== !!right.unit) {
        return new NumberNode(left.num * right.num, left.unit ? left.unit : right.unit)
      }
      throw new SyntaxError('one side in multiplication should be a number without any unit')
    }
    if (tree.op === '+' || tree.op === '-') {
      // 可以是没有单位的常数
      if (left.unit !== right.unit) {
        throw new SyntaxError('both sides should be the same type')
      }
      let op = tree.op === '+' ? 1 : -1
      return new NumberNode(left.num + op * right.num, left.unit)
    }
  }
  return compute(tree.resolve({ dim, dom }), dim, dom)
}
export default parseCss

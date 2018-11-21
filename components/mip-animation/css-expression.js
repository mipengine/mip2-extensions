/**
 * @file css-expression.js
 * @author clark-t (clarktanglei@163.com)
 */

/* eslint-disable */

function num (num, defaultValue) {
  let match = num.match(/\d+(\.\d+)?/)
  if (!match) {
    return +defaultValue
  }
  return +match[0]
}

function unit (num) {
  let match = num.match(/\d+(\.\d+)?(.+)$/)
  if (match) {
    return match[2]
  }
}

function vars (varName) {

}

function index () {

}

function width (selector) {
  let dom = document.querySelector(selector)
  if (!dom) {
    return
  }

  return dom.style.width
}

function height (selector) {
  let dom = document.querySelector(selector)
  if (!dom) {
    return
  }

  return dom.style.height
}

function calc () {

}

function rand (min = 0, max = 1) {
  return min + Math.random() * (max - min)
}

function add (a, b) {
  return a + b
}

function dec (a, b) {
  return a - b
}

function mul (a, b) {
  return a * b
}

function div (a, b) {
  return a / b
}

function percent2px (num, dom) {

}

function vmax2px (num, dom) {

}

function vmin2px (num, dom) {

}

function vw2px (num, dom) {

}

function vh2px (num, dom) {

}

function em2px (num, dom) {

}

function rem2px (num, dom) {

}

function s2ms (num) {
  return num * 1000
}

function parse (cssString, dom, selector, options) {
  let stack = []

}

export default parse

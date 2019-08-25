/**
 * 将输入转换为日期对象，若字符串为空，则返回当前时间
 *
 * @param {string} str 输入的字符串
 * @returns {Date} 时间对象
 */
export function parseToDate (str) {
  if (str instanceof Date) {
    return str
  }
  if (str === null) {
    return null
  }

  let date = new Date(str)
  return isNaN(date) ? null : date
}

/**
 * 获取合法的时间对象
 *
 * @param {Date} dt 输入的对象
 * @param {Date} min 最小可选时间
 * @param {Date} max 最大可选时间
 * @returns {Date} 合法时间
 */
export function constrainDate (dt, min, max) {
  return (dt < min)
    ? min
    : (dt > max) ? max : dt
}

/**
 * 返回当前时间，具体时刻为 0
 *
 * @returns {Date} 时间对象
 */
export function pureDate () {
  let dt = new Date()
  dt.setHours(0, 0, 0, 0)
  return dt
}

/**
 * 比较时间是否相等
 *
 * @param {Date} date1 时间值
 * @param {Date} date2 时间值
 * @returns {boolean} 时间值是否相等
 */
export function datesEq (date1, date2) {
  return (date1 && date1.toDateString()) === (date2 && date2.toDateString())
}

/**
 * 将日期偏移 n
 *
 * @param {Date} dt 输入时间
 * @param {number} n 偏移量，正整数或者负整数
 * @returns {Date} 偏移后结果
 */
export function shiftDay (dt, n) {
  dt = new Date(dt)
  dt.setDate(dt.getDate() + n)
  return dt
}

/**
 * 将月份偏移 n
 *
 * @param {Date} dt 输入时间
 * @param {number} n 偏移量，正整数或者负整数
 * @param {boolean} wrap 可选，为 true 时即使超过当前年份，不改变年的值，默认为 false
 * @returns {Date} 偏移后结果
 */
export function shiftMonth (dt, n, wrap) {
  dt = new Date(dt)

  let dayOfMonth = dt.getDate()
  let month = dt.getMonth() + n

  dt.setDate(1)
  dt.setMonth(wrap ? (12 + month) % 12 : month)
  dt.setDate(dayOfMonth)

  // 若 dayOfMonth = 31, 但目标月份只有 30 或 29 天，设置为上个月最后一天
  if (dt.getDate() < dayOfMonth) {
    dt.setDate(0)
  }

  return dt
}

/**
 * 将年份偏移 n
 *
 * @param {Date} dt 输入时间
 * @param {number} n 偏移量，正整数或者负整数
 * @returns {Date} 偏移后结果
 */
export function shiftYear (dt, n) {
  dt = new Date(dt)
  dt.setFullYear(dt.getFullYear() + n)
  return dt
}

/**
 * 一个什么也不做的函数
 */
export function noop () { }

export const KEY = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  enter: 13,
  esc: 27
}

/**
 * 为指定元素注册监听, 返回取消监听的句柄
 *
 * @param {string} evt 事件名称
 * @param {HTMLElement} el 目标元素
 * @param {Function} handler 监听回调
 * @returns {Function} 取消句柄
 */
export function on (evt, el, handler) {
  el.addEventListener(evt, handler, true)

  return function () {
    el.removeEventListener(evt, handler, true)
  }
}

/**
 * 节流
 *
 * @param {number} ms 时间间隔
 * @param {Function} fn 回调
 * @returns {Function} 取消句柄
 */
export function bufferFn (ms, fn) {
  let timeout
  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(fn, ms)
  }
}

/**
 * 给 date 设置指定年份
 *
 * @param {Date} dt 输入日期
 * @param {number} year 指定年份
 */
export function setYear (dt, year) {
  dt = new Date(dt)
  dt.setFullYear(year)
  return dt
}

/**
 * 给 date 设置指定月份
 *
 * @param {Date} dt 输入日期
 * @param {number} month 指定月份
 */
export function setMonth (dt, month) {
  return shiftMonth(dt, month - dt.getMonth())
}

// author: meizz
export function format (fmt, date) {
  let o = {
    // 月份
    'M+': date.getMonth() + 1,
    // 日
    'd+': date.getDate(),
    // 小时
    'h+': date.getHours(),
    // 分
    'm+': date.getMinutes(),
    // 秒
    's+': date.getSeconds(),
    // 季度
    'q+': Math.floor((date.getMonth() + 3) / 3),
    // 毫秒
    'S"': date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export default {
  KEY,
  parseToDate,
  constrainDate,
  pureDate,
  datesEq,
  shiftDay,
  shiftMonth,
  shiftYear,
  noop,
  on,
  bufferFn,
  setYear,
  setMonth,
  format
}

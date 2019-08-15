/**
 * 动画时间格式化：支持 3000，3s, 3000ms
 *
 * @param {string} time 时间字符
 */
export function timeStrFormat (time) {
  let match
  let num
  let units

  if (!time) {
    return 0
  }
  // 兼容线上传纯数字的情况；
  time = (/^[0-9]*$/).test(+time) ? (time + 'ms') : time
  match = time.toLowerCase().match(/^([0-9\\.]+)\s*(s|ms)$/)

  if (!match) {
    return 0
  }

  num = match[1]
  units = match[2]

  if (match && match.length === 3 && (units === 's' || units === 'ms')) {
    return units === 's' ? parseFloat(num) * 1000 : parseInt(num, 10)
  }
}

/**
 * 设置动画时间
 *
 * @param {HTMLElement} ele 元素
 * @param {string} time 时间字符
 */
export function setTransitionDuration (ele, time) {
  ele.style.transition = 'transform ' + time + 'ms ease'
  ele.style.webkitTransition = 'transform ' + time + 'ms ease'
}

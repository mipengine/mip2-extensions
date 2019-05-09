/**
 * @file 常用工具函数
 */

/**
 * 检测CSS中是否有动画
 *
 * @param {HTMLElement} element 元素
 */
export function hasCssAnimation (element) {
  let ani = null
  try {
    ani = document.defaultView.getComputedStyle(element)['animationName'] ||
      document.defaultView.getComputedStyle(element)['-webkit-animationName']
  } catch (e) {}
  if (ani && ani !== 'none') {
    return true
  }
  return false
}

/**
 * 使得数组满足最低个数要求，不满足个数时则用默认数组填充
 *
 * @param {Array} customArr 用户自定义数组
 * @param {Array} defaultArr 默认数组
 * @param {number} n 最少展示的数组
 * @returns {Array} 符合要求的数组
 */
export function fillArr (customArr, defaultArr, n) {
  const cusLen = customArr.length
  if (cusLen >= n) {
    return customArr
  }
  return customArr.concat(defaultArr.slice(0, n - cusLen))
}

/**
 * 找到指定为某标签的父元素
 *
 * @param {HTMLElement} el DOM 元素
 * @param {string} tagName 标签名
 * @returns {HTMLElement} 父元素
 */
export function findParent (el, tagName) {
  tagName = tagName.toLowerCase()

  while (el && el.parentNode) {
    el = el.parentNode
    if (el.tagName && el.tagName.toLowerCase() === tagName) {
      return el
    }
  }
  return null
}

/**
 * 是否为 CSS 颜色
 *
 * @param {string} color 颜色值
 */
export function isCssColor (color) {
  const regSubjectColor = /^#([a-fA-F\d]{3}|[a-fA-F\d]{6})$/
  return regSubjectColor.test(color)
}

/**
 * 插入 script
 *
 * @param {string} url script url
 */
export function loadScript (url) {
  const script = document.createElement('script')
  const doc = document.body || document.documentElement
  script.src = url
  doc.appendChild(script)
}

/**
 * 获取所有属性
 *
 * @param {NamedNodeMap} attributes 属性集合
 */
export function getAttributeSet (attributes) {
  let attrs = {}
  Array.prototype.slice.apply(attributes).forEach(function (attr) {
    attrs[attr.name] = attr.value
  })
  return attrs
}

/**
 * 转换 JSON 对象为字符串
 *
 * @param {*} attrs 属性
 */
export function getJsonString (attrs) {
  let attrString = ''
  for (let prop in attrs) {
    attrString += prop + '=' + attrs[prop] + ' '
  }
  return attrString
}

/**
 * 数组去重
 *
 * @param {Array} array 数组
 */
export function unique (array) {
  let res = []
  for (let i = 0; i < array.length; i++) {
    let j
    for (j = 0; j < res.length; j++) {
      if (array[i] === res[j]) {
        break
      }
    }
    if (j === res.length) {
      res.push(array[i])
    }
  }
  return res
}

/**
 * 处理统计交互信息用于配合 mip-stats-baidu 组件
 *
 * @param {*} type 交互类型
 * @param {*} data 数据
 */
export function decodeStatsInfo (type, data) {
  return encodeURIComponent(
    JSON.stringify({
      type: type,
      data: data
    })
  )
}

/**
 * 判断 DOM 是否存在某 class
 *
 * @param {HTMLElement} e DOM 元素
 * @param {*} className 类名称
 */
export function hasClass (e, className) {
  const reg = new RegExp('\\s*' + className + '\\s*')
  return !!reg.exec(e.target.className)
}

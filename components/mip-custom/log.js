/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */

/**
 * 获取 xpath 数组
 *
 * @param {HTMLElement} node [点击节点]
 * @param {HTMLElement} wrap [容器]
 * @param {Array} path [结果数组]
 * @returns {Array} [结果数组]
 */
function getXPath (node, wrap, path) {
  path = path || []
  wrap = wrap || document
  if (node === wrap || !node || !wrap) {
    return path
  }
  if (node.parentNode !== wrap) {
    path = getXPath(node.parentNode, wrap, path)
  }
  let count = 1
  let sibling = node.previousSibling
  while (sibling) {
    if (sibling.nodeType === 1 && sibling.nodeName === node.nodeName) {
      count++
    }
    sibling = sibling.previousSibling
  }
  if (node.nodeType === 1) {
    path.push(node.nodeName.toLowerCase() + (count > 1 ? count : ''))
  }
  return path
}

/**
 * 获取 xpath 数组
 *
 * @param {string} API_URL [日志接收host]
 * @param {Object} logdata [参数对象]
 */
function sendLog (API_URL, logdata) {
  if (!API_URL) {
    return
  }
  let data = logdata || {}

  let url = API_URL

  let parasArr = []
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      parasArr.push(key + '=' + data[key])
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?'
  } else {
    url += '&'
  }

  url += parasArr.join('&')
  data.t = +new Date()
  let k = 'MIP_CUSTOM_LOG_' + data.t
  let img = window[k] = new Image()
  img.onload = img.onerror = img.onabort = function () {
    img.onload = img.onerror = img.onabort = null
    img = null
    window[k] = null
  }
  img.src = url
}

export default {
  getXPath,
  sendLog
}

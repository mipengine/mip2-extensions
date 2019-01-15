/**
* @file CNZZ 站长统计组件
* @author mj(zoumiaojiang@gmail.com)
*/

/* global MIP, _czc */

let {fn, Gesture, util} = MIP
let jsonParse = util.jsonParse

const DATA_STATS_CNZZ_FALG = 'data-stats-cnzz-flag'

export default class MIPStatsCnzz extends MIP.CustomElement {
  build () {
    let element = this.element
    let token = element.getAttribute('token')
    let setConfig = element.getAttribute('setconfig')
    let nodes = element.getAttribute('nodes')
    let lineNum = 11

    if (nodes) {
      let srcs = nodes.split(',')
      lineNum = srcs[Math.round(Math.random() * (srcs.length - 1))]
      if (isNaN(+lineNum)) {
        lineNum = 11
      }
    }
    if (token) {
      window._czc = window._czc || []
      _czc.push([
        '_setAccount',
        token
      ])

      let cnzzScript = document.createElement('script')
      let src = `https://s${lineNum}.cnzz.com/z_stat.php?id=${token}&web_id=${token}`

      setConfig && _czc.push(buildArry(decodeURIComponent(setConfig)))
      cnzzScript.setAttribute('language', 'javaScript')
      cnzzScript.src = src
      element.appendChild(cnzzScript)
      bindEle()
    } else {
      console.warn('请配置统计所需 token')
    }
  }
}

/**
 * 事件处理句柄
 *
 * @param {HTMLElement} tagBox 带有 data-stats-cnzz-obj 属性值的 DOM 元素
 */
function bindEleHandler (tagBox) {
  for (let index = 0; index < tagBox.length; index++) {
    let target = tagBox[index]
    let statusData = target.getAttribute('data-stats-cnzz-obj')
    let hasBindFlag = target.hasAttribute(DATA_STATS_CNZZ_FALG)

    // 检测 statusData 是否存在
    if (!statusData || hasBindFlag) {
      continue
    }

    try {
      statusData = jsonParse(decodeURIComponent(statusData))
    } catch (e) {
      console.warn('事件追踪 data-stats-cnzz-obj 数据不是合法的 JSON')
      continue
    }

    let eventtype = statusData.type
    if (!statusData.data) {
      continue
    }

    let data = buildArry(statusData.data)

    if ((eventtype !== 'click' && eventtype !== 'mouseup' && eventtype !== 'load') ||
      target.classList.contains('mip-stats-eventload')
    ) {
      continue
    }

    target.classList.add('mip-stats-eventload')

    if (eventtype === 'load') {
      _czc.push(data)
    } else if (eventtype === 'click' &&
      target.hasAttribute('on') &&
      target.getAttribute('on').match('tap:') &&
      fn.hasTouch()
    ) {
      let gesture = new Gesture(target)
      gesture.on('tap', eventHandler)
    } else {
      target.addEventListener(eventtype, eventHandler, false)
    }
    target.setAttribute(DATA_STATS_CNZZ_FALG, '1')
  }
}

/**
 * 绑定的事件触发
 */
function eventHandler () {
  let tempData = this.getAttribute('data-stats-cnzz-obj')
  if (!tempData) {
    return
  }
  try {
    let statusJson = jsonParse(decodeURIComponent(tempData))
    if (!statusJson.data) {
      return
    }
    let attrData = buildArry(statusJson.data)
    _czc.push(attrData)
  } catch (e) {
    return console.warn('事件追踪 data-stats-cnzz-obj 数据不是合法的 JSON')
  }
}

/**
 * 绑定事件
 */
function bindEle () {
  let now = Date.now()
  let intervalTimer = setInterval(() => {
    // 获取所有需要触发的 DOM
    bindEleHandler(document.querySelectorAll('*[data-stats-cnzz-obj]'))
    // 由于存在异步渲染，需要设定一个时间段进行轮询确保都绑定上了事件
    if (Date.now() - now >= 8000) {
      clearInterval(intervalTimer)
    }
  }, 100)
}

/**
 * 数据转换
 *
 * @param {Array<string>} arrayStr 将要转换的数组
 */
function buildArry (arrayStr) {
  let strArr = arrayStr
  let newArray = []

  if (!arrayStr) {
    return
  }
  if (typeof arrayStr === 'string') {
    strArr = arrayStr.replace(/['"[\]\s]+/g, '').split(',')
  }

  for (let index = 0; index < strArr.length; index++) {
    let item = strArr[index].replace(/(^\s*)|(\s*$)/g, '').replace(/'/g, '')
    if (item === 'false' || item === 'true') {
      item = Boolean(item)
    }

    newArray.push(item)
  }
  return newArray
}

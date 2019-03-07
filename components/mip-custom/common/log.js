/**
 * @file log的方法集
 * @author liujing
 */

// import modules
import data from './data'

const {util} = MIP

/**
 * [getXPath 获取 xpath 数组]
 *
 * @param  {HTMLElement}   node [点击节点]
 * @param  {HTMLElement}   wrap [容器]
 * @param  {Array}         path [结果数组]
 * @returns {Array}             [结果数组]
 */
const getXPath = (node, wrap, path) => {
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
 * [sendLog 发送日志]
 *
 * @param  {string}   API_URL [日志接收host]
 * @param  {Object}   logdata [参数对象]
 */
const sendLog = (API_URL, logdata = {}) => {
  if (!API_URL) {
    return
  }
  let url = API_URL

  let parasArr = []
  for (let key in logdata) {
    if (logdata.hasOwnProperty(key)) {
      parasArr.push(key + '=' + logdata[key])
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?'
  } else {
    url += '&'
  }

  url += parasArr.join('&')
  logdata.t = +new Date()
  let k = 'MIP_CUSTOM_LOG_' + logdata.t
  let img = window[k] = new Image()
  img.onload = img.onerror = img.onabort = function () {
    img.onload = img.onerror = img.onabort = null
    img = null
    window[k] = null
  }
  img.src = url
}

/**
 * [setNetDurationLogs 网络延迟日志]
 *
 * @param {Object} performance 性能参数
 * @param {Object} errorData   log日志中需要的错误日志信息
 * @param {Object} res         fetch的response
 */
const setNetDurationLogs = (performance, errorData, res) => {
  performance.responseEnd = +new Date()
  performance.duration = performance.responseEnd - performance.fetchStart
  errorData = {
    st: res.status,
    info: res.statusText,
    t: +new Date()
  }

  if (!res.ok) {
    let {logData = {}} = data
    sendLog(logData.host, util.fn.extend(logData.error, logData.params, errorData))
  }
}

/**
 * [setErrorLogs 网络错误日志]
 *
 * @param {Object} errorData   log日志中需要的错误日志信息
 * @param {Object} fetchData   common返回的错误数据
 */
const setErrorLogs = (errorData, fetchData) => {
  errorData = {
    info: fetchData.errmsg,
    t: +new Date()
  }
  let {logData = {}} = data
  sendLog(logData.host, util.fn.extend(logData.error, logData.params, errorData))

  console.warn(fetchData.errmsg)
}

/**
 * [setPerformanceLogs 性能日志：按照流量 1/500 发送日志]
 *
 * @param {Object} performance  性能参数
 * @param {Object} fetchData    common返回的数据
 */
const setPerformanceLogs = (performance, fetchData) => {
  // 性能日志：emptyTime-广告未显示时间
  // 渲染结束时间戳
  performance.renderEnd = +new Date()

  // 给到SF
  // 合作页业务性能监控需要两个主要指标
  // 1. 从搜索点出开始到mip页主体内容展现
  // 2. 从搜索点出开始到mip页面整体展现 （除了主体内容，可能存在mip-custom等异步加载的内容）
  // 在mip页内，将整体展现完成时间 和 mip页属于哪个产品类型 传给SF，SF统一上报
  // 同时支持拓展其他指标
  let mainData = fetchData.data
  // mainData.common.product = 'medicine';
  if (mainData && mainData.common && mainData.common.product && mainData.responseTime) {
    // 在search-sfr-services仓库的mipService里监听它
    MIP.viewer.sendMessage('product-baseperf-log', {
      fullLoadTime: performance.renderEnd,
      otherDurations: {
        // 后端渲染时间
        mipServerAllTime: mainData.responseTime.mipServerAllTime || 0,
        // 前端渲染时间
        frontendRender: performance.renderEnd - performance.responseEnd
      },
      product: mainData.common.product
    })
  }

  const random500 = Math.random() * 500

  if (random500 < 1) {
    // 页面空白毫秒数
    performance.emptyTime = performance.renderEnd - performance.fetchStart
    performance.frontendRender = performance.renderEnd - performance.responseEnd

    // 前端打点时间
    let frontendData = {
      duration: performance.duration,
      emptyTime: performance.emptyTime,
      frontendRender: performance.frontendRender
    }
    // 加入后端打点时间
    let frontAndServerData
    if (fetchData.data.responseTime) {
      frontAndServerData = util.fn.extend(frontendData, fetchData.data.responseTime)
    } else {
      frontAndServerData = frontendData
    }
    // 加入默认统计参数
    let {performanceData = {}} = data
    performanceData.params.info = JSON.stringify(util.fn.extend(performanceData.params.info, frontAndServerData, 1))
    sendLog(performanceData.host, performanceData.params)
  }
}

export default {
  getXPath,
  sendLog,
  setNetDurationLogs,
  setErrorLogs,
  setPerformanceLogs
}

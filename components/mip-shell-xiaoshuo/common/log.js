/**
 * file: 小说 shell 统一日志发送
 * author: JennyL <jiaojiaomao220@163.com>
 */

import {getCurrentWindow, getRootWindow, getParamFromString} from './util'
import state from './state'

/**
 * 发送webb性能日志
 *
 * @param {string} type 日志类型
 * @param {Object} info 日志信息
 */
export function sendWebbLog (type, info) {
  let data = Object.assign({info}, {
    dim: {
      from: 'novel'
    }
  })
  let eventName = type + '-log'
  MIP.viewer.sendMessage(eventName, data)
}

/**
 * 发送tc交互日志
 *
 * @param {string} type 日志类型
 * @param {Object} info 日志信息
 * @param {Object} extra 额外信息
 */
export function sendTCLog (type, info, extra) {
  const {novelInstance} = state(getCurrentWindow())
  // TC日志添加referer参数 , url需要encode,否则打点时会被特殊字符&等解析
  let referer = encodeURIComponent(window.document.referrer)
  // 添加小说实例ID
  const novelInstanceId = novelInstance ? novelInstance.novelInstanceId : null
  extra = Object.assign({referer, novelInstanceId}, extra)

  let eventName = type + '-log'
  let data = Object.assign({
    'clk_info': info
  }, {
    pd: 'novel'
  })
  if (extra) {
    data = Object.assign({
      ...data
    }, {
      extra
    })
  }
  MIP.viewer.sendMessage(eventName, data)
}

/**
 * 发送webb性能日志，common 5s 请求失败，发送common异常日志
 */
export function sendWebbLogCommon () {
  setTimeout(() => {
    if (window.MIP.setCommonFetch !== true) {
      sendWebbLog('stability', {
        msg: 'commonAbnormal'
      })
      console.warn('common 异常!')
    }
  }, 5000)
}

/**
 * 发送webb日志，监控页面底部下一页上一页按钮跳转是否异常，异常发送异常日志
 *
 * @param {HTMLElement} PageButton 页面上一页下一页按钮
 * @param {string} button 上一页或者下一页字段 prePageButton nextPageButton
 */
export function sendWebbLogLink (PageButton, button) {
  if (PageButton && !(PageButton.hasAttribute('data-type') && PageButton.getAttribute('data-type') === 'mip') && !(PageButton.hasAttribute('mip-link'))) {
    sendWebbLog('stability', {
      msg: 'linkError',
      button: button
    })
  }
}

/**
 * 无限下拉 ABtest pv统计打点
 *
 *
 */
export function sendReadTypePvTcLog (type) {
  let url = window.location.href
  // 非sf下不走打点函数
  if (!window.MIP.util.isCacheUrl(url)) {
    return
  }
  let currentWindow = getCurrentWindow()
  let rootWindow = getRootWindow(currentWindow)
  const bkid = getParamFromString(url, 'bkid')
  sendTCLog('interaction', {
    type: 'o',
    action: 'read_type'
  }, {
    sids: rootWindow.MIP.hash.hashTree.sids.value,
    bkid: bkid,
    'read_type': type
  })
}

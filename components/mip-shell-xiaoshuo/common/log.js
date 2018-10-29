/**
 * file: 小说 shell 统一日志发送
 * author: JennyL <jiaojiaomao220@163.com>
 */

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
 * 发送webb性能日志，common 5s 请求失败，发送common 异常日志
 */
export function sendWebbLogCommon () {
  setTimeout(() => {
    if (window.MIP.setedCommenFetch !== true) {
      sendWebbLog('stability', {
        msg: 'commonAbnormal'
      })
      console.warn('common 异常!')
    }
  }, 5000)
}

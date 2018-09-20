/**
 * file: 小说 shell 统一日志发送
 * author: JennyL <jiaojiaomao220@163.com>
 */
/**
   * 发送日志
   *
   * @param {string} type 日志类型
   * @param {Object} info 日志信息
   */
export function sendWebbLog (type, info) {
  let data = Object.assign({info: info}, {
    dim: {
      from: 'novel'
    }
  })
  let eventName = type + '-log'
  MIP.viewer.sendMessage(eventName, data)
}

/**
 * file: 小说 shell 统一日志发送
 * author: JennyL <jiaojiaomao220@163.com>
 */

export function sendLog (type, info) {
  let data = Object.assign(info, {
    dim: {
      pd: 'novel'
    }
  })
  let eventName = type + '-log'
  // 上线前删掉console
  console.log('Log Send: ', eventName, data)
  MIP.viewer.sendMessage(eventName, data)
}

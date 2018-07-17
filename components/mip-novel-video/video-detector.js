/**
 * @file detector.js 检测是否使用video原生播放
 */

let UA = navigator.userAgent.toLowerCase()
let goodUaList = ['baiduboxapp']
const platform = MIP.util.platform
const IOSVERSION = 8
const ANDROIDVERSION = 5

function isIPhone () {
  return UA.indexOf('iphone') > -1
}

function isGoodUA () {
  let goodUA = false
  goodUaList.forEach(function (val) {
    if (UA.indexOf(val) > -1) {
      goodUA = true
    }
  })
  return goodUA
}

export const isRenderVideoElement = () => {
  return isIPhone() && isGoodUA()
}

const detector = {
  isRenderVideoElement () {
    return isIPhone() && isGoodUA()
  },
  getMobileSystemVersion () {
    const mobile = UA.match(/\((.+)\)/g)[0].split(';')
    let system
    mobile.map(function (val) {
      if (val.indexOf('os') > -1 || val.indexOf('android') > -1) {
        system = val
      }
    })
    const num = /\d+/g
    const version = system.match(num)
    // ios要求版本8.X以上
    if (platform.isIos()) {
      return version && version[0] && version[0] >= IOSVERSION && !platform.isUc()
    } else {
    // android要求版本5.X以上
      return version && version[0] && version[0] >= ANDROIDVERSION && !platform.isUc()
    }
  }
}

export default detector

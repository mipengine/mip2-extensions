/**
 * @file mip-env 组件
 * @author html5david
 * @time 2018.11.19
 */
let {
  CustomElement,
  util,
  viewer
} = MIP
const platform = util.platform
// 所支持的cache
const allowCache = {
  sm: [ // 神马搜索平台(sm.cn)
    '.sm-tc.cn',
    '.transcode.cn'
  ],
  baidu: [
    '.bdstatic.com',
    '.mipcdn.com'
  ]
}

// 支持的分发平台
const allowDp = {
  sm: [
    '.sm-tc.cn',
    '.transcode.cn'
  ],
  baidu: [
    '.bdstatic.com',
    '.mipcdn.com'
  ]
}

/**
 * @method cacheOk 检测缓存类型是否合规
 * @param {String} cache 缓存类型，sm or baidu
 * @return {Boolean}
 */
const cacheOk = function (cache) {
  const allowCacheArr = allowCache[cache] || []
  return allowCacheArr.some(item => {
    return location.hostname.lastIndexOf(item) !== -1
  })
}

/**
 * @method dpOk 检测分发平台(dp)是否合规
 * @param {String} dp 平台类型，sm/baidu
 * @return {Boolean}
 */
const dpOk = function (dp) {
  if (!viewer.isIframed) {
    console.log('not in iframe')
    return false
  }
  const allowDpArr = allowDp[dp] || []
  return allowDpArr.some(item => {
    return location.hostname.lastIndexOf(item) !== -1
  })
}

/**
 * @method uaOk 检测userAgent是否合规
 * @param {String} ua userAgent, baidu/uc/chrome/safari/qq/firefox
 * @return {Boolean}
 */
const uaOk = function (ua) {
  switch (ua) {
    case 'baidu':
      if (platform.isBaidu()) {
        return true
      }
      break
    case 'uc':
      if (platform.isUc()) {
        return true
      }
      break
    case 'chrome':
      if (platform.isChrome()) {
        return true
      }
      break
    case 'safari':
      if (platform.isSafari()) {
        return true
      }
      break
    case 'qq':
      if (platform.isQQ()) {
        return true
      }
      break
    case 'firefox':
      if (platform.isFireFox()) {
        return true
      }
      break
    default:
      return false
  }
}

/**
 * @method osOk 检测系统是否合规
 * @param {String} os 系统类型, android/ios
 * @return {Boolean}
 */
const osOk = function (os) {
  switch (os) {
    case 'ios':
      if (platform.isIOS()) {
        return true
      }
      break
    case 'android':
      if (platform.isAndroid()) {
        return true
      }
      break
    default:
      return false
  }
}

/**
 * @method scopeOk 检测scope是否合规
 * @param {String} os scope json字符串
 * @return {Boolean}
 */
const scopeOk = function (scope) {
  if (scope) {
    const scopeJson = util.jsonParse(scope)
    if (util.fn.isPlainObject(scopeJson) && Object.keys(scopeJson).length !== 0) {
      for (const info in scopeJson) {
        const param = String(scopeJson[info]).toLowerCase()
        switch (info) {
          case 'cache':
            if (!cacheOk(param)) { // 检测cache是否合规
              console.log('cache error')
              return false
            }
            break
          case 'dp':
            if (!dpOk(param)) { // 检测分发平台是否合规
              console.log('dp error')
              return false
            }
            break
          case 'ua':
            if (!uaOk(param)) { // 检测ua是否合规
              console.log('ua error')
              return false
            }
            break
          case 'os':
            if (!osOk(param)) { // 检测系统类型是否合规
              console.log('os error')
              return false
            }
            break
          default:
            console.log('params error')
            return false
        }
      }
      console.log('all right')
      return true
    } else {
      console.log('scope error')
      return false
    }
  } else {
    console.log('no scope')
    return false
  }
}

export default class MipEnv extends CustomElement {
  connectedCallback () {
    const element = this.element
    const scope = element.getAttribute('scope')
    const isOk = scopeOk(scope) // 检测scope是否合规
    if (!isOk) {
      // 检测不合规时将内容清空
      element.innerHTML = ''
    }
  }
}

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
let { platform } = util

// 所支持的cache
const ALLOW_CACHE = {
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
const ALLOW_DP = {
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
 * @function cacheOk 检测缓存类型是否合规
 * @param {string} cache 缓存类型，sm or baidu
 * @returns {boolean} true/false
 */
function cacheOk (cache) {
  const allowCacheArr = ALLOW_CACHE[cache] || []
  return allowCacheArr.some(item => {
    return location.hostname.lastIndexOf(item) !== -1
  })
}

/**
 * @function dpOk 检测分发平台(dp)是否合规
 * @param {string} dp 平台类型，sm/baidu
 * @returns {boolean} true/false
 */
function dpOk (dp) {
  const allowDpArr = ALLOW_DP[dp] || []
  if (!viewer.isIframed) {
    console.warn('require in iframe')
    return false
  }
  return allowDpArr.some(item => {
    return location.hostname.lastIndexOf(item) !== -1
  })
}

/**
 * @function uaOk 检测userAgent是否合规
 * @param {string} ua userAgent, baidu/uc/chrome/safari/qq/firefox
 * @returns {boolean} true/false
 */
function uaOk (ua) {
  const checkUaFuns = {
    baidu: platform.isBaidu,
    uc: platform.isUc,
    chrome: platform.isChrome,
    safari: platform.isSafari,
    qq: platform.isQQ,
    firefox: platform.isFireFox
  }
  if (checkUaFuns[ua] && checkUaFuns[ua]()) {
    return true
  }
  return false
}

/**
 * @function osOk 检测系统是否合规
 * @param {string} os 系统类型, android/ios
 * @returns {boolean} true/false
 */
function osOk (os) {
  const checkOsFuns = {
    ios: platform.isIOS,
    android: platform.isAndroid
  }
  if (checkOsFuns[os] && checkOsFuns[os]()) {
    return true
  }
  return false
}

/**
 * @function scopeOk 检测scope是否合规
 * @param {string} scope scope json字符串
 * @returns {boolean} true/false
 */
function scopeOk (scope) {
  const checkFuns = {
    cache: cacheOk,
    dp: dpOk,
    ua: uaOk,
    os: osOk
  }

  if (!scope) {
    console.warn('require scope param')
    return false
  }

  const scopeJson = util.jsonParse(scope)
  const keys = Object.keys(scopeJson)
  if (!util.fn.isPlainObject(scopeJson) || keys.length === 0) {
    console.error('require scope param is json')
    return false
  }

  for (const key of keys) {
    const param = (scopeJson[key]).toString().toLowerCase()
    if (!checkFuns[key] || !checkFuns[key](param)) {
      console.warn(key + ' error')
      return false
    }
  }
  console.log('all right')
  return true
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

/**
 * @file mip-env 组件
 * @author html5david
 * @time 2018.11.19
 */
let {
  CustomElement,
  util
} = MIP
let { platform } = util

// 所支持的cache和分发平台
const ALLOW_DP_OR_CACHE = {
  sm: [ // 神马搜索平台(sm.cn)
    '.sm-tc.cn',
    '.transcode.cn'
  ],
  baidu: [
    '.bdstatic.com',
    '.mipcdn.com'
  ]
}

/**
 * @function splitScopeValue 取出指定scope value中带有"!"和不带有"!"的值
 * @param {string} scopeValue 指定scope value
 * @returns {Array} 0键存放非"!"值 1键存放"!"值  eg: ['baidu,uc', '!qq,!chrome']
 */
function splitScopeValue (scopeValue) {
  const delDupArr = new Set(scopeValue.split(','))
  const sourceCacheArr = Array.from(delDupArr)
  let resultArr = []
  if (sourceCacheArr.length === 0) {
    return resultArr
  }

  // 不带"!"的value集合
  resultArr[0] = sourceCacheArr.filter(item => {
    return item[0] !== '!'
  })

  resultArr[1] = sourceCacheArr.filter(item => {
    return item[0] === '!'
  })

  return resultArr
}

/**
 * @function cacheOk 检测缓存类型是否合规
 * @param {Array} sourceCacheArr 缓存类型，sm or baidu
 * @returns {boolean} true/false
 */
function cacheOk (sourceCacheArr) {
  // 有不带"!"的cache, 则以不带"!"的cache作为最终判断依据, 判断符为“||”
  // sourceCacheArr[0]为不带"!"的cache结合
  if (sourceCacheArr[0] && sourceCacheArr[0].length > 0) {
    return sourceCacheArr[0].some(item => {
      const allowCacheArr = ALLOW_DP_OR_CACHE[item] || []
      return allowCacheArr.some(allowCacheItem => {
        return location.hostname.lastIndexOf(allowCacheItem) !== -1
      })
    })
  }

  // 带有"!"的cache合集，判断符为“&&”
  // sourceCacheArr[1]为带"!"的cache合集
  return sourceCacheArr[1].every(item => {
    const allowCacheArr = ALLOW_DP_OR_CACHE[item.substr(1)] || []
    return allowCacheArr.every(allowCacheItem => {
      return location.hostname.lastIndexOf(allowCacheItem) === -1
    })
  })
}

/**
 * @function dpOk 检测分发平台是否合规
 * @param {Array} sourceDpArr 分发平台，sm or baidu
 * @returns {boolean} true/false
 */
function dpOk (sourceDpArr) {
  // 有不带"!"的dp, 则以不带"!"的dp作为最终判断依据, 判断符为“||”
  // sourceDpArr[0]为不带"!"的cache结合
  if (sourceDpArr[0] && sourceDpArr[0].length > 0) {
    return sourceDpArr[0].some(item => {
      const allowDpArr = ALLOW_DP_OR_CACHE[item] || []
      return allowDpArr.some(allowDpItem => {
        return location.hostname.lastIndexOf(allowDpItem) !== -1
      })
    })
  }

  // 带有"!"的dp合集，判断符为“&&”
  // sourceDpArr[1]为带"!"的dp合集
  return sourceDpArr[1].every(item => {
    const allowDpArr = ALLOW_DP_OR_CACHE[item.substr(1)] || []
    return allowDpArr.every(allowDpItem => {
      return location.hostname.lastIndexOf(allowDpItem) === -1
    })
  })
}

/**
 * @function uaOk 检测userAgent是否合规
 * @param {Array} sourceUaArr userAgent, baidu/baidubrowser/uc/chrome/safari/qq/firefox
 * @returns {boolean} true/false
 */
function uaOk (sourceUaArr) {
  const checkUaFuns = {
    baidu: platform.isBaiduApp,
    baidubrowser: platform.isBaidu,
    uc: platform.isUc,
    chrome: platform.isChrome,
    safari: platform.isSafari,
    qq: platform.isQQ,
    firefox: platform.isFireFox,
    wechat: platform.isWechatApp
  }
  // 有不带"!"的ua, 则以不带"!"ua作为最终判断依据, 判断符为“||”
  // sourceUaArr[0]为带"!"的ua合集
  if (sourceUaArr && sourceUaArr[0].length > 0) {
    return sourceUaArr[0].some(item => {
      return (checkUaFuns[item] && checkUaFuns[item]())
    })
  }

  // 带有"!"的ua合集，判断符为“&&”
  // sourceUaArr[1]为带"!"的ua合集
  return sourceUaArr[1].every(item => {
    return (!checkUaFuns[item.substr(1)] || !checkUaFuns[item.substr(1)]())
  })
}

/**
 * @function osOk 检测系统是否合规
 * @param {Array} sourceOsArr 系统类型, android/ios
 * @returns {boolean} true/false
 */
function osOk (sourceOsArr) {
  const checkOsFuns = {
    ios: platform.isIOS,
    android: platform.isAndroid
  }
  // 有不带"!"的os, 则以不带"!"os作为最终判断依据, 判断符为“||”
  // sourceOsArr[0]为带"!"的os合集
  if (sourceOsArr && sourceOsArr[0].length > 0) {
    return sourceOsArr[0].some(item => {
      return (checkOsFuns[item] && checkOsFuns[item]())
    })
  }

  // 带有"!"的os合集，判断符为“&&”
  // sourceOsArr[1]为带"!"的os合集
  return sourceOsArr[1].every(item => {
    return (!checkOsFuns[item.substr(1)] || !checkOsFuns[item.substr(1)]())
  })
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
    // 将value值拆分为带有!与不带有!组
    const value = splitScopeValue(param)
    if (!checkFuns[key] || !checkFuns[key](value)) {
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
    const id = element.getAttribute('targetId')
    const targetDom = id !== '' ? document.documentElement.querySelector('#' + id) : null
    if (!isOk) {
      // 检测不合规时将内容清空
      if (targetDom !== null) {
        targetDom.remove()
      }
      element.innerHTML = ''
    }
  }
}

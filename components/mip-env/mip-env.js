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
export default class MipEnv extends CustomElement {
  connectedCallback () {
    const cacheOk = function (cache) {
      const allowCache = { // 所支持的cache
        sm: [
          '.sm-tc.cn',
          '.transcode.cn'
        ],
        baidu: [
          '.bdstatic.com',
          '.mipcdn.com'
        ]
      }
      const allowCacheArr = allowCache[cache] || []
      return allowCacheArr.some((item) => {
        return location.hostname.lastIndexOf(item) !== -1
      })
    }
    const dpOk = function (dp) {
      const allowDp = { // 支持的分发平台
        sm: [
          '.sm-tc.cn',
          '.transcode.cn'
        ],
        baidu: [
          '.bdstatic.com',
          '.mipcdn.com'
        ]
      }
      if (!viewer.isIframed) {
        console.log('not in iframe')
        return false
      }
      const allowDpArr = allowDp[dp] || []
      return allowDpArr.some((item) => {
        return location.hostname.lastIndexOf(item) !== -1
      })
    }
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
    const osOk = function (os) {
      switch (os) {
        case 'ios':
          if (platform.isIos()) {
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
    const jsonParse = function (jsonStr) {
      try {
        return util.jsonParse(jsonStr)
      } catch (e) {
        return jsonStr
      }
    }
    const scopeOk = function (scope) {
      if (scope) {
        const scopeJson = jsonParse(scope)
        if (util.fn.isPlainObject(scopeJson) && Object.keys(scopeJson).length !== 0) {
          for (const info in scopeJson) {
            const param = String(scopeJson[info]).toLowerCase()
            switch (info) {
              case 'cache':
                if (!cacheOk(param)) {
                  console.log('cache error')
                  return false
                }
                break
              case 'dp':
                if (!dpOk(param)) {
                  console.log('dp error')
                  return false
                }
                break
              case 'ua':
                if (!uaOk(param)) {
                  console.log('ua error')
                  return false
                }
                break
              case 'os':
                if (!osOk(param)) {
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
    const element = this.element
    const scope = element.getAttribute('scope')
    const isOk = scopeOk(scope)
    if (!isOk) {
      element.innerHTML = ''
    }
  }
}
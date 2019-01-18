/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import dom from './dom'
import data from './data'

const {util, standalone} = MIP
const logger = util.log('mip-custom')

/**
 * mip连接特殊情况，从 hash 中获取参数
 *
 * @returns {Object} 合并后的数据对象
 */
function getHashParams () {
  let params = data.params
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      params[key] = data.getHashData(key) || params[key]
    }
  }

  // 修改字段名
  params.logid = data.getHashData('lid')
  params.eqid = data.getHashData('eqid')

  // 内容联盟来源 导流字段
  let feedArr = ['originalSource', 'mediaid', 'fn']
  for (let i = 0; i < feedArr.length; i++) {
    let arr = feedArr[i]
    if (data.getHashData(arr)) {
      params[arr] = data.getHashData(arr)
    }
  }

  return params
}

/**
 * 获取页面上用户设置的参数
 *
 * @param {HTMLElement} element mip-custom 组件节点
 * @returns {Object} userParams 用户设置的参数对象
 */
function getUserParams (element) {
  let userParams = null

  // 获取用户设置参数，获取不到则报错并返回
  try {
    let script = dom.getConfigScriptElement(element)
    if (script) {
      userParams = JSON.parse(script.textContent)
      if (!userParams.accid) {
        logger.warn('mip-custom 缺少 accid 参数')
        return
      }
      if (!userParams.title) {
        logger.warn('mip-custom 缺少 title 参数')
        return
      }

      // 站长传过来的title 是编码后的，需要进行解码
      for (let key in userParams) {
        if (userParams.hasOwnProperty(key)) {
          userParams[key] = decodeURIComponent(userParams[key])
        }
      }
    }
  } catch (errorMsg) {
    logger.warn('json is illegal'); // eslint-disable-line
    logger.warn(errorMsg); // eslint-disable-line
    return
  }
  return userParams
}

/**
 * 集合异步请求所需要的所有参数
 *
 * @param {HTMLElement} element mip-custom 组件节点
 * @returns {Object} 异步请求所需要的参数对象
 */
function getUrlParams (element) {
  let userParams = getUserParams(element)
  if (!userParams) {
    return null
  }

  return Object.assign(getHashParams(), userParams)
}

function getSourceId () {
  let customs = document.querySelectorAll('mip-custom[position=top]')
  let sourceIdArr = []
  let cLen = customs.length
  if (customs && cLen > 0) {
    for (let i = 0; i < cLen; i++) {
      let singleCustom = customs[i]
      let sourceId = singleCustom && singleCustom.getAttribute('source-type')
      sourceId && sourceIdArr.push(sourceId)
    }
  }
  return sourceIdArr.join(',')
}

/**
 * 判断是否在特定广告环境中
 *
 * @param {HTMLElement} element dom 节点
 * @returns {boolean} inMipShell 是否在mip-shell中
 */
function inMipShell (element) {
  // 非结果页进入，不是mip-shell，非百度、cache，不在mip-shell中
  if (standalone ||
    !(data.REGEXS.domain.test(window.document.referrer) ||
    util.fn.isCacheUrl(location.href))
  ) {
    return false
  }
  return true
}

/**
 * url 拼接函数
 *
 * @param  {HTMLElement} element mip-custom 组件节点
 * @param  {string} poi 区分AB区的url
 * @returns {string} url 拼接后的url
 */
export default function getUrl (element, poi) {
  let firstKey = true
  let url = poi === 'top' ? data.TOP_AJAX_URL : data.AJAX_URL
  let urlParams = getUrlParams(element)

  if (!urlParams) {
    return
  }

  for (let key in urlParams) {
    if (urlParams.hasOwnProperty(key)) {
      url += (!firstKey ? '&' : '') + key + '=' + urlParams[key]
      firstKey = false
    }
  }

  if (poi === 'top') {
    let sourceId = getSourceId()
    if (sourceId) {
      url += '&sourceId=' + encodeURIComponent(sourceId)
    }
  }
  // 非mip-shell增加noshell参数
  let mipShell = inMipShell(element)
  if (!mipShell) {
    url += '&from=noshell'
  }
  return url
}

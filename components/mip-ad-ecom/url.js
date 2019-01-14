/**
 * @file mip-ad-ecom 的 url 模块
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 引入工具类
 *
 * @type {Object}
 */
let util = require('util')
let dom = require('mip-ad-ecom/dom')
let data = require('mip-ad-ecom/data')

/**
 * mip连接特殊情况，从 hash 中获取参数
 *
 * @returns {Object}     合并后的数据对象
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

  // 内容联盟导流字段
  let originalSource = data.getHashData('originalSource')
  let mediaid = data.getHashData('mediaid')
  if (originalSource) {
    params.originalSource = originalSource
  }
  if (mediaid) {
    params.mediaid = mediaid
  }

  return params
}

/**
 * 获取页面上用户设置的参数
 *
 * @param   {HTMLElement}    element    mip-ad-ecom 组件节点
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
        console.warn('mip-ad-ecom 缺少 accid 参数')
        return
      }
      if (!userParams.title) {
        console.warn('mip-ad-ecom 缺少 title 参数')
        return
      }

      // 站长传过来的title 是编码后的，需要进行解码
      for (let key in userParams) {
        if (userParams.hasOwnProperty(key)) {
          userParams[key] = decodeURIComponent(userParams[key])
        }
      }
    }
  } catch (err) {
    console.warn('json is illegal'); // eslint-disable-line
    console.warn(err); // eslint-disable-line
    return
  }
  return userParams
}

/**
 * 集合异步请求所需要的所有参数
 *
 * @param   {HTMLElement} element mip-ad-ecom 组件节点
 * @returns {Object} 异步请求所需要的参数对象
 */
function getUrlParams (element) {
  let userParams = getUserParams(element)
  if (!userParams) {
    return null
  }
  // 唯一与mip-custom 不同的地方，请求增加参数 &from=cmip
  return util.fn.extend(getHashParams(), userParams, {'from': 'cmip'})
}

/**
 * url 拼接函数
 *
 * @param   {HTMLElement} element mip-ad-ecom 组件节点
 * @returns {string}  拼接后的url
 */
function getUrl (element) {
  let firstKey = true
  let url = data.ajaxUrl
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

  return url
}

export default {
  get: getUrl
}

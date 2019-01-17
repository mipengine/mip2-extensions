/**
 * @file mip-ad-ecom 的 url 模块
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import dom from './dom'
import dataProcessor from './data'

const { util } = MIP
const { jsonParse, fn, log } = util
const logger = log('mip-ad-ecom')

/**
 * mip 连接特殊情况，从 hash 中获取参数
 *
 * @returns {Object}     合并后的数据对象
 */
function getHashParams () {
  let params = dataProcessor.REQUEST_PARAMS
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      params[key] = dataProcessor.getHashData(key) || params[key]
    }
  }

  // 修改字段名
  params.logid = dataProcessor.getHashData('lid')
  params.eqid = dataProcessor.getHashData('eqid')

  // 内容联盟导流字段
  let originalSource = dataProcessor.getHashData('originalSource')
  let mediaid = dataProcessor.getHashData('mediaid')
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
      userParams = jsonParse(script.textContent)
      if (!userParams.accid) {
        return logger.warn(element, '缺少 accid 属性')
      }
      if (!userParams.title) {
        return logger.warn(element, '缺少 title 属性')
      }

      // 站长传过来的title 是编码后的，需要进行解码
      for (let key in userParams) {
        if (userParams.hasOwnProperty(key)) {
          userParams[key] = decodeURIComponent(userParams[key])
        }
      }
    }
  } catch (err) {
    return logger.warn(element, '不正确的 JSON', err)
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
  // 唯一与 mip-custom 不同的地方，请求增加参数 &from=cmip
  return fn.extend(getHashParams(), userParams, {from: 'cmip'})
}

/**
 * url 拼接函数
 *
 * @param   {HTMLElement} element mip-ad-ecom 组件节点
 * @returns {string}  拼接后的 url
 */
export default function getUrl (element) {
  let firstKey = true
  let url = dataProcessor.AJAX_URL
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

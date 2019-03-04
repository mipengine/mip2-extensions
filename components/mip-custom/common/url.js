/**
 * @file 定制化有关dom操作的方法集
 * @author liujing
 */

// import modules
import data from './data'
import dom from './dom'

// import tools
const {util} = MIP

/**
 * [getHashparams mip连接特殊情况，从 hash 中获取参数]
 *
 * @returns {Object}    合并后的数据对象
 */
const getHashParams = () => {
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

  // pc标识字段
  params.fromSite = data.getHashData('fromSite')

  return params
}

/**
 * [getUserParams 获取页面上用户设置的参数]
 *
 * @param   {HTMLElement}   el          mip-custom 组件节点
 * @returns {Object}        userParams  用户设置的参数对象
 */
const getUserParams = el => {
  let userParams = null

  // 获取用户设置参数，获取不到则报错并返回
  try {
    const script = dom.getConfigScriptElement(el)
    if (script) {
      userParams = JSON.parse(script.textContent)
      if (!userParams.accid) {
        console.warn('mip-custom 缺少 accid 参数')
        return
      }
      if (!userParams.title) {
        console.warn('mip-custom 缺少 title 参数')
        return
      }

      // 站长传过来的title 是编码后的，需要进行解码
      for (let key in userParams) {
        if (userParams.hasOwnProperty(key)) {
          userParams[key] = decodeURIComponent(userParams[key])
        }
      }
    }
  } catch (error) {
    console.warn('json is illegal')
    console.warn(error)
    return
  }
  return userParams
}

/**
 * [getUrlParams 集合异步请求所需要的所有参数]
 *
 * @param  {HTMLElement}    el      mip-custom 组件节点
 * @returns {Object}            异步请求所需要的参数对象
 */
const getUrlParams = el => {
  let userParams = getUserParams(el)
  if (!userParams) {
    return null
  }

  return util.fn.extend(getHashParams(), userParams)
}

/**
 * [getSourceId 获取信息来源]
 *
 * @returns {Object}  xxx
 */
const getSourceId = () => {
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
 * [get url 拼接函数]
 *
 * @param  {HTMLElement}    el    mip-custom, 只监听当前组件下的 a 标签
 * @param  {string}         poi   区分AB区的url
 * @returns {string}              拼接后的url
 */
const get = (el, poi) => {
  let firstKey = true
  let url = data.ajaxUrl
  let urlParams = getUrlParams(el)

  if (!urlParams) {
    return
  }

  for (let key in urlParams) {
    if (urlParams.hasOwnProperty(key)) {
      url += (!firstKey ? '&' : '') + key + '=' + urlParams[key]
      firstKey = false
    }
  }

  // XXX: A区的请求合并，目前这块的业务逻辑确实，交接人未告知;
  if (poi === 'top') {
    let sourceId = getSourceId()
    if (sourceId) {
      url += '&sourceId=' + encodeURIComponent(sourceId)
    }
  }

  // 非mip-shell增加noshell参数
  if (MIP.standalone) {
    url += '&from=noshell'
  }
  return url
}

export default {
  get
}

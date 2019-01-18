/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */

/**
 * REGEXS 正则表达式
 *
 * @type {Object}
 */
const REGEXS = {
  html: /<mip-\S*>(.*)<\/mip-\S*></,
  script: /<script[^>]*>(.*?)<\/script>/g,
  style: /<style[^>]*>(.*?)<\/style>/g,
  innerHtml: />([\S\s]*)<\//,
  customTag: /<(mip-\S+)>/,
  tag: '<([^\\s|>]*)',
  tagandAttr: /<(mip-[^>]*)>/,
  regHttp: /\/c\/(\S*)/,
  regHttps: /\/c\/s\/(\S*)/,
  domain: /^(http(s)?:\/\/)?[^/]*baidu.com/
}

/**
 * params 请求数据所需参数
 *
 * @type {Object}
 */
let params = {
  logid: '',
  query: '',
  title: '',
  frsrcid: getHashData('srcid'),
  originalUrl: getSubString(location.pathname, REGEXS.regHttps) ||
          getSubString(location.pathname, REGEXS.regHttp) ||
          location.href
}

/**
 * mip-ad-ecom 组件所引入的动态组件的请求或者静态资源的 host
 *
 * @type {string}
 */
const DOMAIN = 'https://mipengine.baidu.com/'

/**
 * 广告请求的 ajax url
 *
 * @type {string}
 */
const AJAX_URL = DOMAIN + 'common?'

/**
 * 广告请求的 ajax url
 *
 * @type {string}
 */
const TOP_AJAX_URL = DOMAIN + 'commonTop?'

/**
 * log 日志地址
 *
 * @type {string}
 */
const LOGDATA_HOST = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/owb.gif'

/**
 * 性能数据地址
 *
 * @type {string}
 */
const PERFORMANCEDATA_HOST = 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif'

let logData = {
  host: LOGDATA_HOST,
  params: {
    type: 3,
    pid: 1106,
    qid: getHashData('lid'),
    q: getHashData('word'),
    srcid: getHashData('srcid')
  },
  exposure: {
    fm: 'view',
    data: encodeURIComponent('[{"type": "w", "action": "show"}]')
  },
  error: {
    fm: 'ex',
    en: 'mip_async_err'
  }
}

let performanceData = {
  host: PERFORMANCEDATA_HOST,
  params: {
    pid: '1_4',
    type: 'pf_comm',
    lid: getHashData('lid'),
    info: {},
    group: 'common',
    ts: new Date() - 0
  }
}
/**
 * 定制化组件的基础依赖
 *
 * @type {Object}
 */
const CONFIG = {
  domain: DOMAIN,
  paths: {
    'js/nav': 'static/js/nav',
    'js/util': 'static/js/util',
    'js/mip-ecom/ck': 'static/js/mip-ecom/ck',
    'js/mip-ecom/mip-ecom-phoneDail': 'static/js/mip-ecom/phoneDail'
  }
}

/**
 * getHashData 根据 key 获取 hash 中的数据
 *
 * @param {string} key key
 * @returns {string} value
 */
function getHashData (key) {
  let MIP = window.MIP || {}
  return MIP && MIP.hash && MIP.hash.get ? MIP.hash.get(key) : ''
}

/**
 * 修改动态配置 AMD path
 *
 * @param {Object} config amd 模块配置信息
 * @returns {Object} 修改后的 amd 模块配置
 */
function updatePaths (config) {
  let conf = JSON.parse(JSON.stringify(config))
  if (conf.paths) {
    for (let key in conf.paths) {
      if (conf.paths.hasOwnProperty(key)) {
        conf.paths[key] = conf.domain + conf.paths[key]
      }
    }
  }

  return conf
}

/**
 * 根据正则获取子串
 *
 * @param  {string} str [截取钱字符串]
 * @param  {RegExp} reg [正则表达式]
 * @param  {number} pos [位置]
 * @returns {string} [截取后字符串]
 */
function getSubString (str, reg, pos) {
  pos = pos ? 0 : 1
  return str.match(reg) && str.match(reg)[pos] ? str.match(reg)[pos] : ''
}

export default {
  DOMAIN,
  AJAX_URL,
  TOP_AJAX_URL,
  REGEXS,
  params,
  CONFIG,
  updatePaths,
  getSubString,
  logData,
  performanceData,
  getHashData
}

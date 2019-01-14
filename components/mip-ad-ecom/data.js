/**
 * @file mip-ad-ecom 组件的 data 处理工具
 * @author mj(zoumiaojiang@gmail.cpm)
 */

/**
 * 正则表达式
 *
 * @type {Object}
 */
let regexs = {
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
 * 请求数据所需参数
 *
 * @type {Object}
 */
let params = {
  logid: '',
  query: '',
  title: '',
  originalUrl: getSubString(window.location.pathname, regexs.regHttps) ||
    getSubString(window.location.pathname, regexs.regHttp)
}

let config = {
  domain: 'https://mipengine.baidu.com/',
  paths: {
    'js/nav': 'static/js/nav',
    'js/util': 'static/js/util',
    'js/mip-ecom/ck': 'static/js/mip-ecom/ck'
  }
}

/**
 * 根据 key 获取 hash 中的数据
 *
 * @param   {string} key key
 * @returns {string}     value
 */
function getHashData (key) {
  let MIP = window.MIP || {}
  return MIP && MIP.hash && MIP.hash.get ? MIP.hash.get(key) : ''
}

function addPaths (config) {
  if (config.paths) {
    for (let key in config.paths) {
      if (config.paths.hasOwnProperty(key)) {
        config.paths[key] = config.domain + config.paths[key]
      }
    }
  }

  return config
}

/**
 * [getSubString 根据正则获取子串]
 *
 * @param   {string}  str 截取前字符串
 * @param   {RegExp}  reg 正则表达式
 * @param   {number} pos  位置
 * @returns {string}      截取后字符串
 */
function getSubString (str, reg, pos) {
  pos = pos ? 0 : 1
  let res = str.match(reg) && str.match(reg)[pos] ? str.match(reg)[pos] : ''
  return res
}

export default {
  domain: 'https://mipengine.baidu.com/',
  ajaxUrl: 'https://mipengine.baidu.com/common?',
  regexs: regexs,
  params: params,
  config: config,
  addPaths: addPaths,
  subStr: getSubString,
  getHashData: getHashData
}

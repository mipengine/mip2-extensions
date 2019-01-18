/**
 * @file mip-ad-ecom 组件的 data 处理工具
 * @author mj(zoumiaojiang@gmail.cpm)
 */

/* global MIP */

let { hash } = MIP

/**
 * 正则表达式管理 map
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
 * 请求数据所需参数
 *
 * @type {Object}
 */
let REQUEST_PARAMS = {
  logid: '',
  query: '',
  title: '',
  originalUrl: getSubString(window.location.pathname, REGEXS.regHttps) ||
    getSubString(window.location.pathname, REGEXS.regHttp)
}

/**
 * 默认的 amd paths 的配置
 *
 * @type {string}
 */
const CONFIG = {
  domain: DOMAIN,
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
  return hash.get(key) || ''
}

/**
 * 修改动态配置 AMD path
 *
 * @param   {Object} config amd 模块配置信息
 * @returns {Object}       修改后的 amd 模块配置
 */
function updatePaths (config) {
  if (config.paths) {
    Object.keys(config.paths).forEach(key => {
      config.paths[key] = config.domain + config.paths[key]
    })
  }

  return config
}

/**
 * 根据正则获取子串
 *
 * @param   {string}  str 截取前字符串
 * @param   {RegExp}  reg 正则表达式
 * @param   {number}  pos 位置
 * @returns {string}      截取后字符串
 */
function getSubString (str, reg, pos = 1) {
  let matchArr = str.match(reg)
  return matchArr && matchArr[pos] ? matchArr[pos] : ''
}

export default {
  DOMAIN,
  AJAX_URL,
  REGEXS,
  REQUEST_PARAMS,
  CONFIG,
  updatePaths,
  getSubString,
  getHashData
}

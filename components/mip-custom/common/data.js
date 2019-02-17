/**
 * @file data方法集
 * @author liujing
 */

/**
 * [getSubString 根据正则获取子串]
 *
 * @param  {string}  str [截取钱字符串]
 * @param  {RegExp}  reg [正则表达式]
 * @param  {number} pos [位置]
 * @returns {string}      [截取后字符串]
 */
const getSubString = (str, reg, pos) => {
  pos = pos ? 0 : 1
  return str.match(reg) && str.match(reg)[pos] ? str.match(reg)[pos] : ''
}

/**
 * [getHashData 根据 key 获取 hash 中的数据]
 *
 * @param  {string} key key
 * @returns {string}     value
 */
const getHashData = key => {
  return MIP && MIP.hash && MIP.hash.get ? MIP.hash.get(key) : ''
}

/**
 * [addPaths 对common返回的config数据进行公共模块的路径拼接]
 *
 * @param  {string} config  common返回的config
 * @returns {string}         拼接后的数据
 */
const addPaths = config => {
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
 * [REGEXS 正则表达式]
 * @type {Object}
 */
/* eslint-disable no-useless-escape */
const REGEXS = {
  html: /<mip-\S*>(.*)<\/mip-\S*></,
  script: /<script[^>]*>(.*?)<\/script>/g,
  style: /<style[^>]*>(.*?)<\/style>/g,
  innerHtml: />([\S\s]*)<\//,
  customTag: /<(mip-\S+)>/,
  tag: '\<([^\\s|\>]*)',
  tagandAttr: /<(mip-[^>]*)>/,
  regHttp: /\/c\/(\S*)/,
  regHttps: /\/c\/s\/(\S*)/,
  domain: /^(http(s)?:\/\/)?[^\/]*baidu.com/
}

/**
 * [params 请求数据所需参数]
 * @type {Object}
 */
let params = {
  logid: '',
  query: '',
  title: '',
  originalUrl: getSubString(location.pathname, REGEXS.regHttps) ||
    getSubString(location.pathname, REGEXS.regHttp) ||
    location.href
}

/**
 * [config common返回的广告的公共依赖的配置，目前如果common请求返回有数据则不走此逻辑]
 * @type {Object}
 */
let config = {
  domain: 'https://mipengine.baidu.com/',
  paths: {
    'js/nav': 'static/js/nav',
    'js/util': 'static/js/util',
    'js/mip-ecom/ck': 'static/js/mip-ecom/ck',
    'js/mip-ecom/mip-ecom-phoneDail': 'static/js/mip-ecom/phoneDail'
  }
}

/**
 * [performanceData 性能日志的数据]
 * @type {Object}
 */
let performanceData = {
  host: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/mwb2.gif',
  params: {
    pid: '1_4',
    type: 'pf_comm',
    lid: getHashData('lid'),
    info: {},
    group: 'common',
    ts: +new Date()
  }
}

/**
 * [logData 发送log的数据配置]
 * @type {Object}
 */
let logData = {
  host: 'https://sp1.baidu.com/5b1ZeDe5KgQFm2e88IuM_a/owb.gif',
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

export default {
  domain: 'https://mipengine.baidu.com/',
  ajaxUrl: 'https://mipengine.baidu.com/common?',
  REGEXS,
  params,
  config,
  performanceData,
  logData,
  addPaths,
  getHashData,
  subStr: getSubString
}

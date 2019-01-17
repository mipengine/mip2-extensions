/**
 * @file util
 * @author sekiyika(pengxing@baidu.com)
 */

/**
 * 判断 URL 是否是 service worker 安全
 *
 * @param {string} url url
 * @returns {boolean} is secure url
 */
export function isSecureUrl (url) {
  if (typeof url === 'string') {
    url = parseUrl(url)
  }

  return (url.protocol === 'https:' ||
    url.hostname === 'localhost' ||
    endsWith(url.hostname, '.localhost'))
}

/**
 * 判断字符串是否以某字符串结尾
 *
 * @param {string} str string
 * @param {string} suffix suffix
 * @returns {boolean} is ended with
 */
export function endsWith (str, suffix) {
  let index = str.length - suffix.length
  return index >= 0 && str.indexOf(suffix, index) === index
}

/**
 * 缓存 a 标签
 *
 * @type {HTMLAnchorElement}
 */
let a

/**
 * 缓存 URL 和处理后的结果
 *
 * @type {Object<string, !Location>}
 */
let cache = {}

/**
 * 把 url 处理成 URL {@link https://developer.mozilla.org/en-US/docs/Web/API/URL/URL}
 * 如果 url 是相对路径，会被转成绝对地址
 *
 * @param {string} url url
 * @returns {URL} parsed url
 */
export function parseUrl (url) {
  if (!a) {
    a = document.createElement('a')
  }

  let fromCache = cache[url]
  if (fromCache) {
    return fromCache
  }

  cache[url] = parseUrlWithA(a, url)
  return cache[url]
}

/**
 * 返回链接处理后的结果，Location lke
 *
 * @param {!HTMLAnchorElement} a a element
 * @param {string} url url
 * @returns {!Location} parsed url
 */
function parseUrlWithA (a, url) {
  a.href = url

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick #3449.
  if (!a.protocol) {
    a.href = a.href
  }

  /* eslint-disable eqeqeq */
  let info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: null
  }

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if ((info.protocol === 'http:' && info.port == 80) ||
    (info.protocol === 'https:' && info.port == 443)) {
    info.port = ''
    info.host = info.hostname
  }
  /* eslint-enable eqeqeq */

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin !== 'null') {
    info.origin = a.origin
  } else if (info.protocol === 'data:' || !info.host) {
    info.origin = info.href
  } else {
    info.origin = info.protocol + '//' + info.host
  }

  return info
}

/**
 * 返回去掉 hash 的 URL
 *
 * @param {string} url source url
 * @returns {string} substring
 */
export function getUrlWithoutHash (url) {
  let index = url.indexOf('#')
  if (index === -1) {
    return url
  }
  return url.substring(0, index)
}

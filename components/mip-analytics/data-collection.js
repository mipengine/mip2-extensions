/**
 * @file 收集 MIP 额外的数据
 * @author mj(zoumiaojiang@gmail.com)
 */

/* globals MIP */

const { viewport, viewer } = MIP

/**
 * 解析 URL
 *
 * @param {string} url url 字符串
 * @returns {Object} 解析的结果
 */
function urlParser (url) {
  let a = document.createElement('a')
  if (!url) {
    return {}
  }
  a.href = url
  return {
    source: encodeURIComponent(url),
    protocol: a.protocol.replace(':', ''),
    host: a.host,
    hostname: a.hostname,
    port: a.port,
    query: encodeURIComponent(a.search),
    path: encodeURIComponent(a.pathname.replace(/^([^/])/, '/$1'))
  }
}

const mipUrl = urlParser(window.location.href)
const canonicalEle = document.querySelector('[rel="canonical"]')
const canonicalUrl = urlParser(canonicalEle ? (canonicalEle.getAttribute('href') || '') : '')
const sourceUrlMatch = mipUrl.source.match(/\/c\/s(.*)/)
const sourceUrl = urlParser((sourceUrlMatch && sourceUrlMatch[1]) ? sourceUrlMatch[1] : '')

export default function getData () {
  return {
    browserLanguage: navigator.language,
    canonicalHost: canonicalUrl.host || '',
    canonicalHostname: canonicalUrl.hostname || '',
    canonicalPath: canonicalUrl.path || '',
    canonicalUrl: canonicalUrl.source || '',
    documentReferrer: encodeURIComponent(document.referrer || ''),
    documentCharset: document.charset,
    isIframe: false,
    isShow: false,
    mipVersion: 2,
    mipdocHost: mipUrl.host || '',
    mipdocHostname: mipUrl.hostname || '',
    mipdocPath: mipUrl.path || '',
    mipdocUrl: mipUrl.source || '',
    pageId: encodeURIComponent(viewer.page.pageId),
    queryParam: mipUrl.query,
    random: Math.floor(Math.random() * 100),
    screenColorDepth: window.screen.colorDepth,
    screenWidth: viewport.getWidth(),
    screenHeight: viewport.getHeight(),
    scrollTop: viewport.getScrollTop(),
    scrollHeight: viewport.getScrollHeight(),
    scrollLeft: viewport.getScrollLeft(),
    scrollWidth: viewport.getScrollWidth(),
    sourceHost: sourceUrl.host || '',
    sourceHostname: sourceUrl.hostname || '',
    sourcePath: sourceUrl.path || '',
    sourceUrl: sourceUrl.source || '',
    standalone: false,
    timestamp: Date.now(),
    timezone: (Intl && Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
    timezonCode: (new Date()).getTimezoneOffset() / 60,
    title: encodeURIComponent(document.title),
    userAgent: navigator.userAgent,
    viewportWidth: viewport.getWidth(),
    viewportHeight: viewport.getHeight()
  }
}

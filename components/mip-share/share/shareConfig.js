/**
 * @file shareConfig 管理类
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global location, setShareInfo, wx */

import './wxSdk.min'

/**
 * UA 信息
 *
 * @type {string}
 */
const UA = navigator.userAgent

/**
 * 是否是微信环境
 *
 * @type {boolean}
 */
const IS_WX = /micromessenger\//i.test(UA)

/**
 * 是否是手百环境
 *
 * @type {boolean}
 */
const IS_BD_BOX = / baiduboxapp\//i.test(UA)

/**
 * 是否是 QQ 浏览器环境
 *
 * @type {boolean}
 */
const IS_QQ = /\bqq\b/i.test(UA)

// let isWeibo = /\bweibo\b/i.test(UA)

/**
 * 空函数
 *
 * @type {Function}
 */
const EMPTY_FUNC = function () {}

/**
 * 当前环境的 protocol
 *
 * @type {string}
 */
const PROTOCAL = location.protocol

/**
 * 默认的标题
 *
 * @type {string}
 */
const DEFAULT_TITLE = '百度App'

/**
 * 默认的描述
 *
 * @type {string}
 */
const DEFAULT_DESC = '百度App'

/**
 * 默认的图标地址
 *
 * @type {string}
 */
const DEFAULT_ICON = 'https://b.bdstatic.com/searchbox/icms/searchbox/img/po/act/newuserredpack/box_logo.png'

let globalOptions

/**
 * 加载 JS
 *
 * @param {?Object} opts 配置的参数
 */
function loadJS (opts) {
  let header = document.head || document.getElementsByTagName('head')[0] || document.documentElement
  let {
    url,
    data,
    success = EMPTY_FUNC,
    error = EMPTY_FUNC,
    timeout = 2e4
  } = opts

  let callbackName
  let script = document.createElement('script')

  script.type = 'text/javascript'

  if (typeof data === 'object') {
    let tmpArr = []
    Object.keys(data).forEach(key => tmpArr.push(key + '=' + encodeURIComponent(data[key])))
    data = tmpArr.join('&')
  }
  if (data) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + data
  }

  url = url.replace(/[&?]{1,2}/, '?')

  if (/=\?/.test(url)) {
    callbackName = '_box_jsonp' + Date.now()
    url = url.replace(/=\?/, '=' + callbackName)
  }

  script.src = url

  let done = true
  let timer
  let clear = () => {
    if (callbackName) {
      delete window[callbackName]
    }
    timer && clearTimeout(timer)
    script.onload = script.onreadystatechange = script.onerror = null
    script = null
  }

  let cb = () => {
    if (script && (!script.readyState || /loaded|complete/.test(script.readyState))) {
      clear()
      if (done && typeof success === 'function') {
        success.apply(null, [].slice.call(arguments))
      }
      done = false
    }
  }

  let errorCallback = evt => {
    clear()
    done && error(evt)
    done = false
  }

  if (callbackName) {
    window[callbackName] = cb
  }

  timer = setTimeout(() => {
    clear()
    done && error('timeout')
    done = false
  }, timeout)

  script.onload = script.onreadystatechange = script.onerror = cb
  script.onerror = errorCallback
  header.appendChild(script)
}

/**
 * 获取 dom 文本
 *
 * @param {HTMLElement} elem  DOM 元素
 */
function getText (elem) {
  if (elem.nodeType !== 1) {
    return ''
  }
  return elem.innerHTML.replace(/(\n|<script.*?script>|(<.*?>)|(<script>.*?<\/script>))/gim, '').trim()
}

/**
 * 获取默认的分享图
 *
 * @param {Function} callback   回调函数
 * @param {string}   defaultUrl 默认的图片路径
 */
function getShareImg (callback, defaultUrl) {
  let imgsOfPage = document.getElementsByTagName('img')
  let length = imgsOfPage.length

  for (let index = 0; index < (length <= 10 ? length : 10); index++) {
    let item = imgsOfPage[index]
    let newImg = document.createElement('img')
    newImg.src = item.src
    newImg.onload = () => (newImg.width > 290 && newImg.height > 290 && callback(newImg.src))
  }

  setTimeout(() => callback(defaultUrl), 1e3)
}

/**
 * 发送错误日志
 *
 * @param {Object} evt 事件对象
 * @param {string} msg 日志内容
 */
function sendErrorLog (evt, msg) {
  if ((Math.random() <= 0.95 && location.href.indexOf('share_config_random=1') < 0) || !evt || !msg) {
    return
  }

  msg = encodeURIComponent(msg)

  let pageId = '300_001'
  let tcboxUrl = '//m.baidu.com/tcbox?service=bdbox&action=pblog&data=' + encodeURIComponent(JSON.stringify({
    appid: 1,
    dataid: 2,
    cateid: 26,
    actionid: 2,
    actiontype: '0',
    actiondata: {
      type: 0,
      timestamp: Date.now(),
      content: {
        page_id: pageId,
        logtype: 3,
        type: `c_${evt}`,
        msg: msg
      }
    }
  }))

  let ispeedUrl = `//ispeed.baidu.com/e.gif?t=${Date.now()}&page_id=${pageId}&evt=c_${evt}&msg=${msg}`
  let urls = [PROTOCAL + tcboxUrl, PROTOCAL + ispeedUrl]

  urls.forEach(url => {
    let img = document.createElement('img')
    img.onload = img.onerror = img.onabort = () => {
      img = null
    }
    img.src = url
  })
}

/**
 * 处理分享具体操作
 *
 * @param {?Object}  options         分享的归置后的配置信息
 * @param {Function} successcallback 分享成功的回调
 * @param {Function} failCallback    分享失败后的回调
 */
function shareHandle (options, successcallback, failCallback) {
  let debug = !!options.debug

  if (IS_BD_BOX) {
    delete options.wx
    let bdbox = options.bdbox || {}
    if (!bdbox.source) {
      sendErrorLog('no_bdbox_source', location.href)
      return
    }

    let data = {
      type: 'url',
      mediaType: 'all',
      linkUrl: location.href,
      source: bdbox.source
    }

    for (let i in options) {
      if (i !== 'bdbox') {
        data[i] = options[i]
      }
    }

    window['__BdboxShare_success__'] = successcallback || console.log
    window['__BdboxShare_fail__'] = failCallback || console.log
    window.BoxShareData = {
      options: data,
      successcallback: '__BdboxShare_success__',
      errorcallback: '__BdboxShare_fail__'
    }
  } else if (IS_WX || IS_QQ) {
    delete options.bdbox
    options.wx = options.wx || {}
    options.wx.appId = options.wx.appId || 'wxadc1a0c6b9096e89'
    options.wx.jsApiList = options.wx.jsApiList || []
    options.wx.jsApiList = options.wx.jsApiList.concat(['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'])

    loadJS({
      url: PROTOCAL + options.wx.api,
      data: {
        url: encodeURIComponent(location.href),
        callback: '?',
        ts: Date.now()
      },
      success (res) {
        if (!res.errno) {
          return sendErrorLog('wx_gettoken_err', location.href)
        }

        let data = res.data || {}

        if (IS_WX) {
          wx.config({
            debug,
            jsApiList: options.wx.jsApiList,
            appId: data.appId,
            nonceStr: data.nonceStr,
            timestamp: data.timestamp,
            signature: data.signature
          })
          let configData = {
            title: options.title,
            desc: options.content,
            link: options.linkUrl,
            imgUrl: options.iconUrl,
            success () {
              successcallback && successcallback()
            },
            cancel () {
              failCallback && failCallback()
            }
          }
          wx.ready(() => {
            wx.onMenuShareTimeline(configData)
            wx.onMenuShareAppMessage(configData)
            wx.onMenuShareQQ(configData)
            wx.onMenuShareWeibo(configData)
            wx.onMenuShareQZone(configData)
          })
        }
        if (IS_QQ) {
          setShareInfo({
            title: options.title,
            summary: options.content,
            pic: options.iconUrl,
            url: options.linkUrl,
            WXconfig: {
              swapTitleInWX: false,
              appId: data.appId,
              timestamp: data.timestamp,
              nonceStr: data.nonceStr,
              signature: data.signature
            }
          })
        }
      }
    })
  }
}

/**
 * 初始化配置信息
 *
 * @param {Object}   options 配置项对象
 * @param {Function} success 成功回调
 * @param {Function} fail    失败回调
 */
function initConfig (options, success, fail) {
  if (typeof options !== 'object') {
    return
  }

  globalOptions = options

  if ((IS_WX && !wx) || (IS_QQ && !window.setShareInfo)) {
    return
  }

  if (!options.titleDefault) {
    options.titleDefault = DEFAULT_TITLE
  }

  if (!options.contentDefault) {
    options.contentDefault = DEFAULT_DESC
  }

  if (!options.iconUrlDefault) {
    options.iconUrlDefault = DEFAULT_ICON
  }

  if (!options.title) {
    options.title = document.title.trim()
    if (!options.title) {
      options.title = options.titleDefault
    }
  }

  if (!options.linkUrl) {
    options.linkUrl = location.href
  }

  if (!options.content) {
    options.content = document.body
  }

  if (options.content.nodeType === 1) {
    options.content = getText(options.content)
  }

  if (!options.content || typeof options.content !== 'string') {
    options.content = options.contentDefault
  }

  if (options.content.length > 50) {
    options.content = options.content.slice(0, 50) + '...'
  }

  let isGetImgCalled = false

  if (!options.iconUrl) {
    getShareImg(result => {
      if (isGetImgCalled) {
        return
      }
      isGetImgCalled = true
      options.iconUrl = result
      shareHandle(options, success, fail)
    }, options.iconUrlDefault)
  } else {
    shareHandle(options, success, fail)
  }
}

/**
 * 配置信息
 */
const sealConfig = {
  init () {
    initConfig.apply(this, arguments)
  },

  update (options) {
    if (!globalOptions) {
      return
    }

    options = Object.assign({}, globalOptions, options)

    if (IS_WX) {
      if (wx) {
        initConfig.call(this, options)
      }
    } else {
      initConfig.call(this, options)
    }
  }
}

export default class ShareConfig {
  constructor (options) {
    let defaultConfig = options
    defaultConfig['channel'] = 'pageSeach'
    defaultConfig['debug'] = false
    defaultConfig['linkUrl'] = window.location.href
    sealConfig.init(defaultConfig)
  }

  update (options) {
    sealConfig.update(options)
  }
}

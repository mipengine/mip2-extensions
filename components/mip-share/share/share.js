/**
 * @file 分享 Share 基类
 * @author mj(zoumiaojiang@gmail.com)
 * @description UC & QQ share based on https://github.com/JefferyWang/nativeShare.js
 */

/* globals MIP, Box, ucweb, browser, ucbrowser, $ */

import detect from './detect'
import ShareConfig from './shareConfig'

const { util, viewer } = MIP
const { platform } = util

/**
 * 分享组件的默认配置
 *
 * @type {Object}
 */
const DEFAULT_OPTIONS = {
  url: window.location.href,
  title: '百度搜索有惊喜', // 分享至外站的title,必选
  content: '百度搜索有惊喜', // 分享至外站的摘要,可选,默认用title替代
  iconUrl: '//m.baidu.com/se/static/pmd/pmd/share/images/bdu.jpg',
  custom: []
}

/**
 * 当前设备的操作系统信息
 *
 * @type {Object}
 */
const CURRENT_OS = detect.getOS()

/**
 * 当前设备的浏览器信息
 *
 * @type {Object}
 */
const CURRENT_BROWSER = detect.getBrowser()

/**
 * 是否是手机百度环境
 *
 * @type {boolean}
 */
const IS_ZBIOS = CURRENT_BROWSER.name === 'zbios'

/**
 * 是否是 UC 浏览器
 *
 * @type {boolean}
 */
const IS_UC = CURRENT_BROWSER.name === 'uc'

/**
 * 是否是 QQ 浏览器
 *
 * @type {boolean}
 */
const IS_QQ = platform.isQQ() && CURRENT_BROWSER.version && CURRENT_BROWSER.version > '5.4'

/**
 * 是否是微信环境
 *
 * @type {boolean}
 */
const IS_WECHAT = platform.isWechatApp()

/**
 * 微信朋友圈分享按钮配置
 *
 * @type {Object}
 */
const WX_PYQ_SHARE_CONFIG = {
  key: 'pyq',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/pyq.png',
  title: '朋友圈',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      // 手百调起逻辑
      fn = opt => {
        opt.mediaType = 'weixin_timeline'
        baiduShare(opt, false)
      }
    } else if (IS_UC) {
      // UC 浏览器调起分享逻辑
      fn = opt => ucShare('pyq', opt)
    } else if (IS_QQ) {
      // QQ 浏览器调起分享逻辑
      fn = opt => qqShare('pyq', opt)
    } else if (IS_WECHAT) {
      fn = wechatTips
    }
    return fn
  })()
}

/**
 * 微信好友分享按钮配置
 *
 * @type {Object}
 */
const WX_FRIEND_SHARE_CONFIG = {
  key: 'wxfriend',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/wxfriend.png',
  title: '微信好友',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      fn = opt => {
        opt.mediaType = 'weixin_friend'
        baiduShare(opt, false)
      }
    } else if (IS_UC) {
      fn = opt => ucShare('wxfriend', opt)
    } else if (IS_QQ) {
      fn = opt => qqShare('wxfriend', opt)
    } else if (IS_WECHAT) {
      fn = wechatTips
    }
    return fn
  })()
}

/**
 * QQ 好友分享按钮配置
 *
 * @type {Object}
 */
const QQ_FRIEND_SHARE_CONFIG = {
  key: 'qqfriend',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/qqfriend.png',
  title: 'QQ好友',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      fn = opt => {
        opt.mediaType = 'qqfriend'
        baiduShare(opt, false)
      }
    } else if (IS_UC) {
      fn = opt => ucShare('qqfriend', opt)
    } else if (IS_QQ) {
      fn = opt => qqShare('qqfriend', opt)
    }
    return fn
  })()
}

/**
 * QQ 空间分享按钮配置
 *
 * @type {Object}
 */
const QZONE_SHARE_CONFIG = {
  key: 'qzone',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/qzone.png',
  title: 'QQ空间',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      fn = opt => {
        opt.mediaType = 'qqdenglu'
        baiduShare(opt, false)
      }
    } else if (IS_UC && CURRENT_OS.name === 'ios') {
      fn = opt => ucShare('qzone', opt)
    } else if (IS_QQ) {
      fn = opt => qqShare('qzone', opt)
    } else {
      fn = opt => {
        let optUrl = encodeURIComponent(opt.url)
        let successUrl = encodeURIComponent(window.location.href)
        let shareContent = opt.content
        let shareTitle = opt.title
        let sharePics = encodeURIComponent(opt.iconUrl)
        window.open(`http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${optUrl}&successurl=${successUrl}&summary=${shareContent}&title=${shareTitle}&pics=${sharePics}`)
      }
    }
    return fn
  })()
}

/**
 * 新郎微博分享按钮配置
 *
 * @type {Object}
 */
const SINA_WEIBO_SHARE_CONFIG = {
  key: 'sinaweibo',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/sinaweibo.png',
  title: '新浪微博',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      // 手百调起逻辑
      fn = opt => {
        opt.mediaType = 'sinaweibo'
        baiduShare(opt, false)
      }
    } else if (IS_UC) {
      fn = opt => ucShare('sinaweibo', opt)
    } else if (IS_QQ) {
      fn = opt => qqShare('sinaweibo', opt)
    } else {
      fn = opt => {
        let shareUrl = encodeURIComponent(opt.url)
        let shareTitle = encodeURIComponent(opt.title)
        window.open(`http://v.t.sina.com.cn/share/share.php?url=${shareUrl}&title=${shareTitle}`)
      }
    }
    return fn
  })()
}

/**
 * 「更多」配置
 *
 * @type {Object}
 */
const MORE_CONFIG = {
  key: 'more',
  icon: '//m.baidu.com/se/static/pmd/pmd/share/images/more.png',
  title: '更多',
  cb: (() => {
    let fn
    if (IS_ZBIOS) {
      fn = opt => {
        opt.mediaType = 'all'
        baiduShare(opt, false)
      }
    } else if (IS_UC) {
      fn = opt => ucShare('', opt)
    } else if (IS_QQ) {
      fn = opt => qqShare('', opt)
    }
    return fn
  })()
}

/**
 * 往 iframe 外层发送 postMessage 消息
 *
 * @param {string} key  分享的 key
 * @param {Object} opt  分享的配置信息
 * @param {string} app  分享容器应用的名称 wchat | uc | qq
 */
function sendShareMessage (key, opt, app) {
  viewer.sendMessage('mip_share', {key, opt, app})
}

/**
 * 手百分享接口
 *
 * @param {Object}  cfg  手百分享接口的配置
 * @param {boolean} encode 是否是编码过的配置信息
 */
function baiduShare (cfg, encode) {
  window.onFail = () => {}
  window.onSuccess = () => {}

  let url = encodeURIComponent(cfg.url)

  if (encode) {
    cfg.url = url
    cfg.linkUrl = url
  }

  if (Box.os.android) {
    Box.android.invokeApp('Bdbox_android_utils', 'callShare', [
      JSON.stringify(cfg),
      window.successFnName || 'console.log',
      window.errorFnName || 'console.log'
    ])
  } else {
    Box.ios.invokeApp('callShare', {
      options: encodeURIComponent(JSON.stringify(cfg)),
      errorcallback: 'onFail',
      successcallback: 'onSuccess'
    })
  }
}

/**
 * UC 浏览器自带的分享接口
 *
 * @param {string} targetAppName 分享到那个 APP 终端，比如微信，微博等
 * @param {Object} opt           分享的配置信息
 */
function ucShare (targetAppName, opt) {
  let appNameMapList = {
    sinaweibo: ['kSinaWeibo', 'SinaWeibo', 11, '新浪微博'],
    wxfriend: ['kWeixin', 'WechatFriends', 1, '微信好友'],
    pyq: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
    qqfriend: ['kQQ', 'QQ', '4', 'QQ好友'],
    qzone: ['kQZone', 'QZone', '3', 'QQ空间']
  }

  let url = opt.url
  let title = opt.title
  let from = ''

  if (targetAppName) {
    targetAppName = CURRENT_OS.name === 'ios'
      ? appNameMapList[targetAppName][0]
      : appNameMapList[targetAppName][1]
  }

  if (!MIP.standalone) {
    sendShareMessage(targetAppName, opt, 'uc')
  }
  if (typeof ucweb !== 'undefined') {
    // 判断 ucweb 方法是否存在,安卓 uc 中可以使用
    ucweb.startRequest('shell.page_share', [title, title, url, targetAppName, '', '@' + from, ''])
  } else if (typeof ucbrowser !== 'undefined') {
    // 判断 ucbrowser 方法是否存在,ios uc 中可以使用
    ucbrowser.web_share(title, title, url, targetAppName, '', '@' + from, '')
  }
}

/**
 * QQ 浏览器分享接口
 *
 * @param {string} targetAppName 分享到那个 APP 终端，比如微信，微博等
 * @param {Object} opt           分享的配置信息
 */
function qqShare (targetAppName, opt) {
  let key = targetAppName
  let config = {}
  let appNameMapList = {
    sinaweibo: ['kSinaWeibo', 'SinaWeibo', 11, '新浪微博'],
    wxfriend: ['kWeixin', 'WechatFriends', 1, '微信好友'],
    pyq: ['kWeixinFriend', 'WechatTimeline', '8', '微信朋友圈'],
    qqfriend: ['kQQ', 'QQ', '4', 'QQ好友'],
    qzone: ['kQZone', 'QZone', '3', 'QQ空间']
  }

  let qqSharePromise = new Promise(resolve => {
    if (IS_QQ) {
      /**
       * zepto $.ajax 在 qq 浏览器上无法加载这个 api url 永远返回 fail。
       * jquery 以及直接请求均可以, 原因不明,采用原生方法实现异步加载
       *
       * @todo
       */
      let script = document.createElement('script')
      script.type = 'text/javascript'
      script.onload = script.onreadystatechange = () => {
        (!this.readyState ||
          this.readyState === 'loaded' ||
          this.readyState === 'complete') && resolve()
      }
      script.src = '//jsapi.qq.com/get?api=app.share'
      $('head').append(script)
    }
  })

  if (targetAppName) {
    targetAppName = appNameMapList[targetAppName][2]
    config = {
      url: opt.url,
      title: opt.title,
      description: opt.content,
      img_url: '',
      img_title: '',
      // 微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
      to_app: targetAppName,
      cus_txt: '请输入此时此刻想要分享的内容'
    }
  }

  // iframe 加载时，通过壳对外抛消息分享
  if (!MIP.standalone) {
    sendShareMessage(key, config, 'qq')
  }
  // QQ share API 加载完毕后执行
  qqSharePromise.then(() => {
    if (typeof (browser) !== 'undefined' && typeof (browser.app) !== 'undefined') {
      browser.app.share(config)
    }
  })
}

let globalWxShareTimer

/**
 * 微信显示分享提示浮层
 */
function wechatTips () {
  if ($('.c-share-wechat-tips').length) {
    $('.c-share-wechat-tips').show()
  } else {
    $(document.body).append('<div class="c-share-wechat-tips"></div>')
    $('.c-share-wechat-tips').on('click', function () {
      $(this).hide()
      clearTimeout(globalWxShareTimer)
    })
  }

  globalWxShareTimer = setTimeout(() => {
    $('.c-share-wechat-tips').hide()
    clearTimeout(globalWxShareTimer)
  }, 2000)
}

/**
 * 分享类
 *
 * @class
 */
export default class Share {
  constructor (opt) {
    // 参数校验并设置默认值
    this.opt = Object.assign({}, DEFAULT_OPTIONS, opt)

    if (!this.opt.content) {
      this.opt.content = this.opt.title
    }

    if (/^\/\/.+/.test(this.opt.url)) {
      this.opt.url = 'http:' + this.opt.url
    }

    this.opt.linkUrl = this.opt.url

    if (IS_WECHAT) {
      let wechatOptions = {
        title: this.opt.title,
        content: this.opt.content,
        iconUrl: this.opt.iconUrl,
        wx: {
          api: this.opt.wechatAPI,
          jsApiList: []
        }
      }

      this.wechatShare = new ShareConfig(wechatOptions)
    }

    this.init()
  }

  /**
   * 初始化分享组件
   */
  init () {
    let me = this

    /**
     * 分享入口配置列表
     *
     * @type {Array<Object>}
     */
    let list = []

    me.isRender = false // 标记当前渲染状态

    if (IS_ZBIOS || IS_UC || IS_QQ || IS_WECHAT) {
      list.push(
        WX_PYQ_SHARE_CONFIG,
        WX_FRIEND_SHARE_CONFIG
      )
    }
    if (IS_ZBIOS || IS_UC || IS_QQ) {
      list.push(QQ_FRIEND_SHARE_CONFIG)
    }

    list.push(
      QZONE_SHARE_CONFIG,
      SINA_WEIBO_SHARE_CONFIG
    )
    if (IS_ZBIOS || IS_UC || (IS_QQ && CURRENT_OS.name === 'ios')) {
      list.push(MORE_CONFIG)
    }

    me.list = list = list.concat(me.opt.custom)

    let str = ''
    if (list.length > 0) {
      str += '<div class="c-share-list">'
      let num = list.length
      let lines = Math.ceil(num / 4)
      for (let j = 0; j < lines; j++) {
        str += '<div class="c-row c-gap-bottom">'
        for (let i = 0; i < 4; i++) {
          let index = j * 4 + i
          let obj = list[index]

          if (obj) {
            str += '<div class="c-span3 c-share-btn c-share-btn-' + obj.key + '">'
            str += '<div class="c-img c-img-s">'
            str += '<img src="' + obj.icon + '" />'
            str += '</div>'
            str += '<div class="c-line-clamp1">' + obj.title + '</div>'
          } else {
            str += '<div class="c-span3 c-share-btn">'
          }

          str += '</div>'
        }
        str += '</div>'
      }
      str += '</div>'
    }

    me.$domShareList = $(str)

    me.bindEvent()
  }

  /**
   * 绑定分享按钮点击事件
   */
  bindEvent () {
    let me = this
    let doBind = () => {
      // key = ['pyq', 'wxfriend', 'qqfriend', 'qzone', 'sinaweibo', 'more'];
      me.$domShareList.find('.c-share-btn').each(function (i) {
        let config = me.list[i]
        config && $(this).on('click', () => {
          config.cb(me.opt)
        })
      })
    }
    if (IS_ZBIOS && !document.head.querySelector('#bd-box-sdk')) {
      let aioScript = document.createElement('script')
      aioScript.src = '//s.bdstatic.com/common/openjs/aio.js?t=1547785394212'
      aioScript.id = 'bd-box-sdk'
      aioScript.async = true
      aioScript.onload = () => doBind()
      document.head.appendChild(aioScript)
    } else {
      doBind()
    }
  }

  /**
   * 将分享 list dom 插入用户选定的 dom 中
   *
   * @param {HTMLElement} $dom       指定的 DOM 元素
   * @param {?Object}     renderOpts 渲染配置
   */
  render ($dom, renderOpts = {}) {
    let me = this

    // $dom 为必选
    if (!($dom && $($dom).length)) {
      return
    }

    let $customDom = $($dom)

    // add 自定义 classname
    if (renderOpts && renderOpts.customClassName) {
      me.$domShareList.addClass(renderOpts.customClassName)
    }

    // 插入用户dom
    $customDom.append(me.$domShareList)

    // 标记dom已经被插入页面
    me.isRender = true

    if (renderOpts && typeof renderOpts.onRender === 'function') {
      renderOpts.onRender()
    }
  }
}

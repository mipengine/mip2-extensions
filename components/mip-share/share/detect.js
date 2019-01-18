/**
 * @file 根据ua判断操作系统、浏览器、版本号
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 获取 ua 并转换为小写
 *
 * @type {?string}
 */
const USER_AGENT = navigator.userAgent.toLowerCase()

// 诡异：这个地方必须从 window 引入一个 $, 否则拿不到 $
const $ = window.$

/**
 * 获取操作系统版本信息
 *
 * @returns {Object} 操作系统的名称和版本信息
 */
export function getOS () {
  if (!USER_AGENT) {
    return
  }

  let name

  // 优先使用zepto方法,否则通过ua匹配
  if ($ && $.os) {
    if ($.os.ios) {
      name = 'ios'
    } else if ($.os.android) {
      name = 'android'
    }
  } else {
    name = (USER_AGENT.indexOf('iphone') > -1 || USER_AGENT.indexOf('ipod') > -1) ? 'ios' : 'android'
  }

  return { name }
}

/**
 * 获取浏览器和版本信息
 *
 * @returns {Object} 浏览器的名称和版本信息
 */
export function getBrowser () {
  if (!USER_AGENT) {
    return
  }

  let name
  let version = ''

  if (USER_AGENT.indexOf('baiduboxapp/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone; cpu iphone os 9_3_2 like mac os x) applewebkit/601.1.46 (khtml, like gecko) mobile/13f69 baiduboxapp/0_0.0.3.7_enohpi_6433_046/2.3.9_2c2%256enohpi/1099a/a303ae3a9fe88283cc14cc84c7e55b3630c7a4ca6fcnnddartd/1
    name = 'zbios'
  } else if (USER_AGENT.indexOf('baidubrowser/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone; cpu iphone os 9_3_2 like mac os x) applewebkit/601.1.46 (khtml, like gecko) version/9.3 mobile/13f69 safari/600.1.4 baidubrowser/4.1.0.332 (baidu; p29.3.2)
    name = 'bmbadr'
    version = USER_AGENT.match(/baidubrowser\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else if (USER_AGENT.indexOf('mqqbrowser/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone 5sglobal; cpu iphone os 9_3_2 like mac os x) applewebkit/601.1.46 (khtml, like gecko) version/6.0 mqqbrowser/6.7.2 mobile/13f69 safari/8536.25 mttcustomua/2
    name = 'qq'
    version = USER_AGENT.match(/mqqbrowser\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else if (USER_AGENT.indexOf('micromessenger/') > -1) {
    name = 'wechat'
    version = USER_AGENT.match(/micromessenger\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else if (USER_AGENT.indexOf('ucbrowser/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone; cpu iphone os 9_3_2 like mac os x; zh-cn) applewebkit/537.51.1 (khtml, like gecko) mobile/13f69 ucbrowser/10.9.17.807 mobile
    name = 'uc'
    version = USER_AGENT.match(/ucbrowser\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else if (USER_AGENT.indexOf('sogoumobilebrowser/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone; cpu iphone os 9_3_2 like mac os x) applewebkit/601.1.46 (khtml, like gecko) mobile/13f69 sogoumobilebrowser/4.5.0
    name = 'sogou'
    version = USER_AGENT.match(/sogoumobilebrowser\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else if (USER_AGENT.indexOf('crios/') > -1) {
    // ios e.g. = mozilla/5.0 (iphone; cpu iphone os 9_3_2 like mac os x) applewebkit/601.1 (khtml, like gecko) crios/51.0.2704.104 mobile/13f69 safari/601.1.46
    // android e.g. = mozilla/5.0 (linux; android 5.1.1; yq601 build/lmy47v) applewebkit/537.36 (khtml, like gecko) chrome/47.0.2526.83 mobile safari/537.36
    name = 'chrome'
    version = USER_AGENT.match(/crios\/([\d.]*)/)
    version = version && version[1] ? version[1] : ''
  } else {
    name = 'other'
  }

  return { name, version }
}

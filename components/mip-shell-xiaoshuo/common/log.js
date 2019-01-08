/**
 * file: 小说 shell 统一日志发送
 * author: JennyL <jiaojiaomao220@163.com>
 */

import {getCurrentWindow, getRootWindow, getParamFromString} from './util'
import state from './state'

const {isRootPage, novelInstance, originalUrl} = state(window)
const pageType = novelInstance ? novelInstance.currentPageMeta.pageType : ''

/**
 * 发送webb性能日志
 *
 * @param {string} type 日志类型
 * @param {Object} info 日志信息
 */
export function sendWebbLog (type, info) {
  let data = Object.assign({info}, {
    dim: {
      from: 'novel'
    }
  })
  let eventName = type + '-log'
  MIP.viewer.sendMessage(eventName, data)
}

/**
 * 发送tc交互日志
 *
 * @param {string} type 日志类型
 * @param {Object} info 日志信息
 * @param {Object} extra 额外信息
 */
export function sendTCLog (type, info, extra) {
  const {novelInstance} = state(getCurrentWindow())
  // TC日志添加referer参数 , url需要encode,否则打点时会被特殊字符&等解析
  let referer = encodeURIComponent(window.document.referrer)
  // 添加小说实例ID
  const novelInstanceId = novelInstance ? novelInstance.novelInstanceId : null
  extra = Object.assign({referer, novelInstanceId}, extra)

  let eventName = type + '-log'
  let data = Object.assign({
    'clk_info': info
  }, {
    pd: 'novel'
  })
  if (extra) {
    data = Object.assign({
      ...data
    }, {
      extra
    })
  }
  MIP.viewer.sendMessage(eventName, data)
}

/**
 * 获取当前页面站点信息，发送首跳展现日志和广告日志用到
 *
 * @returns {Object} 返回站点信息
 */
export function getSiteInfo () {
  let zonghengPattern = /www.xmkanshu.com/g
  // let iqiyiPattern = /wenxue.m.iqiyi.com/g
  let isZongheng = zonghengPattern.test(originalUrl)
  let site
  isZongheng ? site = 'zongheng' : site = 'iqiyi'
  return {site, pageType}
}

/**
 * 发送webb性能日志，common 5s 请求失败，发送common异常日志
 */
export function sendWebbLogCommon () {
  setTimeout(() => {
    if (window.MIP.setCommonFetch !== true) {
      sendWebbLog('stability', {
        msg: 'commonAbnormal'
      })
      console.warn('common 异常!')
    }
  }, 5000)
}

/**
 * 发送webb日志，监控页面底部下一页上一页按钮跳转是否异常，异常发送异常日志
 *
 * @param {HTMLElement} PageButton 页面上一页下一页按钮
 * @param {string} button 上一页或者下一页字段 prePageButton nextPageButton
 */
export function sendWebbLogLink (PageButton, button) {
  if (PageButton && !(PageButton.hasAttribute('data-type') && PageButton.getAttribute('data-type') === 'mip') && !(PageButton.hasAttribute('mip-link'))) {
    sendWebbLog('stability', {
      msg: 'linkError',
      button: button
    })
  }
}

/**
 * 由于广告加载完成时才改变渲染完成字段，所以观察者模式监听广告渲染是否成功字段 window.MIP.adShow
 */
export function showAdLog () {
  // 获取当前页面站点信息
  let {site} = getSiteInfo()
  let old

  /**
   * 观察者模式监听变量变化，变量变化执行函数
   *
   * @param {string} oldVal 改变前的值
   * @param {string} newVal 改变后的值
  */
  function observer (oldVal, newVal) {
    if ((newVal === true) && (pageType !== 'detail')) {
      sendTCLog('interaction', {
        type: 'o',
        action: 'adShow'
      }, {
        show: 'adShow',
        hasAd: true,
        site: site
      })
      // 广告渲染是否成功字段，成功true，默认false，为监控show值改变，打点后置为false
      window.MIP.adShow = false
    }
  }
  // 观察者模式监听广告渲染是否成功字段，定义广告show属性及其set和get方法
  Object.defineProperty(window.MIP, 'adShow', {
    enumerable: true,
    configurable: true,
    get: function () {
      return old
    },
    set: function (val) {
      // 调用变量改变时处理函数
      observer(old, val)
      old = val
    }
  })
}

/**
 * 发送首跳展现日志
 */
export function sendRootLog () {
  // 获取当前页面站点信息
  let {site} = getSiteInfo()
  sendTCLog('interaction', {
    type: 'o',
    action: 'pageShow'
  }, {
    show: 'pageShow',
    isRootPage: isRootPage,
    site: site
  })
}

/**
 * 无限下拉 ABtest pv统计打点
 *
 *
 */
export function sendReadTypePvTcLog (type) {
  // 非sf下不走打点函数
  if (window.MIP.standalone) {
    return
  }
  let currentWindow = getCurrentWindow()
  let rootWindow = getRootWindow(currentWindow)
  let url = window.location.href
  // 获取 bookid
  const bkid = getParamFromString(url, 'bkid')
  sendTCLog('interaction', {
    type: 'o',
    action: 'read_type'
  }, {
    sids: rootWindow.MIP.hash.hashTree.sids.value,
    bkid: bkid,
    'read_type': type
  })
}

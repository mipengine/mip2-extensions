/**
 * file: 小说shell 小流量配置文件
 * @author: guoshuang
 */

import {getParamFromString, getCurrentWindow, getRootWindow} from './util'

let currentWindow = getCurrentWindow()
let rootWindow = getRootWindow(currentWindow)
let userAgent = navigator.userAgent

class Flag {
  constructor () {
    // 无线下拉bkid
    this.bkid = ['377566031', '228265', '32544050', '494196121', '831262', '61031200', '570946121', '735720121', '32784061', '1316808']
    // 无限下拉sid
    this.sid = ['127771']
    // 预渲染bkid
    this.prerenderBkid = ['76088017', '189169121', '58158163', '13333062']
    // 预渲染sid
    this.prerenderSid = ['127771']
    // 结果页的sids
    this.resSids = rootWindow.MIP.hash.hashTree.sids ? rootWindow.MIP.hash.hashTree.sids.value.split('_') : []
  }
  /**
   * 安卓4及其以下的浏览器
   *
   * @public
   */
  isAndroid4 () {
    let index = userAgent.indexOf('Android')
    if (index >= 0) {
      let androidVersion = parseFloat(userAgent.slice(index + 8))
      // 安卓4以下版本降级
      if (androidVersion < 5) {
        return true
      }
    }
    return false
  }
  /**
   * 判断是否命中sids
   *
   * @param {Array} sid 小流量的sid
   */
  isSids (sid) {
    let sids = sid || this.sid
    if (!this.resSids) {
      return false
    }
    for (let i = 0; i < sids.length; i++) {
      if (this.resSids.includes(sids[i])) {
        return true
      }
    }
    return false
  }
  /**
   * 判断是否命中bkid
   *
   * @param {Array} bkid 书名的ID
   */
  isBkid (bkid) {
    let bkids = bkid || this.bkid
    let url = window.location.href
    let currentBkid = getParamFromString(url, 'bkid')
    return bkids.indexOf(currentBkid) > -1
  }
  /**
   * 判断是否命中无限下拉的bookid
   *
   * @public
   */
  isUnlimitedPulldownSids () {
    // 安卓4降级
    if (this.isAndroid4()) {
      return false
    }
    let url = window.location.href
    if (!window.MIP.util.isCacheUrl(url)) {
      return false
    }

    // 命中bkid和sid，走无限下拉
    if (this.isBkid() && this.isSids()) {
      return true
    }
    return false
  }

  /**
   * ios8下的预渲染降级策略
   *
   * @public
   */
  isNotIos8 () {
    return userAgent.indexOf('iPhone OS 8') === -1
  }

  /**
   * 判断是否命中预渲染的小流量
   *
   * @param {string} pageType 当前页面类型
   */
  isPrerender (pageType) {
    return pageType
      ? this.isNotIos8() &&
        this.isNovelShell(pageType) &&
        this.isBkid(this.prerenderBkid) &&
        this.isSids(this.prerenderSid)
      : false
  }

  isNovelShell (type) {
    return type === 'page'
  }
}

export default Flag

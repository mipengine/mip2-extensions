/**
 * file: 小说shell 小流量配置文件
 * @author: guoshuang
 */

import {getParamFromString, getCurrentWindow, getRootWindow} from './util'

let currentWindow = getCurrentWindow()
let rootWindow = getRootWindow(currentWindow)
class Flag {
  constructor () {
    // 无线下拉bkid
    this.bkid = ['377566031', '228265', '32544050', '494196121', '831262', '61031200', '570946121', '735720121', '32784061', '1316808']
    // 无限下拉sid
    this.sid = ['127771']
    // 结果页的sids
    this.resSids = rootWindow.MIP.hash.hashTree.sids ? rootWindow.MIP.hash.hashTree.sids.value.split('_') : []
  }
  /**
   * 安卓4及其以下的浏览器
   *
   * @public
   */
  isAndroid4 () {
    let userAgent = navigator.userAgent
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
   * @public
   */
  isSids () {
    if (!this.resSids) {
      return false
    }
    for (let i = 0; i < this.sid.length; i++) {
      if (this.resSids.includes(this.sid[i])) {
        return true
      }
    }
    return false
  }
  /**
   * 判断是否命中bkid
   *
   * @public
   */
  isBkid () {
    let url = window.location.href
    let bkid = getParamFromString(url, 'bkid')
    return this.bkid.indexOf(bkid) > -1
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

  isNovelShell (type) {
    return type === 'page'
  }
}

export default Flag

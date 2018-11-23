/**
 * file: 小说shell 小流量配置文件
 * @author: guoshuang
 */

import {isCacheUrl} from './util'

class Flag {
  constructor () {
    this.bkid = ['377566031']
  }
  /**
   * 判断是否命中无限下拉的bookid
   *
   * @public
   */
  isUnlimitedPulldownSids () {
    let url = window.location.href
    if (!isCacheUrl(url)) { return false }
    let reg = /(bkid=)\S*?&/
    let bkid = url.match(reg)
    bkid = bkid[0].replace('bkid=', '')
    bkid = bkid.replace('&', '')
    if (this.bkid.indexOf(bkid) > -1) {
      return true
    }
    return false
  }

  isNovelShell (type) {
    return type === 'page'
  }
}

export default Flag

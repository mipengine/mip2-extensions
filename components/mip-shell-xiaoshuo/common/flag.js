/**
 * file: 小说shell 小流量配置文件
 * @author: guoshuang
 */

import state from './state'

class Flag {
  constructor () {
    this.sids = ['117788']
  }
  /**
   * 获取当前hash中的hash
   *
   * @private
   */
  getHashSids () {
    const {isRootPage} = state(window)

    let sidsStr

    if (isRootPage) {
      sidsStr = window.MIP.hash.hashTree.sids ? window.MIP.hash.hashTree.sids.value : []
    } else {
      sidsStr = window.parent.MIP.hash.hashTree.sids ? window.parent.MIP.hash.hashTree.sids.value : []
    }

    return sidsStr.length ? sidsStr.split('_') : []
  }
  /**
   * 判断是否命中无限下拉的sid
   *
   * @public
   */
  isUnlimitedPulldownSids () {
    let sids = this.getHashSids()
    for (let i = 0; i < this.sids; i++) {
      if (sids.indexOf(this.sids[i]) > -1) {
        return true
      }
    }
    return false
  }
}

export default Flag
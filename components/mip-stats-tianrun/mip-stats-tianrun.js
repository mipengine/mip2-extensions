/**
 * @file 天润统计组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-stats-tianrun.less'

const { CustomElement, util } = MIP
const logger = util.log('mip-stats-tianrun')

export default class MipStatsTianrun extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    let element = this.element
    let sub = element.getAttribute('sub') || 'cl2'
    let z = element.getAttribute('z') || '26'

    // 插入统计脚本
    let statsScript = document.createElement('script')
    statsScript.type = 'text/javascript'
    statsScript.src = `//${sub}.webterren.com/webdig.js?z=${z}`

    // 脚本加载成功
    statsScript.onload = () => {
      // 插入天润统计标识
      let trackerScript = document.createElement('script')
      trackerScript.type = 'text/javascript'
      trackerScript.innerHTML = 'wd_paramtracker("_wdxid=000000000000000000000000000000000000000000");'
      element.appendChild(trackerScript)
    }

    // 脚本加载失败
    statsScript.onerror = () => logger.warn(element, '天润统计脚本加载失败')

    element.appendChild(statsScript)
  }
}

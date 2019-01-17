/**
 * @file 广告组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

import './mip-ad.less'
import adCommRender from './mip-ad-comm'
import adBaiduRender from './mip-ad-baidu'
import adQwangRender from './mip-ad-qwang'
import baiduWmExtRender from './mip-baidu-wm-ext'
import adImageplusRender from './mip-ad-imageplus'
import adSspRender from './mip-ad-ssp'
import adBaidusspRender from './mip-ad-baidussp'

export default class MIPAd extends MIP.CustomElement {
  /**
   * 提前渲染
   */
  prerenderAllowed () {
    return true
  }

  /**
   * 执行渲染
   */
  build () {
    let el = this.element
    let type = el.getAttribute('type')
    let renderFunc = {
      'ad-comm': adCommRender,
      'ad-baidu': adBaiduRender,
      'ad-qwang': adQwangRender,
      'baidu-wm-ext': baiduWmExtRender,
      'ad-imageplus': adImageplusRender,
      'ad-ssp': adSspRender,
      'sd-baidussp': adBaidusspRender
    }[type]

    if (renderFunc && typeof renderFunc === 'function') {
      renderFunc(el)
    }
  }
}

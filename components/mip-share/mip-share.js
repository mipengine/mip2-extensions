/**
 * @file 分享组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, location */

import './mip-share.less'
import Share from './share'

const { CustomElement } = MIP

/**
 * 百度获取微信动态签名的默认接口
 *
 * @type {string}
 */
const BAIDUAPI = '//po.baidu.com/api/wechat/token.jsonp?app_id=wxadc1a0c6b9096e89'

export default class MIPShare extends CustomElement {
  /**
   * 渲染组件
   */
  build () {
    let me = this
    // 暂时先这样引入 zepto 和 aio 吧
    window.require(['zepto'], $ => {
      let element = me.element

      me.share = new Share({
        title: element.getAttribute('title') || document.title,
        url: element.getAttribute('url') || location.href,
        content: element.getAttribute('content') || '',
        iconUrl: element.getAttribute('icon') || '',
        wechatAPI: element.getAttribute('wechatAPI') || BAIDUAPI
      }, $(element))

      let elem = $(element).children().not('mip-i-space')[0]

      elem && me.applyFillContent(elem)
    })
  }
}

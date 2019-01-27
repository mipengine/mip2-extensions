/**
 * @file 分享组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, location */

import './mip-share.less'
import Share from './share/share'

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
    let element = this.element
    let share = new Share({
      title: element.getAttribute('title') || document.title,
      url: element.getAttribute('url') || location.href,
      content: element.getAttribute('content') || '',
      iconUrl: element.getAttribute('icon') || '//m.baidu.com/se/static/pmd/pmd/share/images/bdu.jpg',
      wechatAPI: element.getAttribute('wechatAPI') || BAIDUAPI
    }, element)

    share.render(element)

    let shareListDom = element.querySelector('.c-share-list')
    shareListDom && this.applyFillContent(shareListDom)
  }
}

/**
 * @file mip-ad.js 广告组件
 * @author duxiaonan@baidu.com (duxiaonan)
 */

// Sync
import AdComm from './mip-ad-comm'
import AdBaidu from './mip-ad-baidu'
import AdQwang from './mip-ad-qwang'
import BaiduWmExt from './mip-baidu-wm-ext'
import AdImageplus from './mip-ad-imageplus'
import AdSsp from './mip-ad-ssp'
import AdBaidussp from './mip-ad-baidussp'
import './mip-ad.less'

let { CustomElement } = MIP

export default class MipAd extends CustomElement {
  // 提前渲染
  prerenderAllowed () {
    return true
  }

  // 插入文档时执行
  build () {
    let _element = this.element
    let adComm = new AdComm()
    let adBaidu = new AdBaidu()
    let adQwang = new AdQwang()
    let baiduWmExt = new BaiduWmExt()
    let adImageplus = new AdImageplus()
    let adSsp = new AdSsp()
    let adBaidussp = new AdBaidussp()
    let adModuleCorrespond = {
      'ad-comm': adComm,
      'ad-baidu': adBaidu,
      'ad-qwang': adQwang,
      'baidu-wm-ext': baiduWmExt,
      'ad-imageplus': adImageplus,
      'ad-ssp': adSsp,
      'ad-baidussp': adBaidussp
    }

    let type = _element.getAttribute('type')
    try {
      let mipAd = adModuleCorrespond[type]
      mipAd.render(_element, this)
    } catch (e) {}
  }
}

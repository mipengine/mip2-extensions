/**
 * @file 广告扩展组件
 * @author lilangbo@baidu.com
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */

export default class BaiduWmExt {
  render (that, me) {
    let domain = that.getAttribute('domain')
    let token = that.getAttribute('token')

    if (domain && token) {
      // 判断 preload 逻辑
      let scripts = document.querySelector('script[mip-preload="mip-script-wm"]')
      if (scripts) {
        let apiStr = '__container_api_'
        window[apiStr] = window[apiStr] || []
        window[apiStr].push({
          containerId: token,
          token: token
        })
      } else {
        let script = document.createElement('script')
        script.src = document.location.protocol + '//' + domain + '/' + token + '.js'
        document.body.appendChild(script)

        let fixedElement = MIP.viewer.fixedElement
        let layer = fixedElement._fixedLayer
        let child = document.getElementById(token)
        child.addEventListener('DOMSubtreeModified', function (e) {
          let elem = window.getComputedStyle(child, null)
          let pos = elem && elem.getPropertyValue('position')
            ? elem.getPropertyValue('position') : ''
          if (layer && layer.querySelector('#' + token)) {
            return
          }
          if (pos === 'fixed' && layer) {
            let idx = document.querySelectorAll('mip-fixed').length
            let data = {
              element: child.parentElement,
              id: 'Fixed' + idx
            }
            fixedElement.moveToFixedLayer(data, parseInt(idx, 10))
          }
        }, false)
      }
    } else {
      console.error('请输入正确的 domain 或者 token')
    }
  }
}

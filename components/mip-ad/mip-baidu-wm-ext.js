/**
 * @file 广告扩展组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

const API_STR = '__container_api_'

/**
 * 渲染 ssp 内容联盟广告
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  let domain = el.getAttribute('domain')
  let token = el.getAttribute('token')

  if (domain && token) {
    // 判断 preload 逻辑
    let scripts = document.querySelector('script[mip-preload="mip-script-wm"]')
    if (scripts) {
      (window[API_STR] = window[API_STR] || []).push({
        containerId: token,
        token
      })
    } else {
      let script = document.createElement('script')
      script.src = document.location.protocol + '//' + domain + '/' + token + '.js'
      document.body.appendChild(script)

      let fixedElement = MIP.viewer.fixedElement
      let layer = fixedElement._fixedLayer
      let child = document.getElementById(token)

      child.addEventListener('DOMSubtreeModified', e => {
        let elem = window.getComputedStyle(child, null)
        let posVal = elem.getPropertyValue('position')
        let pos = elem && posVal ? posVal : ''

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

/**
 * @file 广告扩展组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

const { util, viewer } = MIP
const { log } = util
const logger = log('mip-ad')

/**
 * container api 标识
 *
 * @type {string}
 */
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
      script.src = `${document.location.protocol}//${domain}/${token}.js`
      document.body.appendChild(script)

      let fixedElement = viewer.fixedElement
      let layer = fixedElement._fixedLayer
      let child = document.getElementById(token)

      child.addEventListener('DOMSubtreeModified', e => {
        let elemStyle = window.getComputedStyle(child, null)
        let posVal = elemStyle.getPropertyValue('position')
        let pos = elemStyle && posVal ? posVal : ''

        if (layer && layer.querySelector('#' + token)) {
          return
        }

        if (pos === 'fixed' && layer) {
          let mipFixedElementsLen = document.querySelectorAll('mip-fixed').length
          let data = {
            element: child.parentElement,
            id: 'Fixed' + mipFixedElementsLen
          }

          fixedElement.moveToFixedLayer(data, +mipFixedElementsLen)
        }
      })
    }
  } else {
    logger.error(el, '请传入正确的 domain 或者 token 属性')
  }
}

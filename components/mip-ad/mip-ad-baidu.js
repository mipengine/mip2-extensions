/**
 * @file 网盟广告组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP */

/**
 * container api 标识
 *
 * @type {string}
 */
const API_STR = '__container_api_'

let globalJsSrc = '//dup.baidustatic.com/js/dm.js'
let globalScriptId = 'MIP_DUP_JS'

/**
 * 网盟广告组件的 render 方法
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  let cproId = el.getAttribute('cproid') || el.getAttribute('crop-id')

  if (!cproId) {
    return
  }

  // 定制化, 特殊处理，处理 preload 逻辑
  let innerScriptDom = el.querySelector('script') || null
  let wmPreloadScriptDom = document.querySelector('script[mip-preload="mip-script-wm"]')

  if (wmPreloadScriptDom && !innerScriptDom) {
    let sid = '_' + Math.random().toString(36).slice(2)
    let container = document.createElement('div')
    let apiArr = (window[API_STR] = window[API_STR] || [])

    container.id = sid
    el.appendChild(container)

    apiArr.push({
      containerId: sid,
      proxy: 0,
      slotId: cproId
    })
  } else {
    if (innerScriptDom && isJsonScriptTag(innerScriptDom)) {
      let obj = JSON.parse(innerScriptDom.textContent.toString())

      globalJsSrc = '//cpro.baidustatic.com/cpro/ui/c.js'
      globalScriptId = 'MIP_DUP_JS_EXT';

      (window.cproArray = window.cproArray || []).push({
        id: cproId
      });

      (window.cproStyleApi = window.cproStyleApi || {})[cproId] = obj
    }

    !innerScriptDom && initAdBaidu(el, cproId, initJs())
  }
}

/**
 * JS 初始化函数
 *
 * @returns {HTMLElement} 插入成功的 script 标签
 */
function initJs () {
  let mipDupJs = document.getElementById(globalScriptId)

  if (mipDupJs) {
    return mipDupJs
  }

  let script = document.createElement('script')
  script.src = globalJsSrc
  script.id = globalScriptId
  document.body.appendChild(script)

  return script
}

/**
 * 广告组件初始化
 *
 * @param  {HTMLElement} el 组件 DOM 对象
 * @param  {string} cproId  广告 id
 * @param  {HTMLElement} script  script 对象
 */
function initAdBaidu (el, cproId, script) {
  let sid = '_' + Math.random().toString(36).slice(2)
  let container = document.createElement('div')

  container.id = sid
  el.appendChild(container);

  (window.slotbydup = window.slotbydup || []).push({
    id: cproId,
    container: sid,
    display: 'inlay-fix',
    async: true
  })

  if (script) {
    let fixedElement = MIP.viewer.fixedElement
    let layer = fixedElement._fixedLayer
    let child = document.getElementById(sid)

    child.addEventListener('DOMSubtreeModified', e => {
      let elemStyle = window.getComputedStyle(child, null)
      let posVal = elemStyle.getPropertyValue('position')
      let pos = elemStyle && posVal ? posVal : ''

      if (layer && layer.querySelector('#' + sid)) {
        return
      }

      if (pos === 'fixed') {
        el.appendChild(document.getElementById(sid))
        if (layer) {
          let mipFixedElementsLen = document.querySelectorAll('mip-fixed').length
          let data = {
            element: child.parentElement,
            id: 'Fixed' + mipFixedElementsLen
          }

          fixedElement.moveToFixedLayer(data, +mipFixedElementsLen)
        }
      }
    })
  }

  el.customElement.applyFillContent(document.getElementById(sid), true)
}

/**
 * 判断是否是定制化 script 标签
 *
 * @param   {HTMLElement} el 节点对象
 * @returns {boolean}        判断的结果
 */
function isJsonScriptTag (el) {
  let type = el.getAttribute('type')
  return el.tagName === 'SCRIPT' && type && type.toUpperCase() === 'APPLICATION/JSON'
}

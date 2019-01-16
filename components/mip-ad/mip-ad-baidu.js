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
 * @param {Object}      me 当前 mip-ad CustomElement 对象
 */
export default function render (el, me) {
  let cproId = el.getAttribute('cproid') || el.getAttribute('crop-id')

  if (!cproId) {
    return
  }

  // 定制化, 特殊处理，处理 preload 逻辑
  let elem = el.querySelector('script') || null
  let scripts = document.querySelector('script[mip-preload="mip-script-wm"]')

  if (scripts && !elem) {
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
    if (elem && isJsonScriptTag(elem)) {
      let obj = JSON.parse(elem.textContent.toString())

      globalJsSrc = '//cpro.baidustatic.com/cpro/ui/c.js'
      globalScriptId = 'MIP_DUP_JS_EXT';

      (window.cproArray = window.cproArray || []).push({
        id: cproId
      });

      (window.cproStyleApi = window.cproStyleApi || {})[cproId] = obj
    }

    !elem && initadbaidu(el, cproId, me, initJs())
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
 * @param  {HTMLElement} elem 组件 DOM 对象
 * @param  {string} cproId  广告 id
 * @param  {Object} me 当前组件 customElement 对象
 * @param  {HTMLElement} script  script 对象
 */
function initadbaidu (elem, cproId, me, script) {
  let sid = '_' + Math.random().toString(36).slice(2)
  let container = document.createElement('div')

  container.id = sid
  elem.appendChild(container);

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
      let elem = window.getComputedStyle(child, null)
      let posVal = elem.getPropertyValue('position')
      let pos = elem && posVal ? posVal : ''

      if (layer && layer.querySelector('#' + sid)) {
        return
      }
      if (pos === 'fixed') {
        elem.appendChild(document.getElementById(sid))
        if (layer) {
          let idx = document.querySelectorAll('mip-fixed').length
          let data = {
            element: child.parentElement,
            id: 'Fixed' + idx
          }

          fixedElement.moveToFixedLayer(data, parseInt(idx, 10))
        }
      }
    })
  }

  me.applyFillContent(document.getElementById(sid), true)
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

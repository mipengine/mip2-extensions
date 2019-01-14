/**
 * @file ssp 直投广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * ssp 直投广告组件的 render 方法
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 * @param {Object}      me 当前 mip-ad CustomElement 对象
 */
export default function render (el, me) {
  // 兼容写法
  let code = el.getAttribute('sspid') || el.getAttribute('ssp-id')
  let script = document.createElement('script')

  script.src = '//dup.baidustatic.com/js/os.js'
  script.onload = () => {
    let container = document.createElement('div')

    container.id = '_' + Math.random().toString(36).slice(2)
    el.appendChild(container)

    let scriptNode = document.createElement('script')

    scriptNode.innerHTML = `BAIDU_CLB_fillSlotAsync("${code}", "${container.id}");`
    el.appendChild(scriptNode)
    me.applyFillContent(container, true)
  }
  el.appendChild(script)
}

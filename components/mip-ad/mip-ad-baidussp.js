/**
 * @file ssp 直投广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * ssp 直投广告组件的 render 方法
 *
 * @param {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  // 兼容写法
  let sspId = el.getAttribute('sspid') || el.getAttribute('ssp-id')
  let script = document.createElement('script')

  script.src = '//dup.baidustatic.com/js/os.js'
  script.onload = () => {
    let container = document.createElement('div')

    container.id = '_' + Math.random().toString(36).slice(2)
    el.appendChild(container)
    window.BAIDU_CLB_fillSlotAsync && window.BAIDU_CLB_fillSlotAsync(sspId, container.id)
    el.customElement.applyFillContent(container, true)
  }

  el.appendChild(script)
}

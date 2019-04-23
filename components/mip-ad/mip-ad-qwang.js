/**
 * @file 百度搜索推广合作广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 渲染百度抖索推广合作广告
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  let cpropsid = el.getAttribute('cpro_psid') || el.getAttribute('cpro-psid')
  let cpropswidth = el.getAttribute('cpro_pswidth') || el.getAttribute('cpro-pswidth') || 'auto'
  let cpropsheight = el.getAttribute('cpro_psheight') || el.getAttribute('cpro-pswidth') || '230'
  let scriptHtml = `var cpro_psid="${cpropsid}";var cpro_pswidth="${cpropswidth}";var cpro_psheight="${cpropsheight}";`
  let innerScriptNode = document.createElement('script')
  let adScriptLoaderNode = document.createElement('script')

  innerScriptNode.innerHTML = scriptHtml
  adScriptLoaderNode.id = 'MIP_ADQW_EMBED'
  adScriptLoaderNode.src = '//su.bdimg.com/static/dspui/js/um_mip.js'
  adScriptLoaderNode.onload = () => el.customElement.applyFillContent(container, true)

  let container = document.createElement('div')
  container.appendChild(innerScriptNode)
  container.appendChild(adScriptLoaderNode)

  el.appendChild(container)
}

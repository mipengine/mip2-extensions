/**
 * @file 百度搜索推广合作广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 渲染百度抖索推广合作广告
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 * @param  {Object}      me 当前 mip-ad customElement 对象
 */
export default function render (el, me) {
  let cpropsid = el.getAttribute('cpro_psid') || el.getAttribute('cpro-psid')
  let cpropswidth = el.getAttribute('cpro_pswidth') || el.getAttribute('cpro-pswidth') || 'auto'
  let cpropsheight = el.getAttribute('cpro_psheight') || el.getAttribute('cpro-pswidth') || '230'
  let codeScript = document.createElement('script')
  let adLoaderScript = document.createElement('script')
  let wrapperNode = document.createElement('div')

  codeScript.innerHTML = `
    var cpro_psid="${cpropsid}";
    var cpro_pswidth="${cpropswidth}";
    var cpro_psheight="${cpropsheight}";
  `
  wrapperNode.appendChild(codeScript)
  el.appendChild(wrapperNode)
  adLoaderScript.id = 'MIP_ADQW_EMBED'
  adLoaderScript.src = '//su.bdimg.com/static/dspui/js/um_mip.js'

  if (!adLoaderScript) {
    return
  }

  wrapperNode.appendChild(adLoaderScript)
  adLoaderScript.onload = () => me.applyFillContent(wrapperNode, true)
}

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
  let adLoaderScript = document.createElement('script')
  let wrapperNode = document.createElement('div')

  window.cpro_psid = cpropsid
  window.cpro_pswidth = cpropswidth
  window.cpro_psheight = cpropsheight

  adLoaderScript.id = 'MIP_ADQW_EMBED'
  adLoaderScript.src = '//su.bdimg.com/static/dspui/js/um_mip.js'

  if (!adLoaderScript) {
    return
  }

  wrapperNode.appendChild(adLoaderScript)
  adLoaderScript.onload = () => el.customElement.applyFillContent(wrapperNode, true)
}

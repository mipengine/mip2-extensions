/**
 * @file ssp 内容联盟广告
 * @author mj(zoumiaojiang@gmail.com)
 */

/**
 * 渲染 ssp 内容联盟广告
 *
 * @param  {HTMLElement} el 当前 mip-ad 组件的 DOM 元素
 */
export default function render (el) {
  let siteId = el.dataset.siteId
  let blockId = el.dataset.blockId
  let sspDiv = document.createElement('div')

  sspDiv.classList.add('cpu-feeds-block')
  sspDiv.dataset.siteId = siteId
  sspDiv.dataset.blockId = blockId
  el.appendChild(sspDiv)

  let sspScript = document.createElement('script')
  sspScript.innerText = `(function(){var c="//cpu.baidu.com";var a=function(){var e=document.createElement("script");e.id="cpu-block-entry";e.src=c+"/js/cb.js";document.head.appendChild(e)};var b=function(g){var h={msg:g.toString()||"no err msg",line:g.lineno||-1};var f=document.createElement("img");f.src=c+"/msg?m=block&e="+encodeURIComponent(JSON.stringify(h))};try{window.feedsbycpu=window.feedsbycpu||[];window.feedsbycpu.push({siteId:"${siteId}",blockId:"${blockId}",display:"auto"});document.getElementById("cpu-block-entry")||a()}catch(d){b(d)}})();`
  el.appendChild(sspScript)
}

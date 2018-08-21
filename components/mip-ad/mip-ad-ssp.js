/**
 * @file ssp 内容联盟广告
 *
 * @author liangjiaying(jennyliang@github)
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */

export default class AdSsp {
  /**
   * 渲染ssp 配置dom
   *
   * @param  {HTMLElement} dom     custumElement的dom,此处为<mip-ad>
   * @param  {HTMLElement} me    mip-element
   */
  render (dom, me) {
    let siteId = dom.dataset.siteId
    let blockId = dom.dataset.blockId

    let sspDiv = document.createElement('div')
    sspDiv.classList.add('cpu-feeds-block')
    sspDiv.dataset.siteId = siteId
    sspDiv.dataset.blockId = blockId
    dom.appendChild(sspDiv)

    let sspScript = document.createElement('script')
    sspScript.innerText = '(function(){let c="//cpu.baidu.com";' +
      'let a=function(){let e=document.createElement("script");e.id="cpu-block-entry";' +
      'e.src=c+"/js/cb.js";document.head.appendChild(e)};' +
      'let b=function(g){let h={msg:g.toString()||"no err msg",line:g.lineno||-1};' +
      'let f=document.createElement("img");f.src=c+"/msg?m=block&e="+' +
      'encodeURIComponent(JSON.stringify(h))};' +
      'try{window.feedsbycpu=window.feedsbycpu||[];' +
      'window.feedsbycpu.push({siteId:"' + siteId +
      '",blockId:"' + blockId + '",display:"auto"});' +
      'document.getElementById("cpu-block-entry")||a()}catch(d){b(d)}})();'
    dom.appendChild(sspScript)
  }
}

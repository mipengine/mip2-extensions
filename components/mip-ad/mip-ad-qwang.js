/**
 * @file 全网推荐
 *
 * @author fengchuantao@baidu.com, liangjiaying<jennyliang220@github>
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */

export default class AdQwang {
  /**
   * 渲染广告
   *
   * @param  {Object} domEle [description]
   * @param  {Object} mipEle [description]
   */
  render (domEle, mipEle) {
    let cpropsid = domEle.getAttribute('cpro_psid')
    let cpropswidth = domEle.getAttribute('cpro_pswidth') || 'auto'
    let cpropsheight = domEle.getAttribute('cpro_psheight') || '230'
    let scriptHtml = [
      'let cpro_psid ="' + cpropsid + '";',
      'let cpro_pswidth ="' + cpropswidth + '";',
      'let cpro_psheight="' + cpropsheight + '";'
    ].join('')

    let scriptNode = document.createElement('script')
    scriptNode.innerHTML = scriptHtml

    let node = document.createElement('div')
    node.appendChild(scriptNode)
    domEle.appendChild(node)
    this.initJs(node, mipEle)
  }

  /**
   * initJs JS初始化函数
   *
   * @param  {HTMLElement} node   盛放script的div
   * @param  {Object} mipEle mip元素
   */
  initJs (node, mipEle) {
    let adScript
    adScript = this.addScriptOnce('MIP_ADQW_EMBED', '//su.bdimg.com/static/dspui/js/um_mip.js')

    if (!adScript) {
      return
    }

    node.appendChild(adScript)
    adScript.onload = function () {
      mipEle.applyFillContent(node, true)
    }
  }

  /**
   * 仅引入一次脚本
   *
   * @param {string} scriptId  广告脚本标识ID
   * @param {string} scriptSrc 广告脚本地址
   * @returns {Object} false/scriptElement
   */
  addScriptOnce (scriptId, scriptSrc) {
    // 短期方案，修复网盟广告加载顺序问题
    // let jsdom = document.getElementById(scriptId);
    // if (jsdom) {
    //     return false;
    // }

    let script = document.createElement('script')
    script.src = scriptSrc
    script.id = scriptId
    return script
  }
}

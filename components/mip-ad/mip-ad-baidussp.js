/**
 * @file ssp直投广告
 * @author wangpei07@baidu.com
 * @version 1.0
 * @copyright 2016 Baidu.com, Inc. All Rights Reserved
 */

export default class AdBaidussp {
  render (element, me) {
    let code = element.getAttribute('sspId')

    let node = document.createElement('script')
    node.src = '//dup.baidustatic.com/js/os.js'
    element.appendChild(node)

    node.onload = function () {
      let container = document.createElement('div')
      container.id = '_' + Math.random().toString(36).slice(2)
      element.appendChild(container)

      let scriptNode = document.createElement('script')
      scriptNode.innerHTML = 'BAIDU_CLB_fillSlotAsync("' + code + '","' + container.id + '");'
      element.appendChild(scriptNode)

      me.applyFillContent(container, true)
    }
  }
}

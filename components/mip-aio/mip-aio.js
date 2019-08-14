/**
 * @file mip-aio 服务封装
 * @author Miya(panwenshuang@baidu.com)
 */

export default class MIPAio {
  getBox (version = '201602') {
    if (this.scriptPromise) {
      return this.scriptPromise
    }
    this.scriptPromise = new Promise((resolve, reject) => {
      const aioScript = document.createElement('script')
      const srcUrl = 'https://s.bdstatic.com/common/openjs/aio.js?v=' + version
      aioScript.id = 'bd-box-sdk'
      aioScript.onload = () => resolve(window.Box)
      aioScript.onerror = () => reject(new Error(`脚本加载失败: ${srcUrl}`))
      aioScript.src = srcUrl
      document.head.appendChild(aioScript)
    })
    return this.scriptPromise
  }
}

MIP.registerService('mip-aio', MIPAio)

/**
 * @file mip-aio 服务封装
 * @author Miya(panwenshuang@baidu.com)
 */

const {registerService} = MIP

export default class MIPAio {
  async getBox (version) {
    const fileVersion = version || '201602'
    if (this.scriptPromise) {
      return this.scriptPromise
    }
    this.scriptPromise = new Promise((resolve, reject) => {
      const aioScript = document.createElement('script')
      const srcUrl = 'http://s.bdstatic.com/common/openjs/aio.js?v=' + fileVersion
      aioScript.id = 'bd-box-sdk'
      aioScript.onload = () => resolve()
      aioScript.onerror = () => reject(new Error(`脚本加载失败: ${srcUrl}`))
      aioScript.src = srcUrl
      document.head.appendChild(aioScript)
    }).then(() => {
      return window.Box
    })
    return this.scriptPromise
  }
}

registerService('mip-aio', MIPAio)

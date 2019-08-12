const {registerService} = MIP

export default class MIPAio {
  async getBox (version) {
    return new Promise((resolve, reject) => {
      const aioScript = document.createElement('script')
      const srcUrl = 'http://s.bdstatic.com/common/openjs/aio.js?v=' + version
      aioScript.src = srcUrl
      aioScript.id = 'bd-box-sdk'
      document.head.appendChild(aioScript)
      aioScript.onload = () => resolve()
      aioScript.onerror = () => reject(new Error(`脚本加载失败: ${srcUrl}`))
    }).then(() => {
      return window.Box
    })
  }
}

registerService('mip-aio', MIPAio)

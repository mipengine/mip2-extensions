const {CustomElement, util} = MIP
const log = util.log('mip-bridge-baidu')

export default class MipBridgeBaidu extends CustomElement {
  build () {
    const url = this.getBridgeScriptUrl()

    if (!url) {
      return
    }

    /** @type {HTMLElement} */
    const element = this.element
    const script = document.createElement('script')

    script.src = url

    element.appendChild(script)
  }

  /**
   * @returns {string} script url of baidu commerial bridge.
   */
  getBridgeScriptUrl () {
    /** @type {HTMLElement} */
    const element = this.element
    let siteId = element.getAttribute('site-id')

    if (element.hasAttribute('siteid')) {
      siteId = siteId || element.getAttribute('siteid')
      log.warn('siteId 属性将被废弃，请使用 site-id 代替。')
    }

    if (siteId) {
      return `//p.qiao.baidu.com/cps/b.js?siteId=${encodeURIComponent(siteId)}`
    }

    const token = element.getAttribute('token')

    if (token) {
      return `//hm.baidu.com/hm.js?${encodeURIComponent(token)}`
    }

    return ''
  }
}

/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import url from './url'
import dom from './dom'
import log from './log'
import dataProcessor from './data'
import novel from './novelFeature'

const {
  util,
  viewer,
  CustomElement
} = MIP
let logData = dataProcessor.logData
let performanceData = dataProcessor.performanceData
let UA = navigator.userAgent

/**
 * 获取是否是百度spider抓取
 */
function isBaiduSpider() {
  return UA.indexOf('Baiduspider') > -1
}

export default class MipCustom extends CustomElement {
  /**
   * prerenderAllowed钩子,优先加载
   */
  prerenderAllowed () {
    return true
  }
  /**
   * firstInviewCallback钩子，发送曝光日志
   *
   */
  firstInviewCallback () {
    // 曝光日志
    logData.params.t = +new Date()
    log.sendLog(logData.host, util.fn.extend(logData.exposure, logData.params))
  }
  /**
   * build钩子，触发渲染
   *
   */
  build () {
    // 如果是百度spider抓取，如果是百度spider抓取则不执行接下来的逻辑
    if (isBaiduSpider()) {
      return
    }
    // 判断是否是MIP2的环境，配合小说shell，由小说shell去控制custom的请求是否发送
    let novelShell = document.querySelector('mip-shell-xiaoshuo')
    if (window.MIP.version && +window.MIP.version === 2 && novelShell) {
      novel.addNovelListener.apply(this, [this.initElement])
    } else {
      dom.addPlaceholder.apply(this)
      this.initElement(dom)
    }
  }
  /**
   * 发出请求+渲染页面
   *
   */
  initElement () {
    let checkElement = () => {
      if (dom.getConfigScriptElement(this.element)) {
        this.initCustom()
        return true
      }
      return false
    }
    if (!checkElement()) {
      window.requestAnimationFrame(checkElement)
    }
  }
  /**
   * 定制化渲染的主流程：分区请求+渲染
   *
   */
  initCustom () {
    // 参数初始化
    let ele = this.element
    this.position = ele.getAttribute('position') || ''
    this.sourceType = ele.getAttribute('source-type') || ''
    // 判断是否在mip-shell中，决定请求传递参数
    this.commonUrl = url.get(ele)

    // 监听代理 a 标签点击事件
    dom.proxyLink(ele)
    /**
     * AB区分处理
     */
    if (this.getPosition() === 'top') {
      if (this.getTagNum(ele).current === 0) {
        this.initQueue()
        this.fetchData(url.get(ele, 'top'), this.renderQueue.bind(this))
      }
      let queue = this.getQueue()
      let templateData = this.getMatchData(ele, queue && queue.tempData)
      if (templateData && templateData.template.length > 0) {
        this.render(templateData, ele)
      } else {
        this.pushQueue(ele)
      }
    } else {
      this.fetchData(this.commonUrl, this.render.bind(this), ele)
    }
  }
  /**
   * 获取标签所在的位置
   *
   * @returns {Object} position 标签位置
   */
  getPosition () {
    return this.position === 'top' ? 'top' : 'bottom'
  }
  /**
   * 初始化
   *
   * @param {HTMLElement} el mip-custom元素
   * @returns {Object} tagNum 返回标签数量信息
   * @returns {string} tagNum.total 标签总数量
   * @returns {string} tagNum.current 当前标签序号
   */
  getTagNum (el) {
    let element = [].slice.call(document.querySelectorAll('mip-custom[position=top]'))
    return {
      total: element.length,
      current: element.indexOf(el)
    }
  }
  /**
   * 渲染
   *
   * @param {Object} data 和模板匹配的数据
   * @param {HTMLElement} element 需要渲染的element
   */
  render (data, element) {
    let commonData = {}
    let template = {}
    if (!data || !element) {
      return
    }
    if (data.config) {
      let config = dataProcessor.addPaths(data.config)
      require.config(config)
    } else if (dataProcessor.config) {
      let config = dataProcessor.addPaths(dataProcessor.config)
      require.config(config)
    }
    // common 数据缓存
    if (data.common) {
      commonData = data.common
    }
    // 模板数据缓存
    if (data.template) {
      template = data.template
    }
    for (let i = 0; i < template.length; i++) {
      let tplData = template[i]
      let container = document.createElement('div')
      container.setAttribute('mip-custom-container', i)
      element.appendChild(container)

      // dom 渲染
      dom.render(element, tplData, container)
    }
  }
}

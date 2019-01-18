/**
 * @file Mustache template
 * @author chenyongle(chenyongle@baidu.com)
 */
import getUrl from './url'
import dom from './dom'
import log from './log'
import dataProcessor from './data'
import novel from './novel-feature'
import './mip-custom.less'

let logData = dataProcessor.logData
let performanceData = dataProcessor.performanceData
let updatePaths = dataProcessor.updatePaths
const CONFIG = dataProcessor.CONFIG
const {CustomElement, util} = MIP
const logger = util.log('mip-custom')
/**
 * 获取是否是百度spider抓取，过滤spider的抓取
 *
 * @returns {boolean} 返回当前UA是否命中百度spider
 */
function isBaiduSpider () {
  return navigator.userAgent.indexOf('Baiduspider') > -1
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
    log.sendLog(logData.host, Object.assign(logData.exposure, logData.params))
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
      dom.addPlaceholder(this)
      this.initElement()
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
    this.commonUrl = getUrl(ele)

    // 监听代理 a 标签点击事件
    dom.proxyLink(ele)
    /**
     * AB区分处理
     */
    if (this.getPosition() === 'top') {
      if (this.getTagNum(ele).current === 0) {
        this.initQueue()
        this.fetchData(getUrl(ele, 'top'), this.renderQueue.bind(this))
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
    let element = [...document.querySelectorAll('mip-custom[position=top]')]
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
    if (!data || !element) {
      return
    }

    let template = data.template || []

    window.require.config(updatePaths(data.config || CONFIG))

    for (let i = 0; i < template.length; i++) {
      let container = document.createElement('div')
      container.setAttribute('mip-custom-container', i)
      element.appendChild(container)

      // dom 渲染
      dom.render(element, template[i], container)
    }
    // 广告插入页面时，增加渐显效果
    [...document.querySelectorAll('[mip-custom-container]')].map(v => v.classList.add('fadein'))

    // 广告渲染完成
    window.MIP.adShow = true
    // 移除广告占位符号
    dom.removePlaceholder(this)
  }
  /**
   * 获取标签匹配的数据
   *
   * @param {HTMLElement} element 需要匹配的element
   * @param {Object} data 所有数据
   * @returns {Object} matchTempData 返回element匹配的数据
   * @returns {Object} matchTempData.common common数据信息
   * @returns {Object} matchTempData.config 配置
   * @returns {Array} matchTempData.template 模板
   */
  getMatchData (element, data) {
    if (!element || !data) {
      return
    }
    let sourceType = element.getAttribute('source-type') || ''

    if (!sourceType) {
      return
    }

    let template = data.template
    let matchTempData = {
      common: data.common,
      config: data.config,
      template: []
    }
    let tLen = template && template.length

    if (tLen && tLen > 0) {
      for (let i = 0; i < tLen; i++) {
        let singleTempData = template[i]
        if (!singleTempData || !singleTempData.length) {
          break
        }
        let singleRid = singleTempData[0] && singleTempData[0].rid
        if (singleRid && singleRid === sourceType) {
          matchTempData.template.push(singleTempData)
          break
        }
      }
    }
    return matchTempData
  }

  /**
   * 异步获取数据
   *
   * @param {string} url 异步请求接口
   * @param {Function} callback 回调
   * @param {HTMLElement} element 数据返回后需要渲染的element
   */
  fetchData (url, callback, element) {
    if (!url) {
      return
    }
    let errorData = {}
    // 性能日志
    let performance = {}
    performance.fetchStart = +new Date()

    let paramUrl = url

    // 小说的特殊参数——novelData和fromSearch
    paramUrl = novel.addNovelDate.apply(this, [url])

    // fetch
    fetch(paramUrl, {
      credentials: 'include'
    }).then(res => {
      // 性能日志：duration-网络请求时间
      performance.responseEnd = +new Date()
      performance.duration = performance.responseEnd - performance.fetchStart
      errorData = {
        st: res.status,
        info: res.statusText,
        t: +new Date()
      }
      if (!res.ok) {
        log.sendLog(logData.host, Object.assign(logData.error, logData.params, errorData))
      }
      return res.json()
    }).then(data => {
      // 返回数据问题
      if (data && data.errno) {
        // send error log
        errorData = {
          info: data.errmsg,
          t: +new Date()
        }
        log.sendLog(logData.host, Object.assign(logData.error, logData.params, errorData))

        logger.warn(data.errmsg)
        element.remove()
        return
      }
      // 小说内命中小流量
      if (window.MIP.version && +window.MIP.version === 2 && data.data.schema) {
        new Promise(resolve => {
          novel.renderNovelCacheAdData(data, element, resolve)
        }).then(result => {
          // 模板的前端渲染
          callback && callback(result, element)
        }).catch(reason => {
          logger.log('失败：' + reason)
        })
      } else {
        // 模板的前端渲染
        callback && callback(data.data, element)
      }
      // 性能日志：按照流量 1/500 发送日志
      this.setPerformanceLogs(performance, data)
    }, error => {
      log.sendLog(logData.host, Object.assign(logData.error, logData.params, errorData))
      element.remove()
      errorData.en = error
      logger.error(error)
    }).catch(evt => {
      logger.warn(evt)
    })
  };
  /**
   * 性能日志：按照流量 1/500 发送日志
   *
   * @param {Object} performance 性能参数
   * @param {Object} data fetchData 返回的数据
   */
  setPerformanceLogs (performance, data) {
    let random500 = Math.random() * 500
    if (random500 < 1) {
      // 性能日志：emptyTime-广告未显示时间
      // 渲染结束时间戳
      performance.renderEnd = +new Date()
      // 页面空白毫秒数
      performance.emptyTime = performance.renderEnd - performance.fetchStart
      performance.frontendRender =
        performance.renderEnd - performance.responseEnd

      // 前端打点时间
      let frontendData = {
        duration: performance.duration,
        emptyTime: performance.emptyTime,
        frontendRender: performance.frontendRender
      }
      // 加入后端打点时间
      let frontAndServerData
      if (data.data.responseTime) {
        frontAndServerData = Object.assign(
          frontendData,
          data.data.responseTime
        )
      } else {
        frontAndServerData = frontendData
      }

      // 加入默认统计参数
      performanceData.params.info = JSON.stringify(
        Object.assign(performanceData.params.info, frontAndServerData, 1)
      )

      // 添加小说的特殊逻辑字段
      let novelShell = document.querySelector('mip-shell-xiaoshuo')
      if (window.MIP.version && +window.MIP.version === 2 && novelShell) {
        performanceData.params.dim = { pd: 'novel' }
      }
      log.sendLog(performanceData.host, performanceData.params)
    }
  }

  /**
   * 缓存异步数据
   *
   * @param {Object} data 需要缓存的数据
   */
  storeData (data) {
    let queue = this.getQueue()
    if (!data || !queue) {
      return
    }
    if (queue.tempData) {
      queue.tempData = data
    }
  }

  /**
   * 初始化模板、数据队列
   *
   */
  initQueue () {
    window.MIP = window.MIP || {}
    MIP.custom = MIP.custom || {}
    MIP.custom.tempQueue = []
    MIP.custom.tempData = {}
  }

  /**
   * 模板入队列
   *
   * @param {HTMLElement} temp 入队列元素
   */
  pushQueue (temp) {
    let queue = this.getQueue()
    if (!temp || !queue) {
      return
    }
    queue.tempQueue && queue.tempQueue.push(temp)
  }

  /**
   * 获取模板队列和缓存数据状态
   *
   * @returns {Object} 返回一个对象
   */
  getQueue () {
    return (
      window.MIP &&
      MIP.custom && {
        tempQueue: MIP.custom.tempQueue,
        tempData: MIP.custom.tempData
      }
    )
  }

  /**
   * 渲染模板的等待队列
   *
   * @param {Object} data 渲染匹配的数据
   */
  renderQueue (data) {
    let queue = this.getQueue()
    let tempQueue = queue && queue.tempQueue
    if (!data) {
      return
    }
    if (tempQueue && tempQueue.length > 0) {
      let tLen = tempQueue.length
      for (let i = 0; i < tLen; i++) {
        let element = tempQueue[i]
        let elementData = this.getMatchData(element, data)
        this.render(elementData, element)
      }
    }
    this.storeData(data)
  }
}

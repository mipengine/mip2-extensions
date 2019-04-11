/**
 * @file 搜索合作页 mip-custom
 * @author liujing
 *
 */

// import style
import './mip-custom.less'

// import modules
import dom from './common/dom'
import url from './common/url'
import log from './common/log'
import dataProcessor from './common/data'
import renderFactory from './tplRender/renderFactory'
import novel from './novel-feature.js'

// import tools
const {CustomElement, util} = MIP
const {logData} = dataProcessor
const logger = util.log('mip-custom')
/**
 * 获取标签所在的位置
 *
 * @param {string} position 标签位置，可能为空字符串
 * @returns {string} 标签位置
 */
function getPosition (position) {
  return position === 'top' ? 'top' : 'bottom'
}
/**
 * 初始化
 *
 * @param {HTMLElement} ele mip-custom元素
 * @returns {Object} tagNum 返回标签数量信息
 * @returns {string} tagNum.total 标签总数量
 * @returns {string} tagNum.current 当前标签序号
 */
function getTagNum (ele) {
  let elements = [...document.querySelectorAll('mip-custom[position=top]')]
  return {
    total: elements.length,
    current: elements.indexOf(ele)
  }
}
export default class MipCustom extends CustomElement {
  prerenderAllowed () {
    return true
  }

  firstInviewCallback () {
    // 曝光日志
    logData.params.t = +new Date()
    log.sendLog(logData.host, util.fn.extend(logData.exposure, logData.params))
  }
  /**
   * [spiderFilter 过滤spider的抓取]
   *
   * @private spiderFilter 过滤spider的抓取
   * @returns {boolean} 返回当前UA是否命中百度spider
   */

  spiderFilter () {
    let UA = navigator.userAgent
    return UA.indexOf('Baiduspider') > -1
  }

  /**
   * [render 搜索合作页的入口]
   *
   * @private render 搜索合作页的入口
   */
  build () {
    // 过滤spider
    if (this.spiderFilter()) {
      return
    }
    // 添加首帧占位图
    // 在一开始 build 的时候就出占位图，后面小说有个判断是否渲染成功('.mip-custom-placeholder')，与这个相关
    dom.addPlaceholder(this)
    // 判断小说环境
    this.isNovel = !!(window.MIP.version && +window.MIP.version === 2 &&
      document.querySelector('mip-shell-xiaoshuo'))
    // 渲染广告元素
    if (this.isNovel) {
      novel.addNovelListener.apply(this, [this.initElement])
    } else {
      this.initElement()
    }
  }

  /**
   * [initElement 发出请求+渲染页面]
   *
   */
  initElement () {
    // 当没有必传元素，则不经行渲染
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
   * [bindEvents 定制化渲染的主流程：分区请求+渲染]
   *
   */
  initCustom () {
    // 参数初始化
    this.position = this.element.getAttribute('position') || ''
    this.sourceType = this.element.getAttribute('source-type') || ''
    // 判断是否在mip-shell中，决定请求传递参数
    this.commonUrl = url.get(this.element)
    this.isPositionTop = getPosition(this.position) === 'top'
    // 监听代理 a 标签点击事件
    dom.proxyLink(this.element)

    if (this.isPositionTop) {
      if (getTagNum(this.element).current === 0) {
        this.initQueue()
        this.fetchData(url.get(this.element, 'top'))
      }
      let queue = this.getQueue()
      let templateData = this.getMatchData(this.element, queue && queue.tempData)
      if (templateData && templateData.template.length > 0) {
        this.render(templateData)
      } else {
        this.pushQueue(this.element)
      }
    } else {
      // fetch-common
      this.fetchData(this.commonUrl)
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
   * 获取模板队列和缓存数据状态
   *
   * @returns {Object} 返回队列对象
   */
  getQueue () {
    return window.MIP && MIP.custom && {
      tempQueue: MIP.custom.tempQueue,
      tempData: MIP.custom.tempData
    }
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
   * 渲染模板的等待队列
   *
   * @param {Object} data 渲染匹配的数据
   */
  renderQueue (data) {
    if (!data) {
      return
    }
    let queue = this.getQueue()
    let tempQueue = queue && queue.tempQueue
    if (tempQueue && tempQueue.length > 0) {
      let len = tempQueue.length
      for (let i = 0; i < len; i++) {
        let element = tempQueue[i]
        let elelmentData = this.getMatchData(element, data)
        this.render(elelmentData, element)
      }
    }
    this.storeData(data)
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
    if (!element || !data || !this.sourceType) {
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
        if (singleRid && singleRid === this.sourceType) {
          matchTempData.template.push(singleTempData)
          break
        }
      }
    }
    return matchTempData
  }
  /**
   * [fetchData 异步获取数据]
   * 说明：这个函数内部有段处理 fetch 返回数据的代码，根据 AB 区和小说进行区分
   *
   * @param {string} url 异步请求接口
   */
  fetchData (url) {
    if (!url) {
      return
    }
    let errorData = {}
    // 性能日志
    let performance = {}
    performance.fetchStart = +new Date()
    if (this.isNovel) {
      url = novel.addNovelData(url, this.novelData, this.fromSearch)
    }
    // fetch
    fetch(url, {
      credentials: 'include'
    }).then(res => {
      // 性能日志：duration-网络请求时间
      log.setNetDurationLogs(performance, errorData, res)
      return res.json()
    }).then(data => {
      // 返回数据问题
      if (data && data.errno) {
        // send error log
        log.setErrorLogs(errorData, data)
        this.element.remove()
        return
      }
      // 模板的前端渲染，1、普通渲染；2、小说命中 schema 机制进行渲染
      if (this.isNovel && data.data.schema) {
        new Promise(resolve => {
          novel.renderWithNovelData.apply(this, [data, resolve])
        }).then(result => {
          this.render(result)
          // 性能日志：按照流量 1/500 发送日志
          log.setPerformanceLogs(performance, data)
        }).catch(err => {
          logger.log('失败：' + err)
        })
      } else if (this.isPositionTop) {
        this.renderQueue(data)
      } else {
        this.render(data.data)
        // 性能日志：按照流量 1/500 发送日志
        log.setPerformanceLogs(performance, data)
      }
    }, error => {
      log.sendLog(logData.host, util.fn.extend(logData.error, logData.params, errorData))
      this.element.remove()
      errorData.en = error
      logger.error(error)
    }).catch(evt => {
      logger.warn(evt)
    })
  }

  /**
   * [render 广告模板渲染]
   *
   * @param {string} data 异步请求接口的广告数据
   */
  render (data) {
    let template = {}
    let element = this.element

    if (!data) {
      return
    }

    if (data.config) {
      let config = dataProcessor.addPaths(data.config)
      window.require.config(config)
    } else {
      logger.error('common广告模板中公共模块缺失')
      return
    }

    // 医疗屏蔽A区跳转
    let commonData = data.common || {}
    let isForbidden = true
    if (commonData.product === 'medicine') {
      let specialLink = [
        // 寻医问药
        'mip.imask.xywy.com',
        // 宝宝知道
        'baobao.baidu.com',
        // 柠檬爱美
        'lemon.baidu.com',
        // 春雨医生
        'm.chunyuyisheng.com',
        // 好大夫
        'mip.haodf.com',
        // 百科名医
        'm.baikemy.com'
      ]
      for (let i = 0; i < specialLink.length; i++) {
        if (commonData.originalUrl && commonData.originalUrl.indexOf(specialLink[i]) > -1) {
          isForbidden = false
          break
        }
      }

      if (isForbidden) {
        let alink = document.querySelectorAll('a')
        for (let i = 0; i < alink.length; i++) {
          if (alink[i].href.indexOf('author.baidu.com') < 0) {
            alink[i].href = 'javascript:void(0)'
          }
        }
      }
    }
    // 模板数据缓存
    if (data.template) {
      template = data.template
    }

    // 保持 dom 结构和 v1 一致
    for (let i = 0; i < template.length; i++) {
      let tplData = template[i]
      let container = document.createElement('div')
      container.setAttribute('mip-custom-container', i)
      element.appendChild(container)

      // dom 渲染
      for (let index = 0; index < tplData.length; index++) {
        let renderItem = tplData[index]
        Object.assign(renderItem, {id: index})
        renderFactory({element, renderItem, container})
      }
    }

    // 广告插入页面时，增加渐显效果
    let mipCustomContainers = document.querySelectorAll('[mip-custom-container]')
    for (let i = mipCustomContainers.length - 1; i >= 0; i--) {
      let mipCustomContainer = mipCustomContainers[i]
      mipCustomContainer.classList.add('fadein')
    }
    // 广告渲染完成
    window.MIP.adShow = true
    // 移除广告占位符号
    dom.removePlaceholder(this)
  }
}

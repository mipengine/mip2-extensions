/**
 * @file mip-ad-ecom 渲染框架, 同步于 mip-custom
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch, location */

import getUrl from './url'
import dom from './dom'
import dataProcessor from './data'
import './mip-ad-ecom.less'

const { util, standalone, CustomElement } = MIP
const { fn, log } = util
const logger = log('mip-ad-ecom')

/**
 * mip-ad-ecom 组件的外层容器 class 名
 *
 * @type {string}
 */
const AD_CONTAINER = 'mip-ad-ecom-container'

export default class MIPAdEcom extends CustomElement {
  constructor (element) {
    super(element)

    /**
     * 广告组件的占位 DOM
     *
     * @type {?HTMLElement}
     */
    this.placeholder = null

    /**
     * commonUrl
     *
     * @type {string}
     */
    this.commonUrl = ''

    /**
     * regexs
     *
     * @type {?Object}
     */
    this.regexs = dataProcessor.REGEXS

    /**
     * sourceType
     *
     * @type {string}
     */
    this.sourceType = ''
  }

  /**
   * prerenderAllowed 钩子,优先加载
   */
  prerenderAllowed () {
    return true
  }

  /**
   * build 钩子，触发渲染. 广告需要尽早执行所以用 build
   */
  build () {
    let ele = this.element
    let checkElement = () => {
      if (dom.getConfigScriptElement(ele)) {
        this.sourceType = ele.getAttribute('source-type') || ''
        // this.commonUrl = './mock.json'
        this.commonUrl = getUrl(ele)
        // 在一些情况下不展示定制化 MIP
        if (!this.isShowCustom()) {
          return
        }
        return this.fetchData(this.commonUrl, this.render.bind(this), ele)
      }
      return logger.warn(ele, '获取不到配置')
    }

    this.placeholder = dom.addPlaceholder(ele)

    if (!checkElement()) {
      window.requestAnimationFrame(checkElement)
    }
  }

  /**
   * 判断是否展示定制化MIP
   *
   * @returns {boolean} isShowCustom 是否展示定制化MIP
   */
  isShowCustom () {
    let isShowCustom = true

    // 非结果页进入不展现定制化内容
    if (standalone ||
      // 非百度、cache 不展现定制化内容
      !(this.regexs.domain.test(window.document.referrer) ||
      fn.isCacheUrl(location.href)) ||
      // 无异步 url 不展现定制化内容
      !this.commonUrl
    ) {
      this.element.remove()
      isShowCustom = false
    }

    return isShowCustom
  }

  /**
   * 渲染广告内容
   *
   * @param {Object}      data    和模板匹配的数据
   * @param {HTMLElement} element 需要渲染的 element
   */
  render (data, element) {
    if (!data || !element) {
      return
    }

    let templates = data.template || []

    window.require.config(dataProcessor.updatePaths(data.config || dataProcessor.CONFIG))
    templates.forEach((tplData, index) => {
      let container = document.createElement('div')

      container.setAttribute(AD_CONTAINER, index)
      element.appendChild(container)

      // dom 渲染
      dom.render(element, tplData, container)
    })
  }

  /**
   * 获取标签匹配的数据
   *
   * @param   {HTMLElement} element 需要匹配的element
   * @param   {Object} data 所有数据
   * @returns {Object} matchTempData 返回element匹配的数据
   * @returns {Object} matchTempData.common common数据信息
   * @returns {Object} matchTempData.config 配置
   * @returns {Array}  matchTempData.template 模板
   */
  getMatchData (element, data) {
    if (!element || !data) {
      return
    }

    let sourceType = element.getAttribute('source-type') || ''
    if (!sourceType) {
      return
    }

    let templates = data.template
    let matchTempData = {
      common: data.common,
      config: data.config,
      template: []
    }

    let tLen = templates && templates.length
    if (tLen) {
      for (let i = 0; i < tLen; i++) {
        let singleTempData = templates[i]
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

    // 获取数据
    fetch(url, {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        // 返回数据问题
        if (data && data.errno) {
          logger.warn(element, data.errmsg)
          element.remove()
          return
        }
        callback && callback(data.data, element)
        let adContainers = [...document.querySelectorAll(`[${AD_CONTAINER}]`)]
        adContainers.forEach(item => item.classList.add('fadein'))
        this.placeholder && dom.removePlaceholder(this.placeholder)
      }, err => {
        element.remove()
        logger.warn(err)
      }).catch(err => logger.warn(element, err))
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
   * @returns {Array} 获取 MIP 组件渲染队列
   */
  getQueue () {
    return window.MIP && MIP.custom && {
      tempQueue: MIP.custom.tempQueue,
      tempData: MIP.custom.tempData
    }
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
      tempQueue.forEach(item => this.render(this.getMatchData(item, data), item))
    }
    this.storeData(data)
  }
}

/**
 * @file mip-ad-ecom 渲染框架, 同步于 mip-custom
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

import url from './url'
import dom from './dom'
import dataProcessor from './data'

let {util, viewer} = MIP
// let logData = dataProcessor.logData
// let performanceData = dataProcessor.performanceData

export default class MIPAdEcom extends MIP.CustomElement {
  /**
   * prerenderAllowed钩子,优先加载
   */
  prerenderAllowed () {
    return true
  }

  /**
   * build钩子，触发渲染. 广告需要尽早执行所以用build
   */
  build () {
    let me = this
    dom.addPlaceholder.apply(this)
    let checkElement = () => {
      if (dom.getConfigScriptElement(me.element)) {
        me.initCustom()
        return true
      }
      console.warn('获取不到配置！！')
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
    let me = this

    // 初始化
    me.initBuild()

    // 异常情况下不展示定制化MIP
    if (!me.isShowCustom()) {
      return
    }
    me.fetchData(me.commonUrl, me.render.bind(me), me.element)
  }

  /**
   * 初始化参数
   *
   */
  initBuild () {
    let me = this
    me.regexs = dataProcessor.regexs
    me.sourceType = me.element.getAttribute('source-type') || ''
    me.commonUrl = url.get(me.element)
  };

  /**
   * 判断是否展示定制化MIP
   *
   * @returns {boolean} isShowCustom 是否展示定制化MIP
   */
  isShowCustom () {
    let me = this
    let isShowCustom = true

    // 非结果页进入不展现定制化内容
    if (!viewer.isIframed) {
      me.element.remove()
      isShowCustom = false
    }
    // 非百度、cache不展现定制化内容
    if (!(me.regexs.domain.test(window.document.referrer) || util.fn.isCacheUrl(window.location.href))) {
      me.element.remove()
      isShowCustom = false
    }
    // 无异步url不展现定制化内容
    if (!me.commonUrl) {
      me.element.remove()
      isShowCustom = false
    }
    return isShowCustom
  }

  /**
   * 渲染
   *
   * @param {Object} data 和模板匹配的数据
   * @param {HTMLElement} element 需要渲染的element
   */
  render (data, element) {
    // let commonData = {}
    let template = {}
    let config
    if (!data || !element) {
      return
    }
    if (data.config) {
      config = dataProcessor.addPaths(data.config)
      require.config(config)
    } else if (dataProcessor.config) {
      config = dataProcessor.addPaths(dataProcessor.config)
      require.config(config)
    }

    // common 数据缓存
    // if (data.common) {
    //   commonData = data.common
    // }

    // 模板数据缓存
    if (data.template) {
      template = data.template
    }

    for (let i = 0; i < template.length; i++) {
      let tplData = template[i]
      let container = document.createElement('div')

      container.setAttribute('mip-ad-ecom-container', i)
      element.appendChild(container)

      // dom 渲染
      dom.render(element, tplData, container)
    }
  }

  /**
   * 获取标签匹配的数据
   *
   * @param   {HTMLElement} element 需要匹配的element
   * @param   {Object} data 所有数据
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
    let me = this
    if (!url) {
      return
    }
    // let errorData = {}
    // fetch
    fetch(url, {
      credentials: 'include'
    }).then(function (res) {
      return res.json()
    }).then(function (data) {
      // 返回数据问题
      if (data && data.errno) {
        console.error(data.errmsg)
        me.element.remove()
        return
      }
      callback && callback(data.data, element)

      // 广告插入页面时，增加渐显效果
      let mipCustomContainers = document.querySelectorAll('[mip-ad-ecom-container]')
      for (let i = mipCustomContainers.length - 1; i >= 0; i--) {
        let mipCustomContainer = mipCustomContainers[i]
        mipCustomContainer.classList.add('fadein')
      }
      dom.removePlaceholder.apply(me)
    }, function (error) {
      me.element.remove()
      console.error(error)
    }).catch(function (err) {
      console.warn(err)
    })
  }

  /**
   * 缓存异步数据
   *
   * @param {Object} data 需要缓存的数据
   */
  storeData (data) {
    let me = this
    let queue = me.getQueue()
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
    let me = this
    let queue = me.getQueue()
    if (!temp || !queue) {
      return
    }
    queue.tempQueue && queue.tempQueue.push(temp)
  }

  /**
   * 获取模板队列和缓存数据状态
   *
   * @returns {boolean} 判断的结果
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
    let me = this
    let queue = me.getQueue()
    let tempQueue = queue && queue.tempQueue
    if (!data) {
      return
    }
    if (tempQueue && tempQueue.length > 0) {
      let tLen = tempQueue.length
      for (let i = 0; i < tLen; i++) {
        let element = tempQueue[i]
        let elementData = me.getMatchData(element, data)
        me.render(elementData, element)
      }
    }
    me.storeData(data)
  }
}

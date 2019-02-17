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

// import tools
const {CustomElement, util} = MIP

export default class MipCustom extends CustomElement {
  prerenderAllowed () {
    return true
  }

  /**
   * [spiderFilter 过滤spider的抓取]
   *
   * @private   spiderFilter  过滤spider的抓取
   * @return    {boolean}     返回当前UA是否命中百度spider
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

    // 渲染广告元素
    this.initElement()
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
    // 添加首帧占位图
    dom.addPlaceholder(this)

    // 参数初始化
    this.position = this.element.getAttribute('position') || ''
    this.sourceType = this.element.getAttribute('source-type') || ''
    // 判断是否在mip-shell中，决定请求传递参数
    this.commonUrl = url.get(this.element)

    // 监听代理 a 标签点击事件
    dom.proxyLink(this.element)

    // fetch-common
    this.fetchData(this.commonUrl)
  }

  /**
   * [fetchData 异步获取数据]
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
      // 模板的前端渲染
      this.render(data.data)
      // 性能日志：按照流量 1/500 发送日志
      log.setPerformanceLogs(performance, data)
    }, error => {
      let {logData = {}} = dataProcessor
      log.sendLog(logData.host, util.fn.extend(logData.error, logData.params, errorData))
      this.element.remove()
      errorData.en = error
      console.error(error)
    }).catch(evt => {
      console.warn(evt)
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
      console.error('common广告模板中公共模块缺失')
      return
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

    // 移除广告占位符号
    dom.removePlaceholder(this)
  }
}

/**
 * @file mip 可视化 vega 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

import './mip-viz-vega.less'
const { CustomElement, util, viewport } = MIP
const logger = util.log('mip-viz-vega')

export default class MipVizVega extends CustomElement {
  constructor (element) {
    super(element)

    /**
     * 图表的数据
     *
     * @type {?Object}
     */
    this.data = null

    /**
     * 存储 script 的数据
     *
     * @type {string}
     */
    this.inlineData = ''

    /**
     * 远程图表数据的链接
     *
     * @type {string}
     */
    this.src = ''

    /**
     * 是否使用自定义的 width 数据
     *
     * @type {boolean}
     */
    this.useDataWidth = false

    /**
     * 是否使用自定义的 height 数据
     *
     * @type {boolean}
     */
    this.useDataHeight = false

    /**
     * 计算后的宽度
     *
     * @type {number}
     */
    this.measuredWidth = 400

    /**
     * 计算后的高度
     *
     * @type {number}
     */
    this.measuredHeight = 400

    /**
     * 数据传入的宽度
     *
     * @type {number}
     */
    this.dataWidth = 0

    /**
     * 数据传入的高度
     *
     * @type {number}
     */
    this.dataHeight = 0

    /**
     * 指定图表的留白
     *
     * @type {?Object}
     */
    this.padding = null

    /**
     * 图表库类
     *
     * @type {?Object}
     */
    this.vega = null

    /**
     * 图表容器
     *
     * @type {?HTMLElement}
     */
    this.container = null
  }

  /**
   * 指定在渲染 layout 的过程中是否出现 loading，默认 true
   *
   * @returns {boolean} 是否展示 loading
   */
  isLoadingEnabled () {
    return true
  }

  /**
   * 引入 vega 库
   */
  loadVega () {
    return new Promise(resolve => {
      window.require(['d3', 'vega'], (d3, vega) => {
        this.vega = vega
        resolve(vega)
      })
    })
  }

  /**
   * layout 渲染完成之后执行的回调
   */
  async layoutCallback () {
    this.initialize()
    try {
      await this.loadVega()
      await this.loadData()
      this.measuredBox()
      if (this.hasGeoProjection()) {
        await import('./libs/d3-geo.min.js')
      }
      await this.renderGraph()
    } catch (err) {
      logger.warn(this.element, err)
    }
  }

  /**
   * 组件初始化
   */
  initialize () {
    this.container = this.element.ownerDocument.createElement('div')
    this.applyFillContent(this.container, true)
    this.element.appendChild(this.container)
    window.require.config({
      paths: {
        'd3': 'http://bos.nj.bpc.baidu.com/mms-res/d3/d3.min',
        'vega': 'https://bos.nj.bpc.baidu.com/mms-res/vega/vega.min'
      }
    })

    window.onresize = () => {
      this.measuredBox()
      this.renderGraph()
    }
  }

  /**
   * 组件初始化渲染
   */
  build () {
    this.inlineData = this.getInlineData()
    this.src = this.element.getAttribute('src')
    this.useDataWidth = this.element.hasAttribute('use-data-width')
    this.useDataHeight = this.element.hasAttribute('use-data-height')
    this.dataWidth = viewport.getWidth()
    this.dataHeight = viewport.getHeight()
  }

  /**
   * 获取 script 的数据内容
   *
   * @returns {string} script 标签中的数据内容
   */
  getInlineData () {
    let script = this.element.querySelector('script[type="application/json"]')
    let data = {}

    if (!script) {
      return
    }
    try {
      data = util.jsonParse(script.textContent)
    } catch (e) {
      logger.warn(this.element, '解析数据出错')
    }

    return data
  }

  /**
   * 载入图表数据，本地载入和远程载入
   */
  async loadData () {
    let data = {}
    let element = this.element

    if (this.inlineData) {
      data = this.inlineData
    } else {
      try {
        let fetchData = await fetch(this.src)
        data = await fetchData.json()
      } catch (err) {
        logger.warn(element, '请求数据出错')
      }
    }

    this.data = data
    this.padding = data.padding
    this.dataWidth = data.width || this.dataWidth
    this.dataHeight = data.height || this.dataHeight
  }

  /**
   * 计算图表容器的宽高
   */
  measuredBox () {
    let box = this.element
    let boxMeasuredWidth = box.clientWidth
    let boxMeasuredHeight = box.clientHeight
    let boxDataWidth = box.getAttribute('width')
    let boxDataHeight = box.getAttribute('height')

    boxMeasuredWidth = this.useDataWidth
      ? this.dataWidth
      : viewport.getWidth()

    if (boxDataWidth && boxDataHeight) {
      boxMeasuredHeight = this.useDataHeight
        ? this.dataHeight
        : (boxMeasuredWidth * boxDataHeight / boxDataWidth)
    } else {
      boxMeasuredHeight = this.useDataHeight ? this.dataHeight : boxDataHeight
    }

    this.measuredHeight = boxMeasuredHeight
    this.measuredWidth = boxMeasuredWidth
  }

  /**
   * 处理留白的配置数据
   *
   * @param   {string} widthOrHeight 指定宽还是高
   * @returns {number} 宽度或者高度留白的数值
   */
  getDataPadding (widthOrHeight) {
    let p = this.padding

    if (typeof p === 'number') {
      return p * 2
    }

    if (typeof p === 'object') {
      if (widthOrHeight === 'width') {
        return (p.left || 0) + (p.right || 0)
      } else if (widthOrHeight === 'height') {
        return (p.top || 0) + (p.bottom || 0)
      }
    }

    return 0
  }

  /**
   * 判断是否要引入 geoProjection
   */
  hasGeoProjection () {
    let datas = this.data.data

    if (!(datas && datas.length > 0)) {
      return false
    }

    for (let data of datas) {
      let transforms = data.transform
      if (!(transforms && transforms.length > 0)) {
        return false
      }
      for (let transform of transforms) {
        if (transform.type === 'geopath') {
          return true
        }
      }
    }

    return false
  }

  /**
   * 渲染图表
   */
  renderGraph () {
    let parsePromise = new Promise((resolve, reject) => {
      this.vega.parse.spec(this.data, (error, chartFactory) => {
        if (error) {
          reject(error)
        }
        resolve(chartFactory)
      })
    })

    return parsePromise.then(chartFactory => {
      let chart = this.chart = chartFactory({
        el: this.container
      })

      if (!this.useDataWidth) {
        let w = this.measuredWidth - this.getDataPadding('width')
        chart.width(w)
      }
      if (!this.useDataHeight) {
        let h = this.measuredHeight - this.getDataPadding('height')
        chart.height(h)
      }

      chart.viewport([this.measuredWidth, this.measuredHeight])
      chart.update()
    })
  }
}

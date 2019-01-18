/**
 * @file mip 可视化 echarts 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

const { CustomElement, util, viewport } = MIP

const logger = util.log('mip-viz-echarts')

export default class MipVizEcharts extends CustomElement {
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
    this.dataWidth = viewport.getWidth()

    /**
     * 数据传入的高度
     *
     * @type {number}
     */
    this.dataHeight = viewport.getHeight()

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
    this.echarts = null

    /**
     * 图表容器
     *
     * @type {?HTMLElement}
     */
    this.container = null

    /**
     * 图标对象
     *
     * @type {?Object}
     */
    this.chart = null
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
   * layout 渲染完成之后执行的回调
   */
  async layoutCallback () {
    this.initialize()
    try {
      await import('./echarts.common.min')
      await this.loadData()
      this.measuredBox()
      this.renderGraph()
    } catch (err) {
      console.error(this.getName() + ': ', err)
    }
  }

  /**
   * 组件初始化
   */
  initialize () {
    this.container = this.element.ownerDocument.createElement('div')
    this.applyFillContent(this.container, true)
    this.element.appendChild(this.container)
  }

  /**
   * 计算图表容器的宽高
   */
  measuredBox () {
    let box = this.element
    let boxMeasuredWidth = box.clientWidth
    let boxMeasuredHeight = box.clientHeight
    let boxWidth = box.getAttribute('width')
    let boxHeight = box.getAttribute('height')

    // 处理隐藏的 layout 的情况
    if (!boxMeasuredWidth) {
      boxMeasuredWidth = this.useDataWidth ? this.dataWidth : viewport.getWidth()
    }
    if (!boxMeasuredHeight) {
      boxMeasuredHeight = this.useDataHeight
        ? this.dataHeight
        : (boxMeasuredWidth * boxHeight / boxWidth)
    }

    this.measuredHeight = boxMeasuredHeight
    this.measuredWidth = boxMeasuredWidth
  }

  /**
   * 组件初始化渲染
   */
  build () {
    this.inlineData = this.getInlineData()
    this.src = this.element.getAttribute('src')
    this.useDataWidth = this.element.hasAttribute('use-data-width')
    this.useDataHeight = this.element.hasAttribute('use-data-height')
  }

  /**
   * 载入图表数据，本地载入和远程载入
   */
  async loadData () {
    let data
    let element = this.element

    if (this.inlineData) {
      try {
        data = util.jsonParse(this.inlineData)
      } catch (e) {
        logger.error(element, '解析数据出错')
      }
    } else {
      try {
        let fetchData = await fetch(this.src)
        data = await fetchData.json()
      } catch (err) {
        logger.error(element, '请求数据出错')
      }
    }

    this.data = data.data || {}
    this.padding = data.padding
    this.dataWidth = data.width || this.dataWidth
    this.dataHeight = data.height || this.dataHeight
  }

  /**
   * 获取 script 的数据内容
   *
   * @returns {string} script 标签中的数据内容
   */
  getInlineData () {
    let script = this.element.querySelector('script[type="application/json"]')
    if (!script) {
      return
    }
    return script.textContent
  }

  /**
   * 处理留白的配置数据
   *
   * @param   {string} widthOrHeight 指定宽还是高
   * @returns {number} 宽度或者高度留白的数值
   */
  getDataPadding (widthOrHeight) {
    let p = this.padding
    if (!p) {
      return 0
    }
    if (typeof p === 'number') {
      return p
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
   * 渲染图表
   */
  renderGraph () {
    if (this.useDataWidth) {
      this.measuredWidth = this.dataWidth
    }
    if (this.useDataHeight) {
      this.measuredHeight = this.dataHeight
    }

    let width = this.measuredWidth - this.getDataPadding('width')
    let height = this.measuredHeight - this.getDataPadding('height')

    this.echarts = window.echarts
    this.chart = this.echarts.init(this.container)
    this.chart.setOption(this.data)
    this.chart.resize({width, height, silent: true})
  }
}

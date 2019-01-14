/**
 * @file mip 可视化 echarts 组件
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global MIP, fetch */

let {
  CustomElement,
  util,
  viewport
} = MIP

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
    let me = this
    me.initialize()
    try {
      await import('./echarts.common.min')
      await me.loadData()
      me.measuredBox()
      me.renderGraph()
    } catch (err) {
      console.error(me.getName() + ': ', err)
    }
  }

  /**
   * 组件初始化
   */
  initialize () {
    let me = this
    me.container = this.element.ownerDocument.createElement('div')
    me.applyFillContent(me.container, true)
    me.element.appendChild(me.container)
  }

  /**
   * 计算图表容器的宽高
   */
  measuredBox () {
    let me = this
    let box = me.element
    let boxMeasuredWidth = box.clientWidth
    let boxMeasuredHeight = box.clientHeight
    let boxWidth = box.getAttribute('width')
    let boxHeight = box.getAttribute('height')

    // 处理隐藏的 layout 的情况
    if (!boxMeasuredWidth) {
      boxMeasuredWidth = me.useDataWidth ? me.dataWidth : viewport.getWidth()
    }
    if (!boxMeasuredHeight) {
      boxMeasuredHeight = me.useDataHeight ? me.dataHeight : (boxMeasuredWidth * boxHeight / boxWidth)
    }

    me.measuredHeight = boxMeasuredHeight
    me.measuredWidth = boxMeasuredWidth
  }

  /**
   * 组件初始化渲染
   */
  build () {
    let me = this
    me.inlineData = me.getInlineData()
    me.src = me.element.getAttribute('src')
    me.useDataWidth = me.element.hasAttribute('use-data-width')
    me.useDataHeight = me.element.hasAttribute('use-data-height')
  }

  /**
   * 载入图表数据，本地载入和远程载入
   */
  async loadData () {
    let me = this
    let data
    if (me.inlineData) {
      try {
        data = util.jsonParse(me.inlineData)
      } catch (e) {
        console.error(me.getName() + ': 解析数据出错')
      }
    } else {
      try {
        let fetchData = await fetch(me.src)
        data = await fetchData.json()
      } catch (err) {
        console.error(me.getName() + ': 请求数据出错')
      }
    }

    me.data = data.data || {}
    me.padding = data.padding
    me.dataWidth = data.width || me.dataWidth
    me.dataHeight = data.height || me.dataHeight
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
   * @param {string} widthOrHeight 指定宽还是高
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
    let me = this
    if (me.useDataWidth) {
      me.measuredWidth = me.dataWidth
    }
    if (me.useDataHeight) {
      me.measuredHeight = me.dataHeight
    }

    let width = me.measuredWidth - me.getDataPadding('width')
    let height = me.measuredHeight - me.getDataPadding('height')

    me.echarts = window.echarts
    me.chart = me.echarts.init(me.container)
    me.chart.setOption(me.data)
    me.chart.resize({width, height, silent: true})
  }

  /**
   * 获取当前组件的名称，用来标识 log
   *
   * @returns {string} 组件的名称
   */
  getName () {
    return 'mip-viz-echarts ' +
      (this.element.getAttribute('id') || '<unknown id>')
  }
}

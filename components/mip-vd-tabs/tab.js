/**
 * @file tab
 * @author zhangjignfeng, convert es module: chenqiushi
 */

/* global $ */

let fn = () => {}
let inter

export default class Tab {
  constructor (panel, options = {}) {
    this.panel = panel
    this.current = options.current || 0 // 当前选中的tab
    this.currentClass = options.currentClass || 'c-tabs-nav-selected'
    this.navWrapperClass = options.navWrapperClass || 'c-tabs-nav'
    this.navClass = options.navClass || 'c-tabs-nav-li'
    this.contClass = options.contClass || 'c-tabs-content'
    this.viewClass = options.viewClass || 'c-tabs-nav-view'
    this.toggleClass = options.toggleClass || 'c-tabs-nav-toggle'
    this.layerClass = options.layerClass || 'c-tabs-nav-layer'
    this.layerUlClass = options.layerUlClass || 'c-tabs-nav-layer-ul'
    this.allowScroll = options.allowScroll || false // 是否允许滚动
    this.toggleMore = options.toggleMore || false // 是否允许切换显示更多
    this.toggleLabel = options.toggleLabel || '请选择' // 切换label
    this.logClass = options.logClass || 'WA_LOG_TAB' // 统计class
    this.scrollSize = options.scrollSize || '-40' // tabs滚动的size

    this.navs = []
    this.seps = []
    this.conts = []
    this.sum = 0 // tab切换次数
    this.last = null // 上次tab切换序号

    // 函数
    this.onChange = options.onChange || fn
    this.onResetChange = options.onResetChange || fn
    this.onTabScrollEnd = options.onTabScrollEnd

    // init
    panel && this._init(options)
  }

  /**
   * 初始化
   */
  _init () {
    let $panel = $(this.panel)

    this.toggle = $panel.find('.' + this.toggleClass) // 更多切换按钮
    this.view = $panel.find('.' + this.viewClass) // nav可视区dom
    this.wrapper = $panel.find('.' + this.navWrapperClass) // nav实际区域dom
    this.navs = this.wrapper.find('.' + this.navClass) // nav项
    this.conts = $panel.find('.' + this.contClass) // tabs内容

    this.sum = this.navs.length

    this._setEvents()
    this.allowScroll && this.view.length && this._setScroll()
    this.toggleMore && this.allowScroll && this.view.length && this._setToggerMore()
  }

  /**
   * 给 $wrapper 嵌套一层指定 class 的 div
   *
   * @param {*} $wrapper 需要嵌套的节点
   */
  _setWrap ($wrapper) {
    $wrapper.children().eq(0).wrap('<div class="mip-vd-tabs-scroll-touch"></div>')
    // UC浏览器对overflow-x兼容性太差,只能用元素占位的方式来解决
    if ($wrapper.children().eq(1).hasClass(this.toggleClass)) {
      $wrapper.find('.' + this.navWrapperClass).append(
        '<div class="mip-vd-tabs-nav-toggle-holder"></div>'
      )
    }
    return $wrapper
  }

  /**
   * 设置 tab 条横向滚动
   */
  _setScroll () {
    this.tabScroll = this._setWrap(this.view)

    // 前置检测选中的tab是否在可视区
    if (this.current > 0 && this.current < this.sum) {
      let currentTab = Math.min(this.current + 1, this.sum - 1)
      slideTo(currentTab, 1, this.navs.eq(this.current), this.navs.length, false)
    }

    // 若tab横滑回调方法存在,执行回调
    if (typeof this.onTabScrollEnd === 'function') {
      this.tabScroll.on('scrollEnd', () => {
        if (this.tabScroll.customFlag && this.tabScroll.customFlag.autoScroll) {
          // 若为自动触发滑动，不执行回调
          return
        }
        this.onTabScrollEnd(this.tabScroll)
      })
    }
  }

  /**
   * 设置展开更多
   */
  _setToggerMore () {
    let $navLayer = $('<div class="' + this.layerClass + '"><p>' + this.toggleLabel + '</p></div>')
    let $navLayerUl = $('<ul class="' + this.layerUlClass + '"></ul>')

    this.toggleState = 0 // 展开状态 0-收起,1-展开

    // 事件代理
    $navLayerUl.on('click', '.' + this.navClass, e => {
      let $domThis = $(e.target)
      // $(this).addClass(_this.currentClass);
      this.navs.eq($domThis.attr('data-tid')).trigger('click')
      toggleUp.call(this)
    })

    this.toggle.on('click', () => this.toggleState === 0 ? toggleDown.call(this) : toggleUp.call(this))

    // 收起
    function toggleUp () {
      $navLayerUl.empty()
      $navLayer.hide()
      this.toggle.css({
        '-webkit-transform': 'scaleY(1)',
        'transform': 'scaleY(1)'
      })
      this.toggleState = 0
    }

    // 展开
    function toggleDown () {
      $navLayerUl.html(this.navs.clone())
      $navLayer.append($navLayerUl)
      this.view.after($navLayer.show())
      this.toggle.css({
        '-webkit-transform': 'scaleY(-1)',
        'transform': 'scaleY(-1)'
      })
      this.toggleState = 1
    }
  }

  /**
   * tab 上的事件绑定
   */
  _setEvents () {
    $.each(this.navs, (i, v) => {
      let $v = $(v)
      if ($v.hasClass(this.currentClass)) {
        this.current = i // 获取当前nav序号
      }

      $v.addClass(this.logClass)
      $v.attr('data-tid', i)

      $v.on('click', () => {
        let tid = parseInt($v.attr('data-tid'))
        if (tid === this.current) {
          return
        }

        this.last = this.current
        this.current = tid

        this.hideTab(this.last)
        this.showTab(this.current)

        if (this.onResetChange === fn) {
          this.hideContent(this.last)
          this.showContent(this.current)

          /* 添加异步处理事件，返回点击tab序号及内容框 */
          this.onChange(this.current, this.conts[this.current])
        } else {
          this.onResetChange(this.current)
        }

        // 滑动对象存在,执行滑动并传递autoScroll标记用于scrollEnd事件判断
        if (this.tabScroll) {
          slideTo(this.current + 1, 1, $v, this.navs.length, true)
        };
      })
    })

    // 第一次加载
    $.each(this.conts, (i, v) => {
      if (i === this.current) {
        this.showTab(i)
        this.showContent(i)
      } else {
        this.hideTab(i)
        this.hideContent(i)
      }
    })
  }

  /**
   * 展示内容
   *
   * @param {number} i 标签序号
   */
  showContent (i) {
    let cont = this.conts[i]
    if (cont) {
      $(this.conts[i]).show()
    }
  }

  /**
   * 隐藏内容
   *
   * @param {number} i 标签序号
   */
  hideContent (i) {
    let cont = this.conts[i]
    if (cont) {
      $(cont).hide()
    }
  }

  /**
   * 展示 Tab
   *
   * @param {number} i tab序号
   */
  showTab (i) {
    let navs = this.navs
    $(navs[i]).addClass(this.currentClass)
  }

  /**
   * 隐藏 Tab
   *
   * @param {number} i tab序号
   */
  hideTab (i) {
    let navs = this.navs
    $(navs[i]).removeClass(this.currentClass)
  }
}

/**
 * 横向滚动
 *
 * @param {number} index 滚动目标序号
 * @param {number} leftNum 滚动数目
 * @param {$} $thisDom dom zepto 对象
 * @param {number} totalNum tab 长度
 * @param {boolean} animate 是否需要动画
 */
function slideTo (index, leftNum, $thisDom, totalNum, animate) {
  let left = 0
  if (index < leftNum) {
    left = 0
  } else if (index >= totalNum - leftNum) {
    left = $thisDom.parent().offset().width
  } else {
    left = $thisDom.offset().left - $thisDom.parent().offset().left - $thisDom.width()
  }
  if (!inter) {
    if (animate) {
      animateSlide($thisDom.parent().parent().scrollLeft(), left, $thisDom.parent().parent())
    } else {
      $thisDom.parent().parent().scrollLeft(left)
    }
  }
}

/**
 * 滚动动画
 *
 * @param {number} start  起点序号
 * @param {number} end 终点序号
 * @param {*} $dom zepto dom
 */
function animateSlide (start, end, $dom) {
  let x = (end - start) / 8
  inter = setInterval(function () {
    let scl = $dom.scrollLeft()

    if ((x > 0 && scl >= end) || x === 0) {
      x = 0
      clearInterval(inter)
    } else if (x < 0 && scl <= end) {
      x = 0
      clearInterval(inter)
    }

    $dom.scrollLeft(scl + x)
  }, 30)
  setTimeout(function () { clearInterval(inter); $dom.scrollLeft(end); inter = null }, 270)
}

/**
 * @file 无限下拉组件
 * @author  wangpei07
 * @date 2017-02-15
 */

let { viewport, util } = MIP
let { css, rect, dom } = util

// 外部数据状态 0-无数据 1-默认(数据情况未知) 2-请求中 3-请求失败(网络原因)
const STATUS_NODATA = 0
const STATUS_DEFAULT = 1
const STATUS_REQUESTING = 2
const STATUS_REQUESTFAILURE = 3

export default class InfiniteScroll {
  constructor (opt) {
    if (!opt.$result || !opt.$loading || !opt.pushResult) {
      return
    }
    let body = document.body

    // 设置默认值
    this.options = Object.assign({
      // 视窗
      $wrapper: window,
      // 滚动容器
      $scroller: body,
      // firstResult支持可选
      firstResult: [],
      // 内容列表每页className
      scrollPageClass: 'mip-infinitescroll-page',
      loadingHtml: '加载中...',
      loadFailHtml: '加载失败,点击重试',
      loadOverHtml: '加载完毕',
      bufferHeightPx: 10,
      pageResultNum: 10,
      limitShowPn: 2,
      preLoadPn: 1
    }, opt)

    this.version = '0.1.0'
    this._init()
  }

  _init () {
    this.eventSpace = '.InfiniteScroll'
    // 标识状态 start-执行 pause-暂停
    this.state = 'start'
    // 每页结果缓存
    this.scrollPageCache = {
      // 结果位置
      topPosition: [],
      // 结果内容
      content: []
    }
    this.dataStatus = STATUS_DEFAULT
    // 当前加载页码,firstResult存在0,否则-1
    this.currentLoadPage = (this.options.firstResult.length) ? 0 : -1
    // 当前用户可视区页码
    this.currentShowPage = 0

    // 执行横屏补丁
    this._horizontalHack()

    // 处理loading区域内容
    this.options.$loading.innerHTML = this.options.loadingHtml
    // 如果firstResult存在,同步加载第0页内容
    if (this.options.firstResult.length) {
      this.scrollPageCache.content = this.scrollPageCache.content.concat(this._separatePage(this.options.firstResult))
      this.options.$result.innerHTML = this._wrapPageParentDom(this.scrollPageCache.content[0], 0)
      this.scrollPageCache.topPosition.push(rect.getElementRect(this.options.$result).top)
    }

    // 初始化全局环境变量 && resize时重新获取环境变量
    this.refresh()
    let eventSpace = this.eventSpace
    window.addEventListener('resize' + eventSpace, () => {
      this.refresh()
    })

    // 翻滚吧
    this._bindScroll()

    // 如果firstResult不存在,调用_scrollBottomFn方法异步加载首屏数据
    if (!this.options.firstResult.length) {
      this._scrollBottomFn()
    }
  }

  /**
   * 重新获取环境变量
   */
  refresh () {
    // 若为暂停状态,什么也不做
    if (this.state === 'pause') {
      return
    }

    // 可视区高度
    this.wrapperHeight = viewport.getHeight()
    // 滚动容器高度
    this.scrollerHeight = this._getScrollerHeight()
    // 当前滚动条位置
    this.currentScrollTop = viewport.getScrollTop()
  }

  destroy () {
    // 注销resize事件
    let eventSpace = this.eventSpace
    window.removeEventListener('resize' + eventSpace)
    // 注销loading上的点击事件
    this.options.$loading.removeEventListener('click' + eventSpace)
    // 删除cache数据
    this.scrollPageCache = null
  }

  /**
   * pause方法,外部接口,用于暂停infiniteScroll
   */
  pause () {
    // 若已经为暂停状态,什么也不做
    if (this.state === 'pause') {
      return
    }

    // 记录当前滚动位置
    this.pauseScrollTop = this.currentScrollTop
    this.state = 'pause'
  }

  /**
   * start方法,外部接口,用于恢复infiniteScroll
   */
  start () {
    // 若已经为执行状态,什么也不做
    if (this.state === 'start') {
      return
    }

    // 恢复滚动位置
    let pauseScrollTop = this.pauseScrollTop
    this.options.$wrapper.scrollTop(pauseScrollTop)

    this.refresh()
    this.state = 'start'
  }

  /**
   * 横屏hack
   * 为保证横屏下滚动容器定位,横竖屏结果高度必须相同
   * 目前百度栅格系统采用流式布局,因此强制横屏下父容器宽度与竖屏相同
   */
  _horizontalHack () {
    let verticalScreenWidth
    if (window.orientation !== undefined) {
      // 安卓某些系统下screen返回的是高分屏尺寸...
      if (window.orientation === 0 || window.orientation === 180) {
        // 竖屏
        verticalScreenWidth = Math.min(window.screen.width, window.innerWidth)
      } else if (window.orientation === 90 || window.orientation === -90) {
        // 横屏
        verticalScreenWidth = Math.min(window.screen.width, window.screen.height)
        verticalScreenWidth = verticalScreenWidth * window.innerWidth / Math.max(window.screen.width, window.screen.height)
      }
    } else {
      // 为防止极个别情况不支持orientation属性(目前未发现)
      // 当不支持orientation且返回高分屏尺寸时,这里会出bug
      verticalScreenWidth = Math.min(window.screen.width, window.screen.height)
    }
    css(this.options.$result, 'max-width', verticalScreenWidth + 'px')
  }

  _bindScroll () {
    viewport.on('scroll', () => {
      // 若为暂停状态,什么也不做
      if (this.state === 'pause') {
        return
      }

      // 获取当前滚动条位置
      this.currentScrollTop = viewport.getScrollTop()
      // 某些浏览器(安卓QQ)滚动时会隐藏头部但不触发resize,需要反复获取
      this.wrapperHeight = viewport.getHeight()

      // 到顶了
      if (this.currentScrollTop <= 0) {
        // 执行回调
        this.options.onScrollTop && this.options.onScrollTop()
      }

      // 到底了
      if (this.currentScrollTop >= this.scrollerHeight - this.wrapperHeight - this.options.bufferHeightPx) {
        this._scrollBottomFn()
        // 执行回调
        this.options.onScrollBottom && this.options.onScrollBottom()
      }

      // 获取当前可视区页码
      let currentShowPage = this.getShowPage()
      // 若页码变化
      if (this.currentShowPage !== currentShowPage) {
        // 执行回调
        this.options.onChangeShowPN && this.options.onChangeShowPN(currentShowPage, this.currentShowPage)
        this.currentShowPage = currentShowPage
        // 清理or回填dom
        if (this.options.limitShowPn) {
          this._cycleScrollElement(currentShowPage)
        }
      }
    })

    // 若初始即不满一屏,trigger scroll事件触发加载
    if (this.currentScrollTop >= this.scrollerHeight - this.wrapperHeight - this.options.bufferHeightPx) {
      viewport.trigger('scroll')
    }
  }

  /**
   * 当滚动条滚动到页面底部时执行
   */
  _scrollBottomFn () {
    // 需要加载的页码(从0计)
    let pn = this.currentLoadPage + 1
    // 已有数据最大页码(从0计)
    let dn = this.scrollPageCache.content.length - 1

    // 还有数据
    if (pn <= dn) {
      this._updateScrollElement(pn)
      // 执行回调
      this.options.onLoadNewPage && this.options.onLoadNewPage(pn)
    }
    // 数据不够 && 数据状态为默认(!无数据 && !请求中 && !请求失败)
    if (this.dataStatus === STATUS_DEFAULT && pn + this.options.preLoadPn >= dn) {
      // 调用cb:pushResult请求新数据,由于数据请求一般为异步,使用Promise对象处理(同时也兼容同步数据返回)
      let dataDeferred = this.options.pushResult((dn + 1) * this.options.pageResultNum, dn - pn)
      // 标记数据状态为请求中
      this.dataStatus = STATUS_REQUESTING
      let self = this
      dataDeferred.then(
        // 成功
        function (newResultArr) {
          // 处理新增数据
          if (newResultArr === false || newResultArr === 'NULL') {
            // 标记数据状态为无数据
            self.dataStatus = STATUS_NODATA
            self.options.$loading.innerHTML = self.options.loadOverHtml
          } else if (newResultArr.length) {
            // 标记数据状态为默认
            self.dataStatus = STATUS_DEFAULT
            // 将新数据合并入数据缓存中
            self.scrollPageCache.content = self.scrollPageCache.content.concat(self._separatePage(newResultArr))
            // trigger scroll事件,确保继续触发数据加载
            viewport.trigger('scroll')
          }
          // 失败
        }, function () {
          // 标记数据状态为请求失败
          self.dataStatus = STATUS_REQUESTFAILURE
          self.options.$loading.innerHTML = self.options.loadFailHtml
          self.once(self.options.$loading, 'click' + self.eventSpace, function () {
            // 标记数据状态为默认
            self.dataStatus = STATUS_DEFAULT
            self.options.$loading.innerHTML = self.options.loadingHtml
            // trigger scroll事件,重新触发数据加载
            viewport.trigger('scroll')
          })
        }
      )
    }
  }

  /**
   * 按页更新滚动元素内容
   *
   * @param {number} pn 页码
   */
  _updateScrollElement (pn) {
    let domNewPage = this._wrapPageParentDom(this.scrollPageCache.content[pn], pn)
    domNewPage = dom.create(domNewPage)
    this.options.$result.appendChild(domNewPage)

    // 更新变量
    this.currentLoadPage = pn
    this.scrollerHeight = this._getScrollerHeight()
    this.scrollPageCache.topPosition.push(rect.getElementRect(domNewPage).top)
  }

  _getScrollerHeight () {
    return viewport.getScrollHeight()
  }

  /**
   * 清理&恢复dom方法
   * IP:[number]当前可视区页码
   * 由于wise性能较差，需要清理掉滚动到可视区外的元素
   *
   * @param {number} pn 页码
   */
  _cycleScrollElement (pn) {
    let recycleClass = 'infinite-recycle'
    let startPage = Math.max(pn - Math.floor((this.options.limitShowPn - 1) / 2), 0)
    // 获取所有结果列表dom
    let domResultElement = this.options.$result.querySelector('.' + this.options.scrollPageClass)
    // 选出当前需要被显示的dom页
    let domShouldShowElement = domResultElement.slice(startPage, startPage + this.options.limitShowPn)

    // todo:这里应该还有优化空间
    if (domResultElement.length) {
      // 恢复:在应该被显示的dom中选出所有带回收标记标签的元素执行恢复操作
      domShouldShowElement.forEach(function () {
        if (this.classList.contains(recycleClass)) {
          this.innerHTML = this.scrollPageCache.content[this.getAttribute('data-page')]
          this.classList.remove(recycleClass)
        }
      }, this)
      // 清理:选出所有不应该被显示的dom,并排除已有回收标记标签的元素,执行清理操作
      let recycleClassElement = document.querySelectorAll('.' + recycleClass)
      domResultElement.removeChild(domShouldShowElement)
      domResultElement.removeChild(recycleClassElement)
      domResultElement.forEach(function () {
        rect.getElementRect(this).height = 0
        this.classList.add(recycleClass)
      }, this)
      // 这里有可能导致整体高度变化,需要重新更新高度
      this.scrollerHeight = this._getScrollerHeight()
    }
  }

  /**
   * 将结果处理成分页的数组结构返回
   * IP:[arr]结果列表html代码片段
   * OP:[arr]按页分割的html代码片段
   *
   * @param {Array} listArr 结果
   * @returns {Array} html array
   */
  _separatePage (listArr) {
    if (!listArr.length || listArr === 'NULL') {
      return
    }
    // 每页结果数
    let pageResultNum = this.options.pageResultNum
    // 分成x页
    let pageNum = Math.ceil(listArr.length / pageResultNum)
    let pageHtmlArr = []
    for (let i = 0; i < pageNum; i++) {
      pageHtmlArr.push(listArr.slice(i * pageResultNum, i * pageResultNum + pageResultNum).join(''))
    }
    return pageHtmlArr
  }

  /**
   * 为每页内容包裹父容器
   * IP:html-[string]一页的html代码片段;pn-[number]当前页码
   * OP:[string]按页包裹完每页父容器的html代码
   *
   * @param {string} html html
   * @param {number} pn 页码
   * @returns {string} 拼接好的html
   */
  _wrapPageParentDom (html, pn) {
    return `<ul class="${this.options.scrollPageClass}" data-page="${pn}">${html}</ul>`
  }

  /**
   * 获取当前可视区页码的方法(从0计)
   *
   * @returns {number} 0 或 1
   */
  getShowPage () {
    let scrollPageCacheTopPosition = this.scrollPageCache.topPosition.concat()
    for (let i = scrollPageCacheTopPosition.length - 1; i >= 0; i--) {
      if (this.currentScrollTop >= scrollPageCacheTopPosition[i]) {
        return i
      }
    }
    return 0
  }

  once (dom, type, callback) {
    let handle = function () {
      callback()
      dom.removeEventListener(type, handle)
    }
    dom.addEventListener(type, handle)
  }
}

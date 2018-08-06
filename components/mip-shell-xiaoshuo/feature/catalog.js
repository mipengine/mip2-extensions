/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */
let util = MIP.util
let rect = util.rect
class Catalog {
  constructor (config, book) {
    // 渲染侧边栏目录元素
    this.$catalogSidebar = this._renderCatalog(config, book)
    // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
  }

  // 根据配置渲染目录侧边栏到 mip-sidebar组件中
  // 支持从页面直接获取目录，异步获取目录
  _renderCatalog (catalogs, book) {
    let renderCatalog
    let title = ''
    let chapterNumber = ''
    if (book) {
      title = book.title
      chapterNumber = book.chapterNumber
    }
    let catalogHtml = `
      <div class="mip-catalog-btn book-catalog-info">
        <div class="catalog-header-wrapper book-catalog-info-header">
          <div class="book-catalog-info-title">
            <p class="book-catalog-title-name catalog-title">${title}</p>
            <div class="catalog-content-total-wrapper">
              <p class="catalog-content-total">${chapterNumber}</p>
            </div>
          </div>
          <div class="catalog-content-center-wrapper">
            <div class="width-50 text-left catalog-content-center-left"><a href="#">目录</a></div>
            <div class="width-50 text-right catalog-content-center-left">
              <a href="#" class="catalog-reserve">
                <i class="icon icon-order reverse-infor"><span class="reverse-name"> 倒序 </span></i>
              </a>
            </div>
            </div>
        </div>
      </div>
      <div class="mip-shell-catalog mip-border mip-border-right">
        <div class="novel-catalog-content-wrapper">
          <div class="novel-catalog-content">
          </div>
          </div>
        </div>
        <div class="scroll">
            <div class="catalog-scroll" >
              <div id="catalog-scroll-btn">
                <div class="scroll-btn"></div>
                <div class="scroll-btn"></div>
                <div class="scroll-btn"></div>
              </div>
            </div>
        </div>    
      </div> 
    `
    if (!catalogs) {
      // 目录配置为空
    } else if (typeof catalogs === 'string') {
      // 目录配置的是字符串，远程地址。需要异步获取

    } else {
      // 目录为数组，本地目录, 直接读取渲染
      renderCatalog = catalogs => catalogs.map(catalog => `
        <div class="catalog-page">
          <a class="mip-catalog-btn catalog-page-content" 
          mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.link}" replace>
          ${catalog.name}
          </a>
        </div>`).join('\n')
    }
    // 将底部 bar 插入到页面中
    let $catalogSidebar = document.querySelector('.mip-shell-catalog-wrapper')
    let hadCatalog = !!$catalogSidebar
    if (!hadCatalog) {
      // 初次见面新建一个wrapper, 二次更新时直接复用
      $catalogSidebar = document.createElement('mip-fixed')
      $catalogSidebar.setAttribute('type', 'left')
      $catalogSidebar.setAttribute('top', '0')
      $catalogSidebar.setAttribute('mip-shell', '')
      $catalogSidebar.classList.add('mip-shell-catalog-wrapper')
      $catalogSidebar.addEventListener('touchmove', e =>
        e.stopPropagation()
      )
    }
    $catalogSidebar.innerHTML = catalogHtml // 目录页HTML
    let $wrapper = $catalogSidebar.querySelector('.novel-catalog-content-wrapper')
    let $catalog = $catalogSidebar.querySelector('.mip-shell-catalog')
    let $contentTop = $catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
    let $catalogScroll = $catalogSidebar.querySelector('.catalog-scroll') // 滚动条
    let $scroll = $catalogSidebar.querySelector('.scroll') // 滚动条
    let $catalogButton = $catalogSidebar.querySelector('#catalog-scroll-btn') // 小按钮
    let $catalogContent = $catalogSidebar.querySelector('.novel-catalog-content')
    $catalogContent.innerHTML = renderCatalog(catalogs)
    let $catalogBook = $catalogSidebar.querySelector('.book-catalog-info-title')
    if (book) {
      $catalogBook.style.display = 'block'
    } else {
      $scroll.style.top = '62px'
      $catalog.style.height = 'calc(100% - 62px)'
      $catalog.style.height = '-webkit-calc(100% - 62px)'
    }

    let catalogScroll = {
      catalogSidebar: $catalogSidebar,
      catalog: $catalog,
      catalogScroll: $catalogScroll,
      catalogButton: $catalogButton,
      contentTop: $contentTop,
      wrapper: $wrapper,
      catalogContent: $catalogContent
    }
    // 自定义滚动条，滑目录内容，右边滚动条到相应位置， 这里需要监听scroll完成事件，用settimeout异步队列模拟，解决兼容问题
    this.catalogScroll(catalogScroll)
    //  实现滚动条拖拽函数，拖动滚动条，左边滑到相应位置
    this.catalogDrag(catalogScroll)
    // 实现倒序，点击倒序，目录顺序倒序，倒序字边正序
    this.reverse($contentTop, $catalogContent)

    if (!hadCatalog) {
      $catalogSidebar.appendChild($catalog)
      document.body.appendChild($catalogSidebar)
    } else {
      // 将 catalog 内容替换为新内容
      $catalogSidebar.removeChild($catalogSidebar.querySelector('.mip-shell-catalog'))
      $catalogSidebar.appendChild($catalog)
    }
    return $catalogSidebar
  }
  /**
   * 函数说明：解决translateY的兼容问题，多次用到，封装函数
   *
   * @param  {Object} $catalogScroll 滚动条
   * @param  {Object} scrollTop 滚动多高
   */
  moveTranslateY ($catalogScroll, scrollTop) {
    $catalogScroll.style.transform = 'translateY( ' + scrollTop + 'px)'
    $catalogScroll.style.WebkitTransform = 'translateY( ' + scrollTop + 'px)'
  }
  /**
   * 函数说明：自定义滚动条，滑目录内容，右边滚动条到相应位置，这里需要监听scroll完成事件，用settimeout异步队列模拟，解决兼容问题
   * @param  {object} $catalogSidebar 整个目录页
   * @param  {object} $catalog        目录页章节
   * @param  {object} $catalogScroll  滚动条
   * @param  {object} $catalogButton  滚动条按钮
   * @param  {object} $contentTop     目录页章节滚动高度
   * @param  {object} $wrapper         章节内容最外边元素
   * @param  {object} $catalogContent 目录页内容
   */
  // this.catalogDrag($catalogSidebar, $catalog, $catalogScroll, $catalogButton, $contentTop, $wrapper, $catalogContent)
  catalogScroll (catalogScroll) {
    let contentTop
    let setTime = null
    let scrollNow
    let $catalog = catalogScroll.catalog
    let $catalogScroll = catalogScroll.catalogScroll
    let $catalogButton = catalogScroll.catalogButton
    let $contentTop = catalogScroll.contentTop
    let $wrapper = catalogScroll.wrapper
    let $catalogContent = catalogScroll.catalogContent
    /**
     * 滑动截止时候让滚动条滚到相应位置
     *
     * @param  {number} 透明度
     * @param  {Object} 目录页距离顶部高度
     * @param  {Object} 章节以上元素的高度
     */
    let scrollToEnd = (opacityNum, Top, Height) => {
      clearTimeout(setTime)
      setTime = setTimeout(() => {
        contentTop = -(rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
        let clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
        let contentHeight = (rect.getElementOffset($catalogContent).height - rect.getElementOffset($catalog).height)
        let scrollTop = clientHeight * contentTop / contentHeight
        if (scrollTop >= clientHeight) {
          scrollTop = clientHeight
        } else if (scrollTop <= 0) {
          scrollTop = 0
        }
        // 解决translateY的兼容问题，方便后续多次用到， 封装函数
        this.moveTranslateY($catalogScroll, scrollTop)
        $catalogScroll.style.opacity = opacityNum
      }, 100)
    }
    $catalogContent.addEventListener('touchstart', (e) => {
      e.stopPropagation()
      $catalogScroll.style.opacity = 0
    })
    $catalogContent.addEventListener('touchend', (e) => {
      e.stopPropagation(e)
      let contentTop = rect.getElementOffset($catalogContent).top // 目录页距离顶部高度
      let contentHeight = rect.getElementOffset($contentTop).height // 章节以上元素的高度
      let isTouchEndOver = Math.abs(scrollNow) - Math.abs(contentTop - contentHeight)
      scrollToEnd(0, contentTop, contentHeight)
      scrollNow = contentTop
      if (isTouchEndOver <= 5 && isTouchEndOver >= -5) scrollToEnd(1, contentTop, contentHeight)
    })
    $catalogContent.addEventListener('touchmove', (e) => {
      e.stopPropagation()
      $catalogScroll.style.opacity = 0
      scrollNow = (rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
    })
    $wrapper.addEventListener('scroll', (e) => {
      e.stopPropagation()
      let contentTop = rect.getElementOffset($catalogContent).top
      let contentHeight = rect.getElementOffset($contentTop).height
      scrollToEnd(1, contentTop, contentHeight)
    })
  }
  /**
   * 函数说明：实现滚动条拖拽函数，拖动滚动条，左边滑到相应位置
   *
   * @param  {Object} $catalogSidebar  整个目录页
   * @param  {Object} $catalog         目录页章节
   * @param  {Object} $catalogScroll   滚动条
   * @param  {Object} $catalogButton   滚动条按钮
   * @param  {Object} $contentTop      目录页章节滚动高度
   * @param  {Object} $wrapper         章节内容最外边元素
   * @param  {Object} $catalogContent  目录页内容
   */
  catalogDrag (catalogScroll) {
    let $catalog = catalogScroll.catalog
    let $catalogScroll = catalogScroll.catalogScroll
    let $catalogButton = catalogScroll.catalogButton
    let $contentTop = catalogScroll.contentTop
    let $catalogContent = catalogScroll.catalogContent
    let touchStartY
    let contentTop
    let clientHeight
    let contentHeight
    let that = this
    $catalogScroll.parentNode.addEventListener('touchstart', (e) => {
      $catalogScroll.style.transition = 'all ease 0'
      $catalogScroll.style.webkitTransition = 'all ease 0'
      // 解决浏览器中出现顶部bar出现或消失时页面高度变化导致高度计算不对问题
      window.onresize = function () {
        $catalogScroll.style.opacity = 1
        contentTop = -(rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
        clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
        contentHeight = (rect.getElementOffset($catalogContent).height - rect.getElementOffset($catalog).height)
      }
      let touch = e.targetTouches[0]
      touchStartY = touch.clientY - rect.getElementOffset($catalogScroll).top
    })
    $catalogScroll.parentNode.addEventListener('touchmove', (e) => {
      $catalogScroll.style.transition = 'all ease 0'
      clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
      let touch = e.targetTouches[0]
      let oTop = touch.clientY - touchStartY
      contentHeight = (rect.getElementOffset($catalogContent).height - rect.getElementOffset($catalog).height)
      contentTop = contentHeight * (oTop - rect.getElementOffset($contentTop).height) / clientHeight
      if (oTop < $contentTop.offsetHeight) {
        oTop = rect.getElementOffset($contentTop).height
      } else if ((oTop - $contentTop.offsetHeight) >= clientHeight) {
        // 解决translateY的兼容问题，多次用到，封装函数
        that.moveTranslateY($catalogScroll, clientHeight)
        return
      }
      let transY = oTop - $contentTop.offsetHeight
      // 解决translateY的兼容问题，多次用到，封装函数
      that.moveTranslateY($catalogScroll, transY)
      $catalogContent.parentNode.scrollTop = contentTop
    })
  }
  /**
   * 函数说明：实现倒序，点击倒序，目录顺序倒序，倒序字边正序
   *
   * @param  {Object} $contentTop      目录页章节滚动高度
   * @param  {Object} $catalogContent  目录页章节高度
   */
  reverse ($contentTop, $catalogContent) {
    let reverse = $contentTop.querySelector('.catalog-reserve')
    reverse.addEventListener('click', () => {
      let catalog = [...$catalogContent.querySelectorAll('div')]
      let reverseName = $contentTop.querySelector('.reverse-name')
      if (reverseName.innerHTML === ' 正序 ') {
        reverseName.innerHTML = ' 倒序 '
      } else {
        reverseName.innerHTML = ' 正序 '
      }
      let Temp = []
      for (let i = 0; i < catalog.length; i++) {
        Temp[i] = catalog[i].innerHTML
      }
      for (let i = 0; i < Temp.length; i++) {
        catalog[i].innerHTML = Temp[Temp.length - 1 - i]
      }
    })
  }

  // 显示侧边目录
  show (shellElement) {
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    // window.setTimeout(function () {
    this.$catalogSidebar.classList.add('show')
    shellElement.toggleDOM(shellElement.$buttonMask, true)
    this.$catalogSidebar.querySelector('.catalog-scroll').style.opacity = 1
    // 处理UC浏览器默认禁止滑动，触发dom变化后UC允许滑动
    let $catalogContent = this.$catalogSidebar.querySelector('.novel-catalog-content')
    let catalog = [...$catalogContent.querySelectorAll('div')]
    for (let i = 0; i < catalog.length; i++) {
      catalog[i].innerHTML = catalog[i].innerHTML
    }

    // }, 400)
  }
  // 隐藏侧边目录
  hide () {
    this.$catalogSidebar.classList.remove('show')
  }
  // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
  _stopPropagation () {
    if (this.propagationStopped) {
      // 由于目录页只有一个，刷新页面时只绑定一次
      return
    }
    // sidebar 绑定一次停止冒泡事件, 防止滚到底部后外层小说内容继续滚动
    this.$catalogSidebar.addEventListener('scroll', (e) => {
      e && e.stopPropagation()
      return false
    })
    return true
  }
}

export default Catalog

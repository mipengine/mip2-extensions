/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */

let util = MIP.util
let rect = util.rect
class Catalog {
  constructor (config) {
    // 渲染侧边栏目录元素
    this.$catalogSidebar = this._renderCatalog(config)
    // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
  }
  // 根据配置渲染目录侧边栏到 mip-sidebar组件中
  // 支持从页面直接获取目录，异步获取目录
  _renderCatalog (catalogs) {
    let renderCatalog
    let catalogHtml = `
      <div class="mip-catalog-btn" style="width:100%; padding-top:0; padding-bottom:0">
        <div class="catalog-header-wrapper" style="display:flex;flex-direction:column;font-size:16px">
          <div>
             <p style="font-size:1.2em;padding-top:1.27em" class="catalog-title">将夜</p>
             <p style="font-size:1em;padding-top: 0.6em;font-family: PingFangSC-Regular;color: #999999;letter-spacing: 0;
             text-align: justify;" class="content-total">已完结 共1342章</p>
          </div>
          <div style="display:flex;display: -webkit-flex;flex-grow:100%;padding:1.89em 0 0.96em" >
            <div class="width-50 text-left"  style="flex-grow:1">目录</div>
            <div class="width-50 text-right"  style="flex-grow:1">
              <a href="#" class="catalog-reserve" style="z-index:9999">
                <i class="icon icon-order"></i>
                <span class="reverse-name">倒序</span>
              </a>
            </div>
            </div>
        </div>
      </div>
      <div class="mip-shell-catalog mip-border mip-border-right" style="">
        <div class="novel-catalog-content-wrapper" >
          <div class="novel-catalog-content">
          </div>
          </div>
        </div>
        <div style="position:absolute;top:10.6em;right:0;z-index:8888">
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
      // 目录为数组，本地目录。直接读取渲染
      renderCatalog = catalogs => catalogs.map(catalog => `
        <div><a class="mip-catalog-btn" mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.link}">${catalog.name}</a></div>`).join('\n')
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
      $catalogSidebar.addEventListener('touchmove', e => {
        e.stopPropagation()
      })
    }
    $catalogSidebar.innerHTML = catalogHtml // 目录页HTML
    let $catalogContent = $catalogSidebar.querySelector('.novel-catalog-content')
    let $catalogScroll = $catalogSidebar.querySelector('.catalog-scroll') // 滚动条
    let $catalogButton = $catalogSidebar.querySelector('#catalog-scroll-btn') // 小按钮
    let $contentTop = $catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
    let $wapper = $catalogSidebar.querySelector('.novel-catalog-content-wrapper')
    let $catalog = $catalogSidebar.querySelector('.mip-shell-catalog')
    $catalogContent.innerHTML = renderCatalog(catalogs)
    // 自定义滚动条，滑目录内容，右边滚动条到相应位置，这里需要监听scroll完成事件，用settimeout异步队列模拟，解决兼容问题
    this.catalogScroll($catalogSidebar, $catalog, $catalogScroll, $catalogButton, $contentTop, $wapper, $catalogContent)
    //  实现滚动条拖拽函数，拖动滚动条，左边滑到相应位置
    this.catalogDrag($catalogSidebar, $catalog, $catalogScroll, $catalogButton, $contentTop, $wapper, $catalogContent)
    // 实现倒序，点击倒序，目录顺序倒序，倒序字边正序
    this.reverse($contentTop, $catalogContent)

    if (!hadCatalog) {
      $catalogSidebar.appendChild($catalog)
      document.body.appendChild($catalogSidebar)
    } else {
      //  将 catalog 内容替换为新内容
      $catalogSidebar.removeChild($catalogSidebar.querySelector('.mip-shell-catalog'))
      $catalogSidebar.appendChild($catalog)
    }
    return $catalogSidebar
  }
  /**
   * 函数说明：解决translateY的兼容问题，多次用到，封装函数
   * @param  {object} $catalogScroll 滚动条
   * @param  {object} scrollTop 滚动多高
   */
  moveTranslateY ($catalogScroll, scrollTop) {
    $catalogScroll.style.transform = 'translateY( ' + scrollTop + 'px)'
    $catalogScroll.style.MsTransform = 'translateY( ' + scrollTop + 'px)'
    $catalogScroll.style.WebkitTransform = 'translateY( ' + scrollTop + 'px)'
    $catalogScroll.style.MozTransform = 'translateY( ' + scrollTop + 'px)'
    $catalogScroll.style.OzTransform = 'translateY( ' + scrollTop + 'px)'
  }
  /**
   * 函数说明：阻止事件冒泡
   * @param  {object} e 事件源
   */
  forbidBubbling (e) {
    e.stopPropagation()
    e.preventDefault()
    window.event ? window.event.returnValue = false : e.preventDefault()
    if (e && e.stopPropagation) {
      e.stopPropagation()
    } else {
      window.event.cancelBubble = true
    }
  }
  /**
   * 函数说明：自定义滚动条，滑目录内容，右边滚动条到相应位置，这里需要监听scroll完成事件，用settimeout异步队列模拟，解决兼容问题
   * @param  {object} $catalogSidebar
   * @param  {object} $catalog
   * @param  {object} $catalogScroll
   * @param  {object} $catalogButton
   * @param  {object} $contentTop
   * @param  {object} $wapper
   * @param  {object} $catalogContent
   * @return {[type]}
   */
  catalogScroll ($catalogSidebar, $catalog, $catalogScroll, $catalogButton, $contentTop, $wapper, $catalogContent) {
    let contentTop
    let setTime = null
    let scrollNow
    $catalogScroll.style.opacity = 1
    // 滑动截止时候让滚动条滚到相应位置
    let scrollToEnd = (opacityNum) => {
      clearTimeout(setTime)
      setTime = setTimeout(() => {
        contentTop = -(rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
        let clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
        let contentHeight = (rect.getElementOffset($catalogContent).height - rect.getElementOffset($catalog).height)
        let scrollTop = clientHeight * contentTop / contentHeight
        $catalogScroll.style.opacity = opacityNum
        if (scrollTop >= clientHeight) {
          scrollTop = clientHeight
        }
        // 解决translateY的兼容问题，方便后续多次用到，封装函数
        this.moveTranslateY($catalogScroll, scrollTop)
      }, 100)
    }
    $catalogContent.addEventListener('touchstart', () => {
      $catalogScroll.style.opacity = 0
    })
    $catalogContent.addEventListener('touchend', () => {
      let isTouchEndOver = Math.abs(scrollNow) - Math.abs(rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
      scrollToEnd(0)
      scrollNow = contentTop
      if (isTouchEndOver <= 5 && isTouchEndOver >= -5) scrollToEnd(1)
    })
    $catalogContent.addEventListener('touchmove', () => {
      $catalogScroll.style.opacity = 0
      scrollNow = (rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
    })
    $wapper.addEventListener('scroll', () => {
      scrollToEnd(1)
    })
  }
  /**
   * 函数说明：实现滚动条拖拽函数，拖动滚动条，左边滑到相应位置
   * @param  {object} $catalogSidebar todo
   * @param  {object} $catalog
   * @param  {object} $catalogScroll
   * @param  {object} $catalogButton
   * @param  {object} $contentTop
   * @param  {object} $wapper
   * @param  {object} $catalogContent
   * @return {[type]}
   */
  catalogDrag ($catalogSidebar, $catalog, $catalogScroll, $catalogButton, $contentTop, $wapper, $catalogContent) {
    let touchStartY
    let contentTop
    let clientHeight
    let contentHeight
    let that = this
    $catalogScroll.parentNode.addEventListener('touchstart', function (e) {
      // 阻止事件冒泡
      that.forbidBubbling(e)
      $catalogScroll.style.transition = 'all ease 0'
      $catalogScroll.style.webkitTransition = 'all ease 0'
      // 解决浏览器中出现顶部bar出现或消失时页面高度变化导致高度计算不对问题
      window.onresize = function () {
        $catalogScroll.style.opacity = 1
        contentTop = -(rect.getElementOffset($catalogContent).top - rect.getElementOffset($contentTop).height)
        clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
        contentHeight = (rect.getElementOffset($catalogContent).height - rect.getElementOffset($catalog).height)
      }
      let ev = e || window.event
      let touch = ev.targetTouches[0]
      touchStartY = touch.clientY - rect.getElementOffset($catalogScroll).top
    })
    $catalogScroll.parentNode.addEventListener('touchmove', function (e) {
      $catalogScroll.style.transition = 'all ease 0'
      clientHeight = rect.getElementOffset($catalog).height - (3 / 2 * rect.getElementOffset($catalogButton).height)
      let ev = e || window.event
      let touch = ev.targetTouches[0]
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
   * @param  {object}
   * @param  {object}
   */
  reverse ($contentTop, $catalogContent) {
    let reverse = $contentTop.querySelector('.catalog-reserve')
    reverse.addEventListener('click', () => {
      let catalog = [...$catalogContent.querySelectorAll('div')]
      let reverseName = $contentTop.querySelector('.reverse-name')
      if (reverseName.innerHTML === '正序') {
        reverseName.innerHTML = '倒序'
      } else {
        reverseName.innerHTML = '正序'
      }
      let Temp = []
      for (let i = 0; i < catalog.length; i++) {
        Temp[i] = catalog[i].innerHTML
      };
      for (let i = 0; i < Temp.length; i++) {
        catalog[i].innerHTML = Temp[Temp.length - 1 - i]
      }
    })
  }
  // 显示侧边目录
  show (shellElement) {
    let me = this
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    // window.setTimeout(function () {
    me.$catalogSidebar.classList.add('show')
    shellElement.toggleDOM(shellElement.$buttonMask, true)
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
      // e && e.preventDefault()
      return false
    })
    return true
  }
}
export default Catalog

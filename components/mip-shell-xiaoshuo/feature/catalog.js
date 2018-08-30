/**
 * file: 小说shell 目录边栏文件
 * author: liangjiaying <jiaojiaomao220@163.com>
 * TODO：
 *     1. catalog数据支持异步获取
 */

let util = MIP.util
class Catalog {
  constructor (config, book) {
    // 渲染侧边栏目录元素
    this.$catalogSidebar = this._renderCatalog(config, book)
    // 禁止冒泡，防止目录滚动到底后，触发外层小说页面滚动
    this.propagationStopped = this._stopPropagation()
    this.nowCatNum = this.getQuery().crid
  }

  /**
   * 通过query获取参数
   *
   * @param  {string} 地址栏链接或自传链接参数
   * @return {Object} 参数对象
   */
  getQuery (url) {
    url = url || location.href
    let query = url.split('?')[1] || ''
    query = query.split('#')[0] || ''
    if (!query) {
      return {}
    }
    return query.split('&').reduce(function (obj, item) {
      let data = item.split('=')
      obj[data[0]] = decodeURIComponent(data[1])
      return obj
    }, {})
  }

  // 根据配置渲染目录侧边栏到  mip-sidebar组件中
  // 支持从页面直接获取目录，异步获取目录
  _renderCatalog (catalogs, book) {
    let renderCatalog
    let isCatFetch = true
    let title = ''
    let chapterStatus = ''
    let chapterNumber = ''
    if (book) {
      title = book.title
      chapterNumber = book.chapterNumber
      chapterStatus = book.chapterStatus
    }
    let catalogHtml = `
      <div class="mip-catalog-btn book-catalog-info">
        <div class="catalog-header-wrapper book-catalog-info-header">
          <div class="book-catalog-info-title">
            <p class="book-catalog-title-name catalog-title">${title}</p>
            <div class="catalog-content-total-wrapper">
              <p class="catalog-content-total"><span>${chapterStatus}</span><span class="chapter-number">${chapterNumber}</span></p>
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
        <!--<div class="scroll">-->
        <!--</div>-->
      </div>
    `
    if (!catalogs) {
      // 目录配置为空
      isCatFetch = false
      MIP.sandbox.fetchJsonp('https://yq01-psdy-diaoyan1016.yq01.baidu.com:8001/novel/api/mipinfo?originUrl=http%3a%2f%2fwww.xmkanshu.com%2fbook%2fmip%2fread%3fbkid%3d672340121%26crid%3d371%26fr%3dxs_aladin_free%26mip%3d1', {
        jsonpCallback: 'callback'
      })
        .then(res => {
          return res.json()
        }).then(data => {
          let $catalogSidebar = document.querySelector('.mip-shell-catalog-wrapper')
          let $contentTop = $catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
          let $catalogContent = $catalogSidebar.querySelector('.novel-catalog-content')
          catalogs = data.data.catalog.chapters
          renderCatalog = catalogs => catalogs.map(catalog => `
        <div class="catalog-page">
          <a class="mip-catalog-btn catalog-page-content"
          mip-catalog-btn mip-link data-button-name="${catalog.name}" href="${catalog.link}" replace>
          ${catalog.name}
          </a>
        </div>`).join('\n')
          $catalogContent.innerHTML = renderCatalog(catalogs)
          this.reverse($contentTop, $catalogContent)
        })
    } else if (catalogs.length === 0) {
      // 目录的长度为0
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
    let $catalog = $catalogSidebar.querySelector('.mip-shell-catalog')
    let $contentTop = $catalogSidebar.querySelector('.mip-catalog-btn') // 上边元素
    let $catalogContent = $catalogSidebar.querySelector('.novel-catalog-content')
    if (isCatFetch) {
      $catalogContent.innerHTML = renderCatalog(catalogs)
      this.reverse($contentTop, $catalogContent)
    }
    let $catalogBook = $catalogSidebar.querySelector('.book-catalog-info-title')
    if (book) {
      $catalogBook.style.display = 'block'
    } else {
      $catalog.style.height = 'calc(100% - 62px)'
      $catalog.style.height = '-webkit-calc(100% - 62px)'
    }

    // 实现倒序，点击倒序，目录顺序倒序，倒序字边正序
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
   * 函数说明：目录消失函数
   *
   * @param  {Object} e      事件源
   * @param  {Object} shellElement 小说章节
   */
  swipeHidden (e, shellElement) {
    e.preventDefault()
    this.hide()
    e.stopPropagation()
    shellElement.toggleDOM(shellElement.$buttonMask, false)
  }
  /**
   * 函数说明：绑定滑动事件，左滑目录消失
   *
   * @param  {Object} shellElement 小说章节
   */
  reverse ($contentTop, $catalogContent) {
    let reverse = $contentTop.querySelector('.catalog-reserve')
    let catalog = $catalogContent.querySelectorAll('div')
    let reverseName = $contentTop.querySelector('.reverse-name')
    let temp = []
    for (let i = 0, len = catalog.length; i < len; i++) {
      temp[i] = catalog[i].outerHTML
    }
    reverse.addEventListener('click', () => {
      $catalogContent.innerHTML = temp.reverse().join('')
      reverseName.innerHTML = reverseName.innerHTML === ' 正序' ? ' 倒序' : ' 正序'
      let catalog = $catalogContent.querySelectorAll('div')
      let $catWrapper = document.querySelector('.novel-catalog-content-wrapper')
      let catLocation = {
        section: this.getQuery().crid,
        page: this.getQuery().pg
      }
      catalog[this.nowCatNum - 1].querySelector('a').classList.remove('active')
      if (reverseName.innerHTML === ' 倒序') {
        catalog[catLocation.section - 1].querySelector('a').classList.add('active')
        this.nowCatNum = catLocation.section
        $catWrapper.scrollTop = catalog[catLocation.section - 1].offsetTop
      } else {
        catalog[catalog.length - catLocation.section].querySelector('a').classList.add('active')
        this.nowCatNum = catLocation.section
        $catWrapper.scrollTop = catalog[catalog.length - catLocation.section].offsetTop
      }
    })
  }

  bindShowEvent (shellElement) {
    let catalog = document.querySelector('.mip-shell-catalog-wrapper')
    let swipeLeft = new util.Gesture(document, {
      preventX: true
    })
    let swipeLeftCatalog = new util.Gesture(catalog, {
      preventX: true
    })
    swipeLeft.on('swipeleft', e => {
      this.swipeHidden(e, shellElement)
    })
    // 解决UC浏览器document不滑动问题
    swipeLeftCatalog.on('swipeleft', e => {
      this.swipeHidden(e, shellElement)
    })
  }
  // 显示侧边目录
  show (shellElement) {
    this.bindShowEvent(shellElement)
    // XXX: setTimeout用于解决tap执行过早，click执行过晚导致的点击穿透事件
    this.$catalogSidebar.classList.add('show')
    // 处理UC浏览器默认禁止滑动，触发dom变化后UC允许滑动
    let $catalogContent = this.$catalogSidebar.querySelector('.novel-catalog-content')
    let $catWrapper = this.$catalogSidebar.querySelector('.novel-catalog-content-wrapper')
    let reverseName = this.$catalogSidebar.querySelector('.reverse-name')
    let catalog = [...$catalogContent.querySelectorAll('div')]
    // 处理UC浏览器默认禁止滑动，触发dom变化后UC允许滑动
    for (let i = 0; i < catalog.length; i++) {
      catalog[i].innerHTML = catalog[i].innerHTML
    }
    let catLocation = {
      section: this.getQuery().crid,
      page: this.getQuery().pg
    }
    document.body.classList.add('body-forbid')
    if (reverseName.innerHTML === ' 正序') {
      catalog[catalog.length - this.nowCatNum].querySelector('a').classList.remove('active')
      catalog[catalog.length - catLocation.section].querySelector('a').classList.add('active')
      this.nowCatNum = catLocation.section
      $catWrapper.scrollTop = catalog[catalog.length - catLocation.section].offsetTop
    } else {
      catalog[this.nowCatNum - 1].querySelector('a').classList.remove('active')
      catalog[catLocation.section - 1].querySelector('a').classList.add('active')
      this.nowCatNum = catLocation.section
      $catWrapper.scrollTop = catalog[catLocation.section - 1].offsetTop
    }
  }
  // 隐藏侧边目录
  hide () {
    document.body.classList.remove('body-forbid')
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
